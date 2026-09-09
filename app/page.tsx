"use client";

import { FormEvent, useState } from "react";

type Deal = {
  id: string;
  title: string;
  price: number;
  shipping: number;
  url: string;
  condition?: string;
  seller?: string;
  allInPrice: number;
  marketValue: number;
  estimatedNetProfit: number;
  discountPercent: number;
  confidence: number;
  radarScore: number;
};

type ScanResult = {
  query: string;
  mode: "live" | "demo";
  scanned: number;
  deals: Deal[];
  note: string;
};

const money = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });

export default function Home() {
  const [query, setQuery] = useState("PlayStation 5 Slim");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function scan(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/scan?q=${encodeURIComponent(query)}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Scan failed");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <header className="topbar">
        <div className="brand"><span className="pulse" /> RESALE RADAR</div>
        <span className="status">PERSONAL SCANNER</span>
      </header>

      <section className="hero">
        <p className="eyebrow">FIND THE PRICE MISTAKES</p>
        <h1>Spot underpriced items <span>before everyone else.</span></h1>
        <p className="lede">Scan a product, compare current listings and surface potential resale opportunities ranked by margin and confidence.</p>

        <form onSubmit={scan} className="searchbox">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. Nintendo Switch OLED" aria-label="Product to scan" />
          <button disabled={loading}>{loading ? "SCANNING…" : "SCAN NOW"}</button>
        </form>
        <p className="microcopy">Start specific: exact model, storage, colour or size gives cleaner comparisons.</p>
      </section>

      {error && <div className="error">{error}</div>}

      {!result && (
        <section className="empty-state">
          <div className="radar-visual"><div className="sweep" /></div>
          <h2>Your opportunity feed starts here.</h2>
          <p>Run a scan. Without eBay credentials the app automatically demonstrates the full scoring flow using sample listings.</p>
        </section>
      )}

      {result && (
        <section className="results">
          <div className="result-head">
            <div>
              <p className="eyebrow">SCAN COMPLETE</p>
              <h2>{result.query}</h2>
            </div>
            <div className={`mode ${result.mode}`}>{result.mode === "live" ? "LIVE EBAY" : "DEMO MODE"}</div>
          </div>

          <div className="stats">
            <div><strong>{result.scanned}</strong><span>Listings scanned</span></div>
            <div><strong>{result.deals.length}</strong><span>Potential deals</span></div>
            <div><strong>{result.deals[0]?.radarScore ?? 0}</strong><span>Top Radar Score</span></div>
          </div>

          <p className="notice">{result.note}</p>

          <div className="deal-list">
            {result.deals.length === 0 ? (
              <div className="no-deals">No listing cleared the current minimum filters: 15% below estimated market value and at least £10 estimated net margin.</div>
            ) : result.deals.map((deal, index) => (
              <article className="deal-card" key={deal.id}>
                <div className="deal-top">
                  <span className="rank">#{index + 1}</span>
                  <span className="score">RADAR {deal.radarScore}/100</span>
                </div>
                <h3>{deal.title}</h3>
                <p className="meta">{deal.condition || "Condition unknown"} · {deal.seller || "Seller unavailable"}</p>
                <div className="prices">
                  <div><span>BUY FOR</span><strong>{money.format(deal.allInPrice)}</strong></div>
                  <div><span>EST. MARKET</span><strong>{money.format(deal.marketValue)}</strong></div>
                  <div className="profit"><span>EST. NET MARGIN</span><strong>+{money.format(deal.estimatedNetProfit)}</strong></div>
                </div>
                <div className="meter-row">
                  <span>{Math.round(deal.discountPercent)}% below market</span>
                  <span>{deal.confidence}% confidence</span>
                </div>
                <div className="meter"><i style={{ width: `${Math.min(100, deal.radarScore)}%` }} /></div>
                {deal.url !== "#" ? <a href={deal.url} target="_blank" rel="noreferrer">VIEW LISTING ↗</a> : <span className="demo-link">DEMO LISTING</span>}
              </article>
            ))}
          </div>
        </section>
      )}

      <footer>Resale Radar is a decision-support tool. Estimated market value and margin are not guaranteed sale prices or profits.</footer>
    </main>
  );
}
