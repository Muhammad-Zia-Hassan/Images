<<<<<<< HEAD
# Images
# Welcome to React Router!
=======
# GitHub Images Manager
>>>>>>> 81cd7c2 (Add React GitHub Images Manager app)

A full-stack React application for managing images stored in a GitHub repository. Upload, view, and delete images directly from your browser with automatic metadata tracking.

## Features

- 🖼️ **Upload Images** - Drag-and-drop or file picker with preview
- 📋 **Copy URL** - One-click copy of raw GitHub URL for direct use
- 🖥️ **Gallery View** - Browse all uploaded images with descriptions and timestamps
- 🗑️ **Delete Images** - Remove images with confirmation dialog
- 📝 **Auto Metadata** - Automatic `metadata.json` tracking for all images
- 🌙 **Dark Mode** - Automatic dark mode support
- 📱 **Responsive** - Works on desktop and mobile devices
- ⚡ **Real-time Updates** - Gallery updates immediately after uploads

## Getting Started

### Prerequisites

1. A GitHub account
2. A GitHub repository to store images
3. A GitHub Personal Access Token with `repo` scope

### Create a GitHub Personal Access Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "Images Manager")
4. Select the `repo` scope (full control of private repositories)
5. Click "Generate token"
6. Copy the token (you won't be able to see it again!)

### Installation

Install the dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# GitHub Personal Access Token with 'repo' scope
VITE_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# GitHub repository in format: username/repository-name
VITE_GITHUB_REPO=your-username/your-images-repo

# Branch to store images (default: main)
VITE_GITHUB_BRANCH=main
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Vercel Deployment

1. Push your code to a GitHub repository
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Project Settings:
   - `VITE_GITHUB_TOKEN`
   - `VITE_GITHUB_REPO`
   - `VITE_GITHUB_BRANCH`
4. Deploy!

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## How It Works

### File Storage Structure

Images are stored in your GitHub repository under the `images/` folder:

```
your-repo/
├── images/
│   ├── 1703430000000_photo.jpg
│   ├── 1703430001000_screenshot.png
│   └── ...
└── metadata.json
```

### Metadata Format

The `metadata.json` file tracks all uploaded images:

```json
{
  "images": [
    {
      "filename": "1703430000000_photo.jpg",
      "description": "My vacation photo",
      "url": "https://raw.githubusercontent.com/user/repo/main/images/1703430000000_photo.jpg",
      "timestamp": "2024-12-24T10:00:00.000Z"
    }
  ]
}
```

## Supported File Types

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)

Maximum file size: 10MB

## Tech Stack

- **React 19** - UI framework
- **React Router 7** - Routing and SSR
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Vite** - Build tool

## Security Notes

⚠️ **Important**: Your GitHub token is exposed in the browser. This app is designed for personal use only. For production applications with multiple users, implement a backend to securely handle GitHub API calls.

## License

MIT

---

Built with ❤️ using React Router.
