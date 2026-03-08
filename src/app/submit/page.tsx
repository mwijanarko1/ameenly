import { SubmitDuaCard } from "@/components/SubmitDuaCard";

export const metadata = {
    title: "Submit a Dua | Ameenly",
    description:
        "Share your dua on the public wall for others to say Ameen.",
};

type Props = {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SubmitPage({ searchParams }: Props) {
    await searchParams;
    return (
        <main
            id="main-content"
            className="page-container"
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "70dvh",
                paddingBottom: "120px",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "480px",
                }}
            >
                <SubmitDuaCard />
            </div>
        </main>
    );
}
