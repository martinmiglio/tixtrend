import { baseURL } from "@/consts";
import { Resvg } from "@resvg/resvg-js";
import { createFileRoute } from "@tanstack/react-router";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import satori from "satori";

export const Route = createFileRoute("/og/")({
  server: {
    handlers: {
      GET: async () => {
        try {
          // Get current file directory
          const __dirname = dirname(fileURLToPath(import.meta.url));

          // Load fonts
          const fontBoldPath = join(
            __dirname,
            "../../assets/Averta Extra Bold Italic.ttf",
          );
          const fontRegularPath = join(__dirname, "../../assets/Averta.ttf");

          const fontBold = readFileSync(fontBoldPath);
          const fontRegular = readFileSync(fontRegularPath);

          // Load logo and convert to data URL
          const logoPath = join(__dirname, "../../../public/logo-gray.svg");
          const logo = readFileSync(logoPath, "utf-8");
          const logoDataUrl = `data:image/svg+xml;base64,${Buffer.from(logo).toString("base64")}`;

          // Generate SVG with satori (using plain object structure)
          const svg = await satori(
            <div
              style={{
                backgroundColor: "#1A202C",
                fontFamily: '"Averta Regular"',
                color: "#E5E7EB",
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src={logoDataUrl}
                height={400}
                width={400}
                alt="TixTrend Logo"
              />
              <h1
                style={{
                  fontFamily: '"Averta Extra Bold Italic"',
                  fontSize: "144px",
                  margin: 0,
                }}
              >
                TixTrend
              </h1>
              <h2
                style={{
                  opacity: 0.3,
                  fontSize: "60px",
                  margin: 0,
                }}
              >
                {baseURL.hostname}
              </h2>
            </div>,
            {
              width: 1200,
              height: 630,
              fonts: [
                {
                  name: "Averta Regular",
                  data: fontRegular,
                  style: "normal",
                },
                {
                  name: "Averta Extra Bold Italic",
                  data: fontBold,
                  style: "normal",
                },
              ],
            },
          );

          // Convert SVG to PNG using Resvg
          const resvg = new Resvg(svg, {
            fitTo: {
              mode: "width",
              value: 1200,
            },
          });
          const pngBuffer = resvg.render().asPng();

          return new Response(new Uint8Array(pngBuffer), {
            headers: {
              "Content-Type": "image/png",
              "Cache-Control": "public, max-age=3600",
            },
          });
        } catch (e) {
          const errorMessage = e instanceof Error ? e.message : "Unknown error";
          console.error("OG image generation failed:", errorMessage);
          return new Response(`Failed to generate the image: ${errorMessage}`, {
            status: 500,
          });
        }
      },
    },
  },
});
