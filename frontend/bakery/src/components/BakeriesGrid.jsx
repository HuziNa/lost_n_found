import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getPublicBakeries } from "../api/bakery";
import BakeryCard from "./BakeryCard";

export default function BakeriesGrid() {
  const bakeriesQuery = useQuery({
    queryKey: ["publicBakeries"],
    queryFn: getPublicBakeries,
  });

  const bakeries = bakeriesQuery.data?.bakeries || [];

  return (
    <div className="bakeries-inner" id="bakeries-grid" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
      <div className="bakeries-header" style={{ marginBottom: "40px" }}>
        <h2 className="section-title">Explore <em>Bakeries</em></h2>
        <p className="bakeries-subtitle">
          Choose from our curated selection of premium patisseries and bakeries. Each offering unique flavors and signature delicacies.
        </p>
      </div>
      <div className="bakeries-grid">
        {bakeriesQuery.isLoading && (
          <div className="placeholder-box">Loading bakeries...</div>
        )}
        {bakeriesQuery.isError && (
          <div className="placeholder-box">Unable to load bakeries.</div>
        )}
        {!bakeriesQuery.isLoading && bakeries.length === 0 && (
          <div className="placeholder-box">No bakeries available yet.</div>
        )}
        {bakeries.map(bakery => (
          <BakeryCard key={bakery.id} bakery={bakery} />
        ))}
      </div>
    </div>
  );
}
