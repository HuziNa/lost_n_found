import React from "react";
import { useApp } from "../context/AppContext";

export default function Toast() {
  const { toastVisible } = useApp();

  if (!toastVisible) return null;

  return (
    <div id="added-toast" className={`added-toast ${toastVisible ? "show" : ""}`}>
      Item added to cart
    </div>
  );
}
