import HomeClient from "./home-client";

export const metadata = {
  title: "Frontend Developer, Creative Coder Portfolio",
};

export default async function Page({ searchParams }) {
  const params = await searchParams;
  return <HomeClient showProjects={params?.view === "projects"} />;
}
