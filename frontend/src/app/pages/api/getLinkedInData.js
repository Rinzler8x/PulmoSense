import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const linkedInUrl = searchParams.get("url");

  if (!linkedInUrl) {
    return NextResponse.json({ error: "LinkedIn URL is required" }, { status: 400 });
  }

  try {
    const response = await fetch(linkedInUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
    const html = await response.text();

    const nameMatch = html.match(/<title.*?>(.*?)<\/title>/);
    const imageMatch = html.match(/<meta property="og:image" content="(.*?)"/);

    const name = nameMatch ? nameMatch[1].replace(" | LinkedIn", "").trim() : "Unknown";
    const profilePic = imageMatch ? imageMatch[1] : "/placeholder.svg";

    return NextResponse.json({ name, profilePic });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch profile data" }, { status: 500 });
  }
}
