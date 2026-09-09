# Resale Radar

A personal resale opportunity scanner. Search a product and Resale Radar looks for listings that appear materially cheaper than the current comparable market, then ranks potential opportunities by estimated margin and confidence.

## What is built

- Mobile-first Resale Radar dashboard
- Product scan endpoint
- eBay Browse API integration for live UK listings
- Automatic OAuth application-token flow
- Demo mode when credentials are not configured
- Comparable-listing median valuation
- Outlier trimming
- Estimated all-in buy price
- Estimated market value
- Estimated selling-fee allowance
- Estimated net margin
- Discount-to-market percentage
- Confidence score
- 0–100 Radar Score
- Safety note that estimates are not guaranteed profits

## Important MVP limitation

The current valuation engine compares **active listings**. That is enough to prove the discovery/scoring workflow, but it is not yet the final valuation model. The next major milestone is to add a legitimate source of completed/sold-price evidence and sell-through data so the app can distinguish `cheap versus asking prices` from `cheap versus prices buyers actually pay`.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

Without eBay keys, the app runs in demo mode.

## Enable live eBay scans

Create an eBay Developer application and add its **Production** Application Keys to `.env.local` or your hosting provider:

```text
EBAY_CLIENT_ID=your_app_id
EBAY_CLIENT_SECRET=your_cert_id
```

Never commit the client secret to GitHub.

## Deploy

The project is a standard Next.js 16 app and is suitable for Vercel. Add the two environment variables in the deployment settings before using live mode.

## Valuation logic today

For each search:

1. Fetch comparable current listings.
2. Calculate each listing's item + shipping price.
3. Compute an initial median.
4. Trim extreme outliers.
5. Recalculate estimated market value from the remaining sample.
6. Estimate the spread between each listing and market value.
7. Reserve 13% of estimated resale value as a conservative placeholder for selling costs.
8. Surface listings at least 15% under market with at least £10 estimated net margin.
9. Rank them by margin, estimated profit and confidence.

The selling-cost assumption is deliberately configurable code, not a claim about the exact fees on any particular platform or account.

## Next build priorities

1. Add completed-sale / sold-price evidence through a permitted data source.
2. Add sell-through rate and estimated days-to-sell.
3. Improve exact product matching (model, storage, size, colour, GTIN/EPID).
4. Add category-specific fee and postage assumptions.
5. Add saved searches and a watchlist.
6. Add scheduled scans and alerts for newly found bargains.
7. Add duplicate-listing and suspicious-listing detection.
8. Add deal history so we can measure whether Radar estimates were accurate.
9. Add additional marketplaces only through permitted APIs/feeds/integrations.
10. Add a personal profit tracker for purchases and eventual resale outcomes.

## Product principle

Resale Radar should prefer **a small number of high-confidence opportunities** over flooding the user with hundreds of merely cheap-looking listings.
