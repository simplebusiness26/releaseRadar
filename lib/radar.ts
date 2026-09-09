export type Listing = {
  id: string;
  title: string;
  price: number;
  shipping: number;
  url: string;
  image?: string;
  condition?: string;
  seller?: string;
};

export type RadarDeal = Listing & {
  allInPrice: number;
  marketValue: number;
  grossSpread: number;
  estimatedFees: number;
  estimatedNetProfit: number;
  discountPercent: number;
  confidence: number;
  radarScore: number;
};

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

export function scoreDeals(listings: Listing[]): RadarDeal[] {
  if (listings.length < 4) return [];

  const totals = listings.map((item) => item.price + item.shipping).filter((n) => n > 0);
  const baseMedian = median(totals);
  const trimmed = totals.filter((n) => n >= baseMedian * 0.45 && n <= baseMedian * 1.75);
  const marketValue = median(trimmed.length >= 3 ? trimmed : totals);

  return listings
    .map((item) => {
      const allInPrice = item.price + item.shipping;
      const grossSpread = Math.max(0, marketValue - allInPrice);
      const estimatedFees = Math.max(2, marketValue * 0.13);
      const estimatedNetProfit = Math.max(0, grossSpread - estimatedFees);
      const discountPercent = marketValue ? ((marketValue - allInPrice) / marketValue) * 100 : 0;
      const sampleConfidence = Math.min(100, 50 + listings.length * 2.5);
      const priceConfidence = Math.max(0, 100 - Math.abs(allInPrice - marketValue) / Math.max(marketValue, 1) * 35);
      const confidence = Math.round(sampleConfidence * 0.7 + priceConfidence * 0.3);
      const marginScore = Math.min(45, Math.max(0, discountPercent) * 1.25);
      const profitScore = Math.min(35, estimatedNetProfit / 2);
      const confidenceScore = confidence * 0.2;
      const radarScore = Math.round(Math.min(100, marginScore + profitScore + confidenceScore));

      return {
        ...item,
        allInPrice,
        marketValue,
        grossSpread,
        estimatedFees,
        estimatedNetProfit,
        discountPercent,
        confidence,
        radarScore,
      };
    })
    .filter((deal) => deal.discountPercent >= 15 && deal.estimatedNetProfit >= 10)
    .sort((a, b) => b.radarScore - a.radarScore);
}
