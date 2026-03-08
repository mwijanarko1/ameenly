import { DuaDeck } from "@/components/DuaDeck";

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
