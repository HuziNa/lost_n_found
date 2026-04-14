import React from "react";
import Hero from "../components/Hero";
import ServicesStrip from "../components/ServicesStrip";
import CategoriesSection from "../components/CategoriesSection";
import CakeCollection from "../components/CakeCollection";
import AboutSection from "../components/AboutSection";
import ReviewsSection from "../components/ReviewsSection";
import SubscribeSection from "../components/SubscribeSection";

export default function HomePage() {
  return (
    <div className="page active" id="page-home">
      <Hero />
      <ServicesStrip />
      <CategoriesSection />
      <CakeCollection />
      <AboutSection />
      <ReviewsSection />
      <SubscribeSection />
    </div>
  );
}
