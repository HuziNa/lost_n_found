import React, { useState } from "react";
import CakeCard from "./CakeCard";
import { CAKES } from "../data/cakes";

export default function CakeCollection() {
  const [filter, setFilter] = useState("all");

  const displayCakes = filter === "all" ? CAKES : CAKES.filter(c => c.cat === filter);

  return (
    <section className="section cakes-section" id="cakes">
      <div className="section-inner">
        <div
          className="section-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: "20px",
            marginBottom: 0,
          }}
        >
          <div>
            <div className="section-kicker">Our Speciality</div>
            <h2 className="section-title">Explore the <em>Collection</em></h2>
          </div>
          <div className="cake-filters">
            <button
              className={`filter-btn ${filter === "all" ? "selected" : ""}`}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === "fresh" ? "selected" : ""}`}
              onClick={() => setFilter("fresh")}
            >
              Fresh Cream
            </button>
            <button
              className={`filter-btn ${filter === "mousse" ? "selected" : ""}`}
              onClick={() => setFilter("mousse")}
            >
              Mousse
            </button>
            <button
              className={`filter-btn ${filter === "butter" ? "selected" : ""}`}
              onClick={() => setFilter("butter")}
            >
              Buttercream
            </button>
            <button
              className={`filter-btn ${filter === "dry" ? "selected" : ""}`}
              onClick={() => setFilter("dry")}
            >
              Dry Cake
            </button>
          </div>
        </div>
        <div className="cake-grid" style={{ marginTop: '40px' }}>
          {displayCakes.map(cake => (
            <CakeCard key={cake.id} cake={cake} />
          ))}
        </div>
      </div>
    </section>
  );
}
