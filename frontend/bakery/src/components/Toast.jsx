import React from "react";
import { useApp } from "../context/AppContext";

export default function Toast() {
  const { toastVisible, toastMessage } = useApp();

  if (!toastVisible) return null;

  return (
    <div id="added-toast" className={`added-toast ${toastVisible ? "show" : ""}`}>
      {toastMessage}
    </div>
  );
}
