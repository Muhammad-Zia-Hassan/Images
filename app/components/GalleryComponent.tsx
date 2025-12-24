import { useState, useEffect, useCallback } from 'react';
import { fetchMetadata, deleteImage } from '../services/github';
import { ImageCard } from './ImageCard';
import type { ImageMetadata } from '../types';

interface GalleryComponentProps {
  refreshTrigger: number;
}

export function GalleryComponent({ refreshTrigger }: GalleryComponentProps) {
  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingImage, setDeletingImage] = useState<string | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadImages = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const metadata = await fetchMetadata();
      setImages(metadata.images || []);
    } catch (err) {
      console.error('Error loading images:', err);
      setError('Failed to load images. Please check your configuration.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadImages();
  }, [loadImages, refreshTrigger]);

  const handleDelete = async (image: ImageMetadata) => {
    setDeletingImage(image.filename);
    setDeleteMessage(null);

    try {
      const result = await deleteImage(image);

      if (result.success) {
        setImages((prev) => prev.filter((img) => img.filename !== image.filename));
        setDeleteMessage({ type: 'success', text: 'Image deleted successfully!' });
        setTimeout(() => setDeleteMessage(null), 3000);
      } else {
        setDeleteMessage({ type: 'error', text: result.error || 'Failed to delete image.' });
      }
    } catch (err) {
      setDeleteMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setDeletingImage(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Gallery</h2>
        <button
          onClick={loadImages}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 
                     rounded-lg text-gray-700 dark:text-gray-200 font-medium transition-colors
                     disabled:opacity-50 flex items-center gap-2"
        >
          <svg
            className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Delete Message */}
      {deleteMessage && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            deleteMessage.type === 'success'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          }`}
        >
          {deleteMessage.text}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <svg
              className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-4"
              viewBox="0 0 24 24"
            >
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
            <p className="text-gray-500 dark:text-gray-400">Loading images...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && images.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🖼️</div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">No images yet</p>
          <p className="text-gray-400 dark:text-gray-500 mt-2">
            Upload your first image to get started!
          </p>
        </div>
      )}

      {/* Image Grid */}
      {!isLoading && images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <ImageCard
              key={image.filename}
              image={image}
              onDelete={handleDelete}
              isDeleting={deletingImage === image.filename}
            />
          ))}
        </div>
      )}
    </div>
  );
}
