import HomeClient from "./home-client";
import { listRandomMedia } from "./lib/r2";

export const metadata = {
  title: "Creative technologist, Visual Artist — Martyna Chojnacka",
};

export default async function Page({ searchParams }) {
  const params = await searchParams;
  const view = params?.view;
  const randomImages = view === "random" ? await listRandomMedia() : [];
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
