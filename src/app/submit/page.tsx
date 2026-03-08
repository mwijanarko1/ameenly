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
