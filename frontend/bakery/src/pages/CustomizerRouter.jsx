import React from "react";
import { useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getBakeryMenuProduct } from "../api/bakery";
import CakeCustomizePage from "./CakeCustomizePage";
import PizzaCustomizePage from "./PizzaCustomizePage";
import CupcakeCustomizePage from "./CupcakeCustomizePage";
import BreadCustomizePage from "./BreadCustomizePage";

export default function CustomizerRouter() {
  const { categoryId, productId } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["menuProduct", productId],
    queryFn: () => getBakeryMenuProduct(productId),
    enabled: !!productId,
  });

  if (isLoading) return <div className="page active" style={{ padding: "120px 20px", textAlign: "center" }}>Loading builder...</div>;
  if (isError || !data?.product) return <div className="page active" style={{ padding: "120px 20px", textAlign: "center" }}>Product not found.</div>;

  const product = data.product;
  const catName = (product.categoryName || product.category?.name || "").toUpperCase();

  if (catName.includes("PIZZA")) {
    return <PizzaCustomizePage />;
  } else if (catName.includes("CUPCAKE")) {
    return <CupcakeCustomizePage />;
  } else if (catName.includes("BREAD")) {
    return <BreadCustomizePage />;
  } else {
    // Default to Cake for CAKE or any unknown category
    return <CakeCustomizePage />;
  }
}
