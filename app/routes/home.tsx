import type { Route } from "./+types/home";
import { ImageManager } from "../components/ImageManager";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "GitHub Images Manager" },
    { name: "description", content: "Upload and manage images in your GitHub repository" },
  ];
}

export default function Home() {
  return <ImageManager />;
}
