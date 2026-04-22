import React, { useState } from "react";
import PizzaCard from "./PizzaCard";
import { PIZZAS } from "../data/pizzas";

export default function PizzaCollection() {
  const [filter, setFilter] = useState("all");

  const displayPizzas = filter === "all" ? PIZZAS : PIZZAS.filter(p => p.cat === filter);

  return (
    <section className="section cakes-section" id="pizzas">
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
              className={`filter-btn ${filter === "classic" ? "selected" : ""}`}
              onClick={() => setFilter("classic")}
            >
              Classic
            </button>
            <button
              className={`filter-btn ${filter === "meat" ? "selected" : ""}`}
              onClick={() => setFilter("meat")}
            >
              Meat Lovers
            </button>
            <button
              className={`filter-btn ${filter === "vegetarian" ? "selected" : ""}`}
              onClick={() => setFilter("vegetarian")}
            >
              Vegetarian
            </button>
            <button
              className={`filter-btn ${filter === "specialty" ? "selected" : ""}`}
              onClick={() => setFilter("specialty")}
            >
              Specialty
            </button>
          </div>
        </div>
        <div className="cake-grid" style={{ marginTop: '40px' }}>
          {displayPizzas.map(pizza => (
            <PizzaCard key={pizza.id} pizza={pizza} />
          ))}
        </div>
      </div>
    </section>
  );
}