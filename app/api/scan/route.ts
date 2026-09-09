import { NextRequest, NextResponse } from "next/server";
import { demoListings, searchEbay } from "@/lib/ebay";
import { scoreDeals } from "@/lib/radar";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query || query.length < 2) {
    return NextResponse.json({ error: "Enter a product to scan." }, { status: 400 });
  }

  try {
    const liveListings = await searchEbay(query);
    const mode = liveListings ? "live" : "demo";
    const listings = liveListings ?? demoListings(query);
    const deals = scoreDeals(listings);

    return NextResponse.json({
      query,
      mode,
      scanned: listings.length,
      deals,
      note:
        mode === "live"
          ? "Live eBay GB listings. Market value is currently estimated from comparable active listings, not completed sales."
          : "Demo data is active. Add eBay production credentials to enable live scanning.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Scan failed." },
      { status: 500 },
    );
  }
}
