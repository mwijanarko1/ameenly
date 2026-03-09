import { SubmitDuaCard } from "@/components/SubmitDuaCard";

export const metadata = {
    title: "Submit a Dua — Share Your Prayer on the Dua Wall",
    description:
        "Submit your dua to the Ameenly dua wall. Share a prayer request and receive duas from Muslims around the world. Your dua is just one Ameen away.",
    alternates: {
        canonical: "/submit",
    },
    openGraph: {
        title: "Submit a Dua — Share Your Prayer on the Dua Wall",
        description:
            "Post your dua to the Ameenly dua wall. Share a prayer request and receive duas from Muslims around the world.",
        type: "website",
    },
};

export default function SubmitPage() {
    return (
        <main
            id="main-content"
            className="page-container submit-page-main"
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
                className="submit-card-wrapper"
                style={{
                    width: "fit-content",
                    maxWidth: "100%",
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <SubmitDuaCard />
            </div>
        </main>
    );
}
