import { getEventByKeyword } from "@/api/get-event";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const hasKeyword = req.nextUrl.searchParams.has("keyword");

  if (!hasKeyword) {
    return NextResponse.error();
  }

  const keyword = hasKeyword
    ? req.nextUrl.searchParams.get("keyword")
    : undefined;

  const hasPage = req.nextUrl.searchParams.has("page");
  const page = hasPage
    ? parseInt(req.nextUrl.searchParams.get("page") ?? "0")
    : 0;

  const events = await getEventByKeyword(keyword as string, page);

  if (!events) {
    return NextResponse.error();
  }

  return NextResponse.json(events);
}
