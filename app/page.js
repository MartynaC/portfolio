import HomeClient from "./home-client";

export const metadata = {
  title: "Frontend Developer, Creative Coder Portfolio",
};

export default async function Page({ searchParams }) {
  const params = await searchParams;
  const view = params?.view;
  return (
    <HomeClient
      showProjects={view === "projects"}
      showDevelopment={view === "development"}
      showAbout={view === "about"}
      showContact={view === "contact"}
    />
  );
}
