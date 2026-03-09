import { ImageResponse } from "next/og";
import { join } from "node:path";
import { readFile } from "node:fs/promises";

export const alt = "Ameenly — The Online Dua Wall";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logoData = await readFile(join(process.cwd(), "public", "logo.png"), "base64");
  const logoSrc = `data:image/png;base64,${logoData}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #F8FBFF 0%, #DCEBFA 50%, #E8F2FC 100%)",
        }}
      >
        <img src={logoSrc} alt="" width={400} height={400} />
      </div>
    ),
    { ...size }
  );
}
