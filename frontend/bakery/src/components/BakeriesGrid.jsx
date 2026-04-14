import React from "react";
import BakeryCard from "./BakeryCard";
import { BAKERIES } from "../data/bakeries";

export default function BakeriesGrid() {
  return (
    <div className="bakeries-inner" id="bakeries-grid" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
      <div className="section-header" style={{ marginBottom: "40px" }}>
        <h2 className="section-title">Explore <em>Bakeries</em></h2>
        <p className="bakeries-subtitle" style={{ maxWidth: '600px', margin: '16px auto', color: 'var(--ink-muted)' }}>
          Choose from our curated selection of premium patisseries and bakeries. Each offering unique flavors and signature delicacies.
        </p>
      </div>
      <div className="bakeries-grid">
        {BAKERIES.map(bakery => (
          <BakeryCard key={bakery.id} bakery={bakery} />
        ))}
      </div>
    </div>
  );
}
