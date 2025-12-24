export interface ImageMetadata {
  filename: string;
  description: string;
  url: string;
  timestamp: string;
  sha?: string;
}

export interface MetadataFile {
  images: ImageMetadata[];
}

export interface GitHubFileResponse {
  content: string;
  sha: string;
  name: string;
  path: string;
  download_url: string;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}
