import { ImageResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  try {
    const fontDataBold = await fetch(
      new URL("../../assets/Averta Extra Bold Italic.ttf", import.meta.url),
    ).then((res) => res.arrayBuffer());

    const fontDataRegular = await fetch(
      new URL("../../assets/Averta.ttf", import.meta.url),
    ).then((res) => res.arrayBuffer());

    return new ImageResponse(
      (
        <div
          style={{
            backgroundColor: "#1A202C",
            fontFamily: '"Averta Regular"',
          }}
          tw="text-[#E5E7EB] w-full h-full flex flex-col justify-center items-center"
        >
          <img
            src="https://tixtrend.martinmiglio.dev/logo-gray.svg"
            height={400}
            width={400}
          />

          <h1
            style={{ fontFamily: '"Averta Extra Bold Italic"' }}
            tw="text-9xl"
          >
            TixTrend
          </h1>
          <h2 tw="opacity-30 text-5xl">tixtrend.martinmiglio.dev</h2>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Averta Regular",
            data: fontDataRegular,
            style: "normal",
          },
          {
            name: "Averta Extra Bold Italic",
            data: fontDataBold,
            style: "normal",
          },
        ],
      },
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
