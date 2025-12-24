import { useState } from 'react';
import { UploadComponent } from '../components/UploadComponent';
import { GalleryComponent } from '../components/GalleryComponent';

export function ImageManager() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    // Trigger gallery refresh
    setRefreshTrigger((prev) => prev + 1);
  };

  // Check for environment variables
  const hasConfig =
    import.meta.env.VITE_GITHUB_TOKEN && import.meta.env.VITE_GITHUB_REPO;

  if (!hasConfig) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Configuration Required
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Please set up your environment variables to use the GitHub Images Manager.
          </p>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-left">
            <p className="text-sm font-mono text-gray-700 dark:text-gray-300 mb-2">
              Create a <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">.env</code> file with:
            </p>
            <pre className="text-sm font-mono text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
{`VITE_GITHUB_TOKEN=your_github_token
VITE_GITHUB_REPO=username/repository
VITE_GITHUB_BRANCH=main`}
            </pre>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            You'll need a GitHub Personal Access Token with{' '}
            <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded text-xs">repo</code> scope.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🖼️</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                GitHub Images Manager
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Upload and manage images in your GitHub repository
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <UploadComponent onUploadSuccess={handleUploadSuccess} />
        <GalleryComponent refreshTrigger={refreshTrigger} />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            GitHub Images Manager • Store your images directly in GitHub
          </p>
        </div>
      </footer>
    </div>
  );
}
