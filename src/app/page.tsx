import type { Metadata } from "next";
import { DuaDeck } from "@/components/DuaDeck";

export const metadata: Metadata = {
  title: "Ameenly — The Online Dua Wall | Share Duas, Say Ameen",
  description:
    "Ameenly is the free online dua wall for Muslims. Post a dua and let the community say Ameen. Browse duas, pray for others, and join private dua circles. The dua wall app — also searched as DuaWall.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Ameenly — The Online Dua Wall | Share Duas, Say Ameen",
    description:
      "Post a dua and let the community say Ameen. Browse duas, pray for others, and join private dua circles. The free dua wall for Muslims.",
    type: "website",
  },
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: Props) {
  await searchParams;
  return (
    <main id="main-content">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
          paddingBottom: "24px",
        }}
      >
        <DuaDeck mode="public" />
      </div>
    </main>
  );
}
