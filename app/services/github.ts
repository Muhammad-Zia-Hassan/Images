import axios, { AxiosError } from 'axios';
import type { ImageMetadata, MetadataFile, GitHubFileResponse, UploadResult, DeleteResult } from '../types';

const GITHUB_API_BASE = 'https://api.github.com';

// Get environment variables
const getConfig = () => {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  const repo = import.meta.env.VITE_GITHUB_REPO;
  const branch = import.meta.env.VITE_GITHUB_BRANCH || 'main';

  if (!token || !repo) {
    throw new Error('Missing required environment variables: VITE_GITHUB_TOKEN and VITE_GITHUB_REPO');
  }

  return { token, repo, branch };
};

// Create axios instance with auth headers
const createApiClient = () => {
  const { token } = getConfig();
  return axios.create({
    baseURL: GITHUB_API_BASE,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
  });
};

// Get GitHub URL for an image (clean format without raw)
const getGitHubUrl = (filename: string): string => {
  const { repo, branch } = getConfig();
  return `https://github.com/${repo}/blob/${branch}/images/${filename}?raw=true`;
};

// Fetch file from GitHub (with cache busting)
export const fetchFile = async (path: string): Promise<GitHubFileResponse | null> => {
  try {
    const { repo, branch } = getConfig();
    const api = createApiClient();
    // Add timestamp to prevent caching issues
    const response = await api.get(`/repos/${repo}/contents/${path}?ref=${branch}&t=${Date.now()}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

// Fetch metadata.json
export const fetchMetadata = async (): Promise<MetadataFile> => {
  try {
    const file = await fetchFile('metadata.json');
    if (!file) {
      return { images: [] };
    }
    const content = atob(file.content);
    return JSON.parse(content);
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return { images: [] };
  }
};

// Create or update a file in GitHub
const createOrUpdateFile = async (
  path: string,
  content: string,
  message: string,
  sha?: string
): Promise<GitHubFileResponse> => {
  const { repo, branch } = getConfig();
  const api = createApiClient();

  const payload: Record<string, string> = {
    message,
    content: btoa(content),
    branch,
  };

  if (sha) {
    payload.sha = sha;
  }

  const response = await api.put(`/repos/${repo}/contents/${path}`, payload);
  return response.data;
};

// Upload image to GitHub
export const uploadImage = async (
  file: File,
  description: string
): Promise<UploadResult> => {
  try {
    const { repo, branch } = getConfig();
    const api = createApiClient();

    // Generate unique filename
    const timestamp = new Date().toISOString();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${Date.now()}_${sanitizedName}`;
    const path = `images/${filename}`;

    // Convert file to base64
    const base64Content = await fileToBase64(file);

    // Upload image
    const uploadResponse = await api.put(`/repos/${repo}/contents/${path}`, {
      message: `Upload image: ${filename}`,
      content: base64Content,
      branch,
    });

    const imageUrl = getGitHubUrl(filename);

    // Update metadata - fetch fresh to get latest SHA
    const existingMetadataFile = await fetchFile('metadata.json');
    let metadata: MetadataFile = { images: [] };
    
    if (existingMetadataFile) {
      try {
        const content = atob(existingMetadataFile.content);
        metadata = JSON.parse(content);
      } catch {
        metadata = { images: [] };
      }
    }

    const newImage: ImageMetadata = {
      filename,
      description,
      url: imageUrl,
      timestamp,
      sha: uploadResponse.data.content.sha,
    };
    metadata.images.unshift(newImage);

    // Update metadata with correct SHA
    await createOrUpdateFile(
      'metadata.json',
      JSON.stringify(metadata, null, 2),
      `Add image: ${filename}`,
      existingMetadataFile?.sha
    );

    return { success: true, url: imageUrl };
  } catch (error) {
    console.error('Upload error:', error);
    const message = getErrorMessage(error);
    return { success: false, error: message };
  }
};

// Delete image from GitHub
export const deleteImage = async (image: ImageMetadata): Promise<DeleteResult> => {
  try {
    const { repo, branch } = getConfig();
    const api = createApiClient();

    // Step 1: Get current image file SHA and delete the image
    const imagePath = `images/${image.filename}`;
    const imageFile = await fetchFile(imagePath);

    if (imageFile) {
      // Delete the image file from GitHub
      await api.delete(`/repos/${repo}/contents/${imagePath}`, {
        data: {
          message: `Delete image: ${image.filename}`,
          sha: imageFile.sha,
          branch,
        },
      });
    }

    // Step 2: Get fresh metadata with current SHA
    const metadataFile = await fetchFile('metadata.json');
    
    if (!metadataFile) {
      // No metadata file exists, nothing to update
      return { success: true };
    }

    // Parse current metadata
    let metadata: MetadataFile;
    try {
      const content = atob(metadataFile.content);
      metadata = JSON.parse(content);
    } catch {
      metadata = { images: [] };
    }

    // Remove the deleted image from metadata
    metadata.images = metadata.images.filter((img) => img.filename !== image.filename);

    // Step 3: Update metadata.json with the correct SHA
    await createOrUpdateFile(
      'metadata.json',
      JSON.stringify(metadata, null, 2),
      `Remove image: ${image.filename}`,
      metadataFile.sha
    );

    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    const message = getErrorMessage(error);
    return { success: false, error: message };
  }
};

// Convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Get user-friendly error message
const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    if (axiosError.response?.status === 401) {
      return 'Authentication failed. Please check your GitHub token.';
    }
    if (axiosError.response?.status === 403) {
      return 'Access denied. Your token may lack the required permissions.';
    }
    if (axiosError.response?.status === 404) {
      return 'Repository not found. Please check the repository name.';
    }
    if (axiosError.response?.status === 422) {
      return 'File already exists or invalid request.';
    }
    return axiosError.response?.data?.message || axiosError.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred.';
};

// Validate image file
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPG, PNG, or GIF image.',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds 10MB limit. Please choose a smaller image.',
    };
  }

  return { valid: true };
};
