import { useState, useRef, useCallback } from 'react';
import { uploadImage, validateImageFile } from '../services/github';

interface UploadComponentProps {
  onUploadSuccess: () => void;
}

export function UploadComponent({ onUploadSuccess }: UploadComponentProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setMessage({ type: 'error', text: validation.error! });
      return;
    }

    setSelectedFile(file);
    setMessage(null);
    setUploadedUrl(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select an image to upload.' });
      return;
    }

    setIsUploading(true);
    setMessage(null);
    setUploadedUrl(null);

    try {
      const result = await uploadImage(selectedFile, description);

      if (result.success && result.url) {
        setMessage({ type: 'success', text: 'Image uploaded successfully!' });
        setUploadedUrl(result.url);
        setSelectedFile(null);
        setPreview(null);
        setDescription('');
        onUploadSuccess();
      } else {
        setMessage({ type: 'error', text: result.error || 'Upload failed.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred during upload.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyUrl = async () => {
    if (uploadedUrl) {
      try {
        await navigator.clipboard.writeText(uploadedUrl);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to copy URL to clipboard.' });
      }
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
    setDescription('');
    setMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Upload Image</h2>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
          ${isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
          }
        `}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif"
          onChange={handleInputChange}
          className="hidden"
        />

        {preview ? (
          <div className="space-y-4">
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 mx-auto rounded-lg shadow-md"
            />
            <p className="text-gray-600 dark:text-gray-300">{selectedFile?.name}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearSelection();
              }}
              className="text-red-500 hover:text-red-600 text-sm font-medium"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-5xl">📷</div>
            <p className="text-gray-600 dark:text-gray-300">
              Drag and drop an image here, or click to select
            </p>
            <p className="text-sm text-gray-400">
              Supports: JPG, PNG, GIF (max 10MB)
            </p>
          </div>
        )}
      </div>

      {/* Description Input */}
      <div className="mt-6">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Description (optional)
        </label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter image description..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-700 text-gray-800 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
        className={`
          mt-6 w-full py-3 px-4 rounded-lg font-semibold text-white transition-all
          ${!selectedFile || isUploading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
          }
        `}
      >
        {isUploading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Uploading...
          </span>
        ) : (
          'Upload Image'
        )}
      </button>

      {/* Message */}
      {message && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Uploaded URL with Copy Button */}
      {uploadedUrl && (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Image URL:
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={uploadedUrl}
              readOnly
              className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 
                         dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300"
            />
            <button
              onClick={handleCopyUrl}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                copySuccess
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {copySuccess ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
