export function Hero() {
  return (
    <section
      style={{
        position: "relative",
        display: "flex",
        minHeight: "40vh",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: "var(--bg-deep)",
      }}
    >
      <div
        style={{
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "64px 24px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "1.5rem", color: "var(--text-secondary)", marginBottom: "16px" }} dir="rtl">
          بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
        </p>
        <h1
          style={{
            fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
            fontWeight: 800,
            marginBottom: "24px",
            lineHeight: 1.1,
            color: "var(--text-primary)",
          }}
        >
          Ameen<span style={{ color: "var(--text-accent)" }}>ly</span>
        </h1>
        <p
          style={{
            fontSize: "1.25rem",
            marginBottom: "16px",
            color: "var(--text-primary)",
            maxWidth: "640px",
          }}
        >
          Share duas. Make duas for others.
        </p>
        <p style={{ color: "var(--text-secondary)", maxWidth: "560px" }}>
          Submit your dua to the public wall or create a private group for family and friends.
        </p>
      </div>
    </section>
  );
}
