import { useState } from 'react';
import type { ImageMetadata } from '../types';

interface ImageCardProps {
  image: ImageMetadata;
  onDelete: (image: ImageMetadata) => void;
  isDeleting: boolean;
}

export function ImageCard({ image, onDelete, isDeleting }: ImageCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatDate = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(image.url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete(image);
    setShowConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-[1.02]">
      {/* Image */}
      <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">🖼️</div>
              <p className="text-sm">Image not available</p>
            </div>
          </div>
        ) : (
          <img
            src={image.url}
            alt={image.description || image.filename}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        )}
        
        {/* Deleting Overlay */}
        {isDeleting && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-white flex items-center gap-2">
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
              Deleting...
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Description */}
        <p className="text-gray-800 dark:text-white font-medium mb-2 line-clamp-2">
          {image.description || 'No description'}
        </p>

        {/* Timestamp */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          {formatDate(image.timestamp)}
        </p>

        {/* URL */}
        <div className="mb-4">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">URL:</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={image.url}
              readOnly
              className="flex-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-200 
                         dark:border-gray-600 rounded text-xs text-gray-600 dark:text-gray-300 truncate"
            />
            <button
              onClick={handleCopyUrl}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                copySuccess
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200'
              }`}
            >
              {copySuccess ? '✓' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Actions */}
        {!showConfirm ? (
          <button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 disabled:bg-red-300 
                       text-white rounded-lg font-medium transition-colors"
          >
            Delete
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-center text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this image?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleCancelDelete}
                className="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 
                           dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg 
                           font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg 
                           font-medium transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
