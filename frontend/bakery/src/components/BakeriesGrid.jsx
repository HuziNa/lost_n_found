import React from "react";
import BakeryCard from "./BakeryCard";
import { BAKERIES } from "../data/bakeries";

export default function BakeriesGrid() {
  return (
    <div className="bakeries-inner" id="bakeries-grid" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
      <div className="bakeries-header" style={{ marginBottom: "40px" }}>
        <h2 className="section-title">Explore <em>Bakeries</em></h2>
        <p className="bakeries-subtitle">
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
