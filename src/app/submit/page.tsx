import { SubmitDuaCard } from "@/components/SubmitDuaCard";

export const metadata = {
    title: "Submit a Dua | Ameenly",
    description:
        "Share your dua on the public wall for others to say Ameen.",
};

export default function SubmitPage() {
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
