import fs from "fs";
import path from "path";
import HomeClient from "./home-client";

export const metadata = {
  title: "Creative technologist, Visual Artist — Martyna Chojnacka",
};

const MEDIA_EXTS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp4", ".mov", ".webm"]);

function readMediaDir(folder) {
  const dir = path.join(process.cwd(), "public", "images", folder);
  try {
    return fs.readdirSync(dir).filter((f) => MEDIA_EXTS.has(path.extname(f).toLowerCase()));
  } catch {
    return [];
  }
}

export default async function Page({ searchParams }) {
  const params = await searchParams;
  const view = params?.view;
  const randomImages = view === "random" ? readMediaDir("random") : [];
  return (
    <HomeClient
      showProjects={view === "projects"}
      showDevelopment={view === "development"}
      showAbout={view === "about"}
      showContact={view === "contact"}
      showRandom={view === "random"}
      randomImages={randomImages}
    />
  );
}
