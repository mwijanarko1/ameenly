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

export default function Home() {
  return (
    <main id="main-content" className="homepage-main">
      <div className="homepage-inner">
        <DuaDeck mode="public" />
      </div>
    </main>
  );
}
