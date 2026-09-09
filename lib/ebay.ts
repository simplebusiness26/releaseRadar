import type { Listing } from "./radar";

const EBAY_TOKEN_URL = "https://api.ebay.com/identity/v1/oauth2/token";
const EBAY_SEARCH_URL = "https://api.ebay.com/buy/browse/v1/item_summary/search";

async function getApplicationToken() {
  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(EBAY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: "https://api.ebay.com/oauth/api_scope",
    }),
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`eBay OAuth failed (${response.status})`);
  const payload = await response.json();
  return payload.access_token as string;
}

export async function searchEbay(query: string, limit = 40): Promise<Listing[] | null> {
  const token = await getApplicationToken();
  if (!token) return null;

  const params = new URLSearchParams({ q: query, limit: String(Math.min(limit, 100)) });
  const response = await fetch(`${EBAY_SEARCH_URL}?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-EBAY-C-MARKETPLACE-ID": "EBAY_GB",
    },
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`eBay search failed (${response.status})`);
  const payload = await response.json();

  return (payload.itemSummaries ?? []).map((item: any) => ({
    id: item.itemId,
    title: item.title,
    price: Number(item.price?.value ?? 0),
    shipping: Number(item.shippingOptions?.[0]?.shippingCost?.value ?? 0),
    url: item.itemWebUrl,
    image: item.image?.imageUrl,
    condition: item.condition,
    seller: item.seller?.username,
  }));
}

export function demoListings(query: string): Listing[] {
  const prices = [189, 205, 198, 214, 202, 199, 212, 118, 193, 208, 201, 196];
  return prices.map((price, i) => ({
    id: `demo-${i}`,
    title: `${query} ${i === 7 ? "— possible bargain" : "— comparable listing"}`,
    price,
    shipping: i % 3 === 0 ? 4.99 : 0,
    url: "#",
    condition: i % 2 ? "Used" : "Pre-owned",
    seller: `demo-seller-${i + 1}`,
  }));
}
