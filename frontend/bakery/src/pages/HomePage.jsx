import React from "react";
import Hero from "../components/Hero";
import ServicesStrip from "../components/ServicesStrip";
import BakeriesGrid from "../components/BakeriesGrid";
import BakeryCTA from "../components/BakeryCTA";
import SubscribeSection from "../components/SubscribeSection";

export default function HomePage() {
  return (
    <div className="page active" id="page-home">
      <Hero />
      <ServicesStrip />
      <BakeriesGrid />
      <BakeryCTA />
      <SubscribeSection />
    </div>
  );
}
