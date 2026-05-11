import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Bakery from "../models/Bakery.js";
import Ingredient from "../models/Ingredients.js";
import BakeryInventory from "../models/BakeryInventory.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const args = process.argv.slice(2);

function parseArgs(arr) {
  const out = {};
  for (let i = 0; i < arr.length; i += 1) {
    const arg = arr[i];
    if (arg === "--bakeryId") out.bakeryId = arr[++i];
    else if (arg === "--bakeryName") out.bakeryName = arr[++i];
    else if (arg === "--profile") out.profile = arr[++i];
    else if (!out.inputFile) out.inputFile = arg;
  }
  return out;
}

const { bakeryId, bakeryName, inputFile, profile } = parseArgs(args);

if (!bakeryId && !bakeryName) {
  console.error('Usage: node scripts/seedInventory.js --bakeryId <id> | --bakeryName "Name" [path/to/file.json]');
  process.exit(1);
}

const BAKERY_PROFILES = {
  bakery1: {
  raw: [
    { name: "Flour", unit: "g", pricePerUnit: 0.12, stock: 50000, lowStockAlert: 5000 },
    { name: "Sugar", unit: "g", pricePerUnit: 0.15, stock: 30000, lowStockAlert: 4000 },
    { name: "Butter", unit: "g", pricePerUnit: 0.25, stock: 20000, lowStockAlert: 3000 },
    { name: "Milk", unit: "ml", pricePerUnit: 0.08, stock: 30000, lowStockAlert: 5000 },
    { name: "Eggs", unit: "pcs", pricePerUnit: 20, stock: 1000, lowStockAlert: 120 },
    { name: "Chocolate", unit: "g", pricePerUnit: 0.35, stock: 15000, lowStockAlert: 2500 },
    { name: "Cocoa Powder", unit: "g", pricePerUnit: 0.28, stock: 8000, lowStockAlert: 1200 },
    { name: "Yeast", unit: "g", pricePerUnit: 0.1, stock: 5000, lowStockAlert: 800 },
    { name: "Salt", unit: "g", pricePerUnit: 0.05, stock: 8000, lowStockAlert: 1000 },
    { name: "Olive Oil", unit: "ml", pricePerUnit: 0.2, stock: 6000, lowStockAlert: 900 },
    { name: "Water", unit: "ml", pricePerUnit: 0.01, stock: 50000, lowStockAlert: 5000 },
    { name: "Vanilla Extract", unit: "ml", pricePerUnit: 0.5, stock: 2000, lowStockAlert: 250 },
    { name: "Cream", unit: "ml", pricePerUnit: 0.22, stock: 10000, lowStockAlert: 1200 },
    { name: "Cream Cheese", unit: "g", pricePerUnit: 0.38, stock: 6000, lowStockAlert: 800 },
    { name: "Tomatoes", unit: "g", pricePerUnit: 0.09, stock: 12000, lowStockAlert: 2000 },
    { name: "Garlic", unit: "g", pricePerUnit: 0.12, stock: 3000, lowStockAlert: 400 },
    { name: "Basil", unit: "g", pricePerUnit: 0.18, stock: 2000, lowStockAlert: 300 },
    { name: "Mozzarella", unit: "g", pricePerUnit: 0.3, stock: 12000, lowStockAlert: 1600 },
    { name: "Pepperoni", unit: "g", pricePerUnit: 0.42, stock: 8000, lowStockAlert: 1000 },
    { name: "Mushrooms", unit: "g", pricePerUnit: 0.19, stock: 6000, lowStockAlert: 800 },
    { name: "Black Olives", unit: "g", pricePerUnit: 0.21, stock: 4000, lowStockAlert: 500 },
    { name: "Bell Peppers", unit: "g", pricePerUnit: 0.17, stock: 6000, lowStockAlert: 900 },
    { name: "Red Onions", unit: "g", pricePerUnit: 0.16, stock: 5000, lowStockAlert: 700 },
    { name: "Jalapenos", unit: "g", pricePerUnit: 0.18, stock: 2500, lowStockAlert: 350 },
    { name: "Honey", unit: "ml", pricePerUnit: 0.24, stock: 5000, lowStockAlert: 700 },
    { name: "Sesame Seeds", unit: "g", pricePerUnit: 0.11, stock: 2000, lowStockAlert: 300 },
    { name: "Pumpkin Seeds", unit: "g", pricePerUnit: 0.14, stock: 2000, lowStockAlert: 300 },
    { name: "Sunflower Seeds", unit: "g", pricePerUnit: 0.14, stock: 2000, lowStockAlert: 300 },
    { name: "Rosemary", unit: "g", pricePerUnit: 0.13, stock: 1000, lowStockAlert: 150 },
    { name: "Thyme", unit: "g", pricePerUnit: 0.13, stock: 1000, lowStockAlert: 150 },
    { name: "Strawberries", unit: "g", pricePerUnit: 0.3, stock: 8000, lowStockAlert: 1200 },
    { name: "Blueberries", unit: "g", pricePerUnit: 0.32, stock: 5000, lowStockAlert: 700 },
    { name: "Raspberries", unit: "g", pricePerUnit: 0.34, stock: 5000, lowStockAlert: 700 },
    { name: "Sprinkles", unit: "g", pricePerUnit: 0.2, stock: 3000, lowStockAlert: 400 },
    { name: "Edible Glitter", unit: "g", pricePerUnit: 0.45, stock: 1500, lowStockAlert: 200 },
    { name: "Gold Leaf", unit: "pcs", pricePerUnit: 5, stock: 500, lowStockAlert: 60 },
    { name: "Pine Nuts", unit: "g", pricePerUnit: 0.44, stock: 2000, lowStockAlert: 250 },
    { name: "Vinegar", unit: "ml", pricePerUnit: 0.08, stock: 4000, lowStockAlert: 500 },
    { name: "Food Color Red", unit: "ml", pricePerUnit: 0.3, stock: 1000, lowStockAlert: 120 },
    { name: "Baking Powder", unit: "g", pricePerUnit: 0.07, stock: 4000, lowStockAlert: 500 },
    { name: "Almond Flour", unit: "g", pricePerUnit: 0.4, stock: 5000, lowStockAlert: 600 },
  ],
  compounds: [
    { name: "Vanilla Cake Batter", unit: "g", pricePerUnit: 0.9, stock: 4000, lowStockAlert: 500, recipe: [{ name: "Flour", quantity: 500 }, { name: "Sugar", quantity: 250 }, { name: "Butter", quantity: 200 }, { name: "Milk", quantity: 300 }, { name: "Eggs", quantity: 4 }, { name: "Vanilla Extract", quantity: 20 }, { name: "Baking Powder", quantity: 10 }, { name: "Salt", quantity: 5 }] },
    { name: "Chocolate Cake Batter", unit: "g", pricePerUnit: 1, stock: 3500, lowStockAlert: 500, recipe: [{ name: "Flour", quantity: 500 }, { name: "Sugar", quantity: 230 }, { name: "Butter", quantity: 200 }, { name: "Milk", quantity: 250 }, { name: "Eggs", quantity: 4 }, { name: "Cocoa Powder", quantity: 80 }, { name: "Baking Powder", quantity: 10 }, { name: "Salt", quantity: 5 }] },
    { name: "Red Velvet Cake Batter", unit: "g", pricePerUnit: 1.05, stock: 3000, lowStockAlert: 400, recipe: [{ name: "Flour", quantity: 480 }, { name: "Sugar", quantity: 240 }, { name: "Butter", quantity: 180 }, { name: "Milk", quantity: 250 }, { name: "Eggs", quantity: 4 }, { name: "Cocoa Powder", quantity: 40 }, { name: "Food Color Red", quantity: 5 }, { name: "Vinegar", quantity: 10 }, { name: "Baking Powder", quantity: 10 }, { name: "Salt", quantity: 5 }] },
    { name: "Strawberry Cake Batter", unit: "g", pricePerUnit: 1.08, stock: 3000, lowStockAlert: 400, recipe: [{ name: "Flour", quantity: 480 }, { name: "Sugar", quantity: 260 }, { name: "Butter", quantity: 180 }, { name: "Milk", quantity: 280 }, { name: "Eggs", quantity: 4 }, { name: "Strawberries", quantity: 120 }, { name: "Vanilla Extract", quantity: 15 }, { name: "Baking Powder", quantity: 10 }, { name: "Salt", quantity: 5 }] },
    { name: "Vanilla Buttercream", unit: "g", pricePerUnit: 0.85, stock: 5000, lowStockAlert: 700, recipe: [{ name: "Sugar", quantity: 300 }, { name: "Butter", quantity: 250 }, { name: "Milk", quantity: 100 }, { name: "Vanilla Extract", quantity: 10 }] },
    { name: "Chocolate Frosting", unit: "g", pricePerUnit: 0.9, stock: 4500, lowStockAlert: 600, recipe: [{ name: "Sugar", quantity: 280 }, { name: "Butter", quantity: 220 }, { name: "Cocoa Powder", quantity: 60 }, { name: "Milk", quantity: 80 }, { name: "Vanilla Extract", quantity: 5 }] },
    { name: "Cream Cheese Frosting", unit: "g", pricePerUnit: 0.95, stock: 4500, lowStockAlert: 600, recipe: [{ name: "Sugar", quantity: 260 }, { name: "Butter", quantity: 180 }, { name: "Cream Cheese", quantity: 220 }, { name: "Milk", quantity: 80 }] },
    { name: "Strawberry Frosting", unit: "g", pricePerUnit: 0.92, stock: 4000, lowStockAlert: 550, recipe: [{ name: "Sugar", quantity: 280 }, { name: "Butter", quantity: 220 }, { name: "Strawberries", quantity: 120 }, { name: "Milk", quantity: 80 }] },
    { name: "Chocolate Ganache", unit: "g", pricePerUnit: 1.1, stock: 3000, lowStockAlert: 400, recipe: [{ name: "Chocolate", quantity: 300 }, { name: "Cream", quantity: 200 }, { name: "Butter", quantity: 50 }] },
    { name: "Caramel Cream", unit: "g", pricePerUnit: 1, stock: 2500, lowStockAlert: 350, recipe: [{ name: "Sugar", quantity: 300 }, { name: "Butter", quantity: 150 }, { name: "Cream", quantity: 200 }, { name: "Milk", quantity: 80 }] },
    { name: "Thin Crust", unit: "pcs", pricePerUnit: 1.75, stock: 3000, lowStockAlert: 400, recipe: [{ name: "Flour", quantity: 600 }, { name: "Yeast", quantity: 15 }, { name: "Water", quantity: 280 }, { name: "Olive Oil", quantity: 25 }, { name: "Salt", quantity: 10 }, { name: "Sugar", quantity: 5 }] },
    { name: "Classic Crust", unit: "pcs", pricePerUnit: 1.85, stock: 3000, lowStockAlert: 400, recipe: [{ name: "Flour", quantity: 650 }, { name: "Yeast", quantity: 18 }, { name: "Water", quantity: 300 }, { name: "Olive Oil", quantity: 30 }, { name: "Salt", quantity: 10 }, { name: "Sugar", quantity: 8 }] },
    { name: "Stuffed Crust", unit: "pcs", pricePerUnit: 2.2, stock: 2500, lowStockAlert: 350, recipe: [{ name: "Flour", quantity: 650 }, { name: "Yeast", quantity: 18 }, { name: "Water", quantity: 300 }, { name: "Olive Oil", quantity: 30 }, { name: "Salt", quantity: 10 }, { name: "Sugar", quantity: 8 }, { name: "Mozzarella", quantity: 80 }] },
    { name: "Tomato Basil Sauce", unit: "ml", pricePerUnit: 0.7, stock: 4000, lowStockAlert: 600, recipe: [{ name: "Tomatoes", quantity: 300 }, { name: "Garlic", quantity: 20 }, { name: "Basil", quantity: 10 }, { name: "Olive Oil", quantity: 15 }, { name: "Salt", quantity: 5 }] },
    { name: "BBQ Sauce", unit: "ml", pricePerUnit: 0.78, stock: 3000, lowStockAlert: 450, recipe: [{ name: "Tomatoes", quantity: 200 }, { name: "Sugar", quantity: 40 }, { name: "Vinegar", quantity: 20 }, { name: "Garlic", quantity: 10 }, { name: "Salt", quantity: 5 }] },
    { name: "White Garlic Sauce", unit: "ml", pricePerUnit: 0.82, stock: 3000, lowStockAlert: 450, recipe: [{ name: "Milk", quantity: 180 }, { name: "Butter", quantity: 60 }, { name: "Garlic", quantity: 25 }, { name: "Flour", quantity: 20 }, { name: "Mozzarella", quantity: 40 }, { name: "Salt", quantity: 3 }] },
    { name: "Pesto", unit: "ml", pricePerUnit: 0.9, stock: 2500, lowStockAlert: 350, recipe: [{ name: "Basil", quantity: 80 }, { name: "Olive Oil", quantity: 50 }, { name: "Garlic", quantity: 15 }, { name: "Pine Nuts", quantity: 40 }, { name: "Mozzarella", quantity: 20 }, { name: "Salt", quantity: 3 }] },
    { name: "Light Cheese", unit: "g", pricePerUnit: 0.65, stock: 6000, lowStockAlert: 800, recipe: [{ name: "Mozzarella", quantity: 60 }] },
    { name: "Regular Cheese", unit: "g", pricePerUnit: 0.85, stock: 6000, lowStockAlert: 800, recipe: [{ name: "Mozzarella", quantity: 90 }] },
    { name: "Extra Cheese", unit: "g", pricePerUnit: 1.1, stock: 5000, lowStockAlert: 700, recipe: [{ name: "Mozzarella", quantity: 140 }] },
    { name: "Vanilla Cupcake Base", unit: "g", pricePerUnit: 0.75, stock: 3500, lowStockAlert: 500, recipe: [{ name: "Flour", quantity: 220 }, { name: "Sugar", quantity: 140 }, { name: "Butter", quantity: 120 }, { name: "Milk", quantity: 120 }, { name: "Eggs", quantity: 2 }, { name: "Vanilla Extract", quantity: 10 }, { name: "Baking Powder", quantity: 8 }, { name: "Salt", quantity: 2 }] },
    { name: "Chocolate Cupcake Base", unit: "g", pricePerUnit: 0.82, stock: 3000, lowStockAlert: 450, recipe: [{ name: "Flour", quantity: 220 }, { name: "Sugar", quantity: 130 }, { name: "Butter", quantity: 120 }, { name: "Milk", quantity: 110 }, { name: "Eggs", quantity: 2 }, { name: "Cocoa Powder", quantity: 40 }, { name: "Baking Powder", quantity: 8 }, { name: "Salt", quantity: 2 }] },
    { name: "Red Velvet Cupcake Base", unit: "g", pricePerUnit: 0.88, stock: 2500, lowStockAlert: 350, recipe: [{ name: "Flour", quantity: 220 }, { name: "Sugar", quantity: 140 }, { name: "Butter", quantity: 120 }, { name: "Milk", quantity: 110 }, { name: "Eggs", quantity: 2 }, { name: "Cocoa Powder", quantity: 20 }, { name: "Food Color Red", quantity: 4 }, { name: "Vinegar", quantity: 5 }, { name: "Baking Powder", quantity: 8 }, { name: "Salt", quantity: 2 }] },
    { name: "Strawberry Cupcake Base", unit: "g", pricePerUnit: 0.9, stock: 2500, lowStockAlert: 350, recipe: [{ name: "Flour", quantity: 220 }, { name: "Sugar", quantity: 150 }, { name: "Butter", quantity: 120 }, { name: "Milk", quantity: 120 }, { name: "Eggs", quantity: 2 }, { name: "Strawberries", quantity: 60 }, { name: "Vanilla Extract", quantity: 10 }, { name: "Baking Powder", quantity: 8 }, { name: "Salt", quantity: 2 }] },
    { name: "Egg Wash", unit: "ml", pricePerUnit: 0.3, stock: 2000, lowStockAlert: 250, recipe: [{ name: "Eggs", quantity: 2 }, { name: "Milk", quantity: 20 }] },
    { name: "Honey Glaze", unit: "ml", pricePerUnit: 0.34, stock: 1800, lowStockAlert: 220, recipe: [{ name: "Honey", quantity: 80 }, { name: "Butter", quantity: 20 }, { name: "Milk", quantity: 15 }] },
  ],
  },
  bakery2: {
    raw: [
      { name: "Flour", unit: "g", pricePerUnit: 0.12, stock: 60000, lowStockAlert: 8000 },
      { name: "Yeast", unit: "g", pricePerUnit: 0.1, stock: 8000, lowStockAlert: 1200 },
      { name: "Water", unit: "ml", pricePerUnit: 0.01, stock: 70000, lowStockAlert: 8000 },
      { name: "Olive Oil", unit: "ml", pricePerUnit: 0.2, stock: 15000, lowStockAlert: 2000 },
      { name: "Salt", unit: "g", pricePerUnit: 0.05, stock: 12000, lowStockAlert: 1500 },
      { name: "Sugar", unit: "g", pricePerUnit: 0.15, stock: 8000, lowStockAlert: 1200 },
      { name: "Mozzarella", unit: "g", pricePerUnit: 0.3, stock: 25000, lowStockAlert: 4000 },
      { name: "Tomatoes", unit: "g", pricePerUnit: 0.09, stock: 20000, lowStockAlert: 3000 },
      { name: "Garlic", unit: "g", pricePerUnit: 0.12, stock: 5000, lowStockAlert: 700 },
      { name: "Basil", unit: "g", pricePerUnit: 0.18, stock: 4000, lowStockAlert: 500 },
      { name: "Pepperoni", unit: "g", pricePerUnit: 0.42, stock: 12000, lowStockAlert: 1500 },
      { name: "Mushrooms", unit: "g", pricePerUnit: 0.19, stock: 10000, lowStockAlert: 1200 },
      { name: "Black Olives", unit: "g", pricePerUnit: 0.21, stock: 8000, lowStockAlert: 900 },
      { name: "Bell Peppers", unit: "g", pricePerUnit: 0.17, stock: 9000, lowStockAlert: 1200 },
      { name: "Red Onions", unit: "g", pricePerUnit: 0.16, stock: 7000, lowStockAlert: 1000 },
      { name: "Jalapenos", unit: "g", pricePerUnit: 0.18, stock: 5000, lowStockAlert: 700 },
      { name: "Honey", unit: "ml", pricePerUnit: 0.24, stock: 5000, lowStockAlert: 700 },
      { name: "Sesame Seeds", unit: "g", pricePerUnit: 0.11, stock: 4000, lowStockAlert: 500 },
      { name: "Pumpkin Seeds", unit: "g", pricePerUnit: 0.14, stock: 4000, lowStockAlert: 500 },
      { name: "Sunflower Seeds", unit: "g", pricePerUnit: 0.14, stock: 4000, lowStockAlert: 500 },
      { name: "Rosemary", unit: "g", pricePerUnit: 0.13, stock: 2000, lowStockAlert: 250 },
      { name: "Thyme", unit: "g", pricePerUnit: 0.13, stock: 2000, lowStockAlert: 250 },
      { name: "Butter", unit: "g", pricePerUnit: 0.25, stock: 6000, lowStockAlert: 800 },
      { name: "Milk", unit: "ml", pricePerUnit: 0.08, stock: 10000, lowStockAlert: 1200 },
      { name: "Eggs", unit: "pcs", pricePerUnit: 20, stock: 1000, lowStockAlert: 120 },
      { name: "Cream", unit: "ml", pricePerUnit: 0.22, stock: 4000, lowStockAlert: 500 },
      { name: "Vinegar", unit: "ml", pricePerUnit: 0.08, stock: 3000, lowStockAlert: 400 },
      { name: "Pine Nuts", unit: "g", pricePerUnit: 0.44, stock: 2000, lowStockAlert: 250 },
    ],
    compounds: [
      { name: "Thin Crust", unit: "pcs", pricePerUnit: 1.75, stock: 4000, lowStockAlert: 500, recipe: [{ name: "Flour", quantity: 600 }, { name: "Yeast", quantity: 15 }, { name: "Water", quantity: 280 }, { name: "Olive Oil", quantity: 25 }, { name: "Salt", quantity: 10 }, { name: "Sugar", quantity: 5 }] },
      { name: "Classic Crust", unit: "pcs", pricePerUnit: 1.85, stock: 4000, lowStockAlert: 500, recipe: [{ name: "Flour", quantity: 650 }, { name: "Yeast", quantity: 18 }, { name: "Water", quantity: 300 }, { name: "Olive Oil", quantity: 30 }, { name: "Salt", quantity: 10 }, { name: "Sugar", quantity: 8 }] },
      { name: "Stuffed Crust", unit: "pcs", pricePerUnit: 2.2, stock: 3500, lowStockAlert: 450, recipe: [{ name: "Flour", quantity: 650 }, { name: "Yeast", quantity: 18 }, { name: "Water", quantity: 300 }, { name: "Olive Oil", quantity: 30 }, { name: "Salt", quantity: 10 }, { name: "Sugar", quantity: 8 }, { name: "Mozzarella", quantity: 80 }] },
      { name: "Tomato Basil Sauce", unit: "ml", pricePerUnit: 0.7, stock: 5000, lowStockAlert: 700, recipe: [{ name: "Tomatoes", quantity: 300 }, { name: "Garlic", quantity: 20 }, { name: "Basil", quantity: 10 }, { name: "Olive Oil", quantity: 15 }, { name: "Salt", quantity: 5 }] },
      { name: "BBQ Sauce", unit: "ml", pricePerUnit: 0.78, stock: 3500, lowStockAlert: 500, recipe: [{ name: "Tomatoes", quantity: 200 }, { name: "Sugar", quantity: 40 }, { name: "Vinegar", quantity: 20 }, { name: "Garlic", quantity: 10 }, { name: "Salt", quantity: 5 }] },
      { name: "White Garlic Sauce", unit: "ml", pricePerUnit: 0.82, stock: 3500, lowStockAlert: 500, recipe: [{ name: "Milk", quantity: 180 }, { name: "Butter", quantity: 60 }, { name: "Garlic", quantity: 25 }, { name: "Flour", quantity: 20 }, { name: "Mozzarella", quantity: 40 }, { name: "Salt", quantity: 3 }] },
      { name: "Pesto", unit: "ml", pricePerUnit: 0.9, stock: 3000, lowStockAlert: 400, recipe: [{ name: "Basil", quantity: 80 }, { name: "Olive Oil", quantity: 50 }, { name: "Garlic", quantity: 15 }, { name: "Pine Nuts", quantity: 40 }, { name: "Mozzarella", quantity: 20 }, { name: "Salt", quantity: 3 }] },
      { name: "Light Cheese", unit: "g", pricePerUnit: 0.65, stock: 8000, lowStockAlert: 1000, recipe: [{ name: "Mozzarella", quantity: 60 }] },
      { name: "Regular Cheese", unit: "g", pricePerUnit: 0.85, stock: 8000, lowStockAlert: 1000, recipe: [{ name: "Mozzarella", quantity: 90 }] },
      { name: "Extra Cheese", unit: "g", pricePerUnit: 1.1, stock: 7000, lowStockAlert: 900, recipe: [{ name: "Mozzarella", quantity: 140 }] },
    ],
  },
  bakery3: {
    raw: [
      { name: "Flour", unit: "g", pricePerUnit: 0.12, stock: 40000, lowStockAlert: 5000 },
      { name: "Sugar", unit: "g", pricePerUnit: 0.15, stock: 25000, lowStockAlert: 3500 },
      { name: "Butter", unit: "g", pricePerUnit: 0.25, stock: 18000, lowStockAlert: 2500 },
      { name: "Milk", unit: "ml", pricePerUnit: 0.08, stock: 22000, lowStockAlert: 3000 },
      { name: "Eggs", unit: "pcs", pricePerUnit: 20, stock: 1200, lowStockAlert: 150 },
      { name: "Chocolate", unit: "g", pricePerUnit: 0.35, stock: 12000, lowStockAlert: 1800 },
      { name: "Cocoa Powder", unit: "g", pricePerUnit: 0.28, stock: 7000, lowStockAlert: 1000 },
      { name: "Vanilla Extract", unit: "ml", pricePerUnit: 0.5, stock: 1800, lowStockAlert: 200 },
      { name: "Cream", unit: "ml", pricePerUnit: 0.22, stock: 8000, lowStockAlert: 1000 },
      { name: "Cream Cheese", unit: "g", pricePerUnit: 0.38, stock: 5000, lowStockAlert: 700 },
      { name: "Strawberries", unit: "g", pricePerUnit: 0.3, stock: 7000, lowStockAlert: 1000 },
      { name: "Blueberries", unit: "g", pricePerUnit: 0.32, stock: 4000, lowStockAlert: 600 },
      { name: "Raspberries", unit: "g", pricePerUnit: 0.34, stock: 4000, lowStockAlert: 600 },
      { name: "Salt", unit: "g", pricePerUnit: 0.05, stock: 6000, lowStockAlert: 800 },
      { name: "Sprinkles", unit: "g", pricePerUnit: 0.2, stock: 3000, lowStockAlert: 400 },
      { name: "Edible Glitter", unit: "g", pricePerUnit: 0.45, stock: 1500, lowStockAlert: 200 },
      { name: "Gold Leaf", unit: "pcs", pricePerUnit: 5, stock: 500, lowStockAlert: 60 },
      { name: "Pine Nuts", unit: "g", pricePerUnit: 0.44, stock: 2000, lowStockAlert: 250 },
      { name: "Vinegar", unit: "ml", pricePerUnit: 0.08, stock: 3000, lowStockAlert: 400 },
      { name: "Food Color Red", unit: "ml", pricePerUnit: 0.3, stock: 1200, lowStockAlert: 150 },
      { name: "Baking Powder", unit: "g", pricePerUnit: 0.07, stock: 4000, lowStockAlert: 500 },
      { name: "Almond Flour", unit: "g", pricePerUnit: 0.4, stock: 4000, lowStockAlert: 500 },
      { name: "Honey", unit: "ml", pricePerUnit: 0.24, stock: 3000, lowStockAlert: 400 },
    ],
    compounds: [
      { name: "Vanilla Cake Batter", unit: "g", pricePerUnit: 0.9, stock: 5000, lowStockAlert: 700, recipe: [{ name: "Flour", quantity: 500 }, { name: "Sugar", quantity: 250 }, { name: "Butter", quantity: 200 }, { name: "Milk", quantity: 300 }, { name: "Eggs", quantity: 4 }, { name: "Vanilla Extract", quantity: 20 }, { name: "Baking Powder", quantity: 10 }, { name: "Salt", quantity: 5 }] },
      { name: "Chocolate Cake Batter", unit: "g", pricePerUnit: 1, stock: 4500, lowStockAlert: 650, recipe: [{ name: "Flour", quantity: 500 }, { name: "Sugar", quantity: 230 }, { name: "Butter", quantity: 200 }, { name: "Milk", quantity: 250 }, { name: "Eggs", quantity: 4 }, { name: "Cocoa Powder", quantity: 80 }, { name: "Baking Powder", quantity: 10 }, { name: "Salt", quantity: 5 }] },
      { name: "Red Velvet Cake Batter", unit: "g", pricePerUnit: 1.05, stock: 4000, lowStockAlert: 550, recipe: [{ name: "Flour", quantity: 480 }, { name: "Sugar", quantity: 240 }, { name: "Butter", quantity: 180 }, { name: "Milk", quantity: 250 }, { name: "Eggs", quantity: 4 }, { name: "Cocoa Powder", quantity: 40 }, { name: "Food Color Red", quantity: 5 }, { name: "Vinegar", quantity: 10 }, { name: "Baking Powder", quantity: 10 }, { name: "Salt", quantity: 5 }] },
      { name: "Strawberry Cake Batter", unit: "g", pricePerUnit: 1.08, stock: 4000, lowStockAlert: 550, recipe: [{ name: "Flour", quantity: 480 }, { name: "Sugar", quantity: 260 }, { name: "Butter", quantity: 180 }, { name: "Milk", quantity: 280 }, { name: "Eggs", quantity: 4 }, { name: "Strawberries", quantity: 120 }, { name: "Vanilla Extract", quantity: 15 }, { name: "Baking Powder", quantity: 10 }, { name: "Salt", quantity: 5 }] },
      { name: "Vanilla Buttercream", unit: "g", pricePerUnit: 0.85, stock: 7000, lowStockAlert: 900, recipe: [{ name: "Sugar", quantity: 300 }, { name: "Butter", quantity: 250 }, { name: "Milk", quantity: 100 }, { name: "Vanilla Extract", quantity: 10 }] },
      { name: "Chocolate Frosting", unit: "g", pricePerUnit: 0.9, stock: 6000, lowStockAlert: 800, recipe: [{ name: "Sugar", quantity: 280 }, { name: "Butter", quantity: 220 }, { name: "Cocoa Powder", quantity: 60 }, { name: "Milk", quantity: 80 }, { name: "Vanilla Extract", quantity: 5 }] },
      { name: "Cream Cheese Frosting", unit: "g", pricePerUnit: 0.95, stock: 6000, lowStockAlert: 800, recipe: [{ name: "Sugar", quantity: 260 }, { name: "Butter", quantity: 180 }, { name: "Cream Cheese", quantity: 220 }, { name: "Milk", quantity: 80 }] },
      { name: "Strawberry Frosting", unit: "g", pricePerUnit: 0.92, stock: 5000, lowStockAlert: 700, recipe: [{ name: "Sugar", quantity: 280 }, { name: "Butter", quantity: 220 }, { name: "Strawberries", quantity: 120 }, { name: "Milk", quantity: 80 }] },
      { name: "Chocolate Ganache", unit: "g", pricePerUnit: 1.1, stock: 4000, lowStockAlert: 500, recipe: [{ name: "Chocolate", quantity: 300 }, { name: "Cream", quantity: 200 }, { name: "Butter", quantity: 50 }] },
      { name: "Caramel Cream", unit: "g", pricePerUnit: 1, stock: 3000, lowStockAlert: 400, recipe: [{ name: "Sugar", quantity: 300 }, { name: "Butter", quantity: 150 }, { name: "Cream", quantity: 200 }, { name: "Milk", quantity: 80 }] },
      { name: "Vanilla Cupcake Base", unit: "g", pricePerUnit: 0.75, stock: 5000, lowStockAlert: 700, recipe: [{ name: "Flour", quantity: 220 }, { name: "Sugar", quantity: 140 }, { name: "Butter", quantity: 120 }, { name: "Milk", quantity: 120 }, { name: "Eggs", quantity: 2 }, { name: "Vanilla Extract", quantity: 10 }, { name: "Baking Powder", quantity: 8 }, { name: "Salt", quantity: 2 }] },
      { name: "Chocolate Cupcake Base", unit: "g", pricePerUnit: 0.82, stock: 4500, lowStockAlert: 650, recipe: [{ name: "Flour", quantity: 220 }, { name: "Sugar", quantity: 130 }, { name: "Butter", quantity: 120 }, { name: "Milk", quantity: 110 }, { name: "Eggs", quantity: 2 }, { name: "Cocoa Powder", quantity: 40 }, { name: "Baking Powder", quantity: 8 }, { name: "Salt", quantity: 2 }] },
      { name: "Red Velvet Cupcake Base", unit: "g", pricePerUnit: 0.88, stock: 4000, lowStockAlert: 550, recipe: [{ name: "Flour", quantity: 220 }, { name: "Sugar", quantity: 140 }, { name: "Butter", quantity: 120 }, { name: "Milk", quantity: 110 }, { name: "Eggs", quantity: 2 }, { name: "Cocoa Powder", quantity: 20 }, { name: "Food Color Red", quantity: 4 }, { name: "Vinegar", quantity: 5 }, { name: "Baking Powder", quantity: 8 }, { name: "Salt", quantity: 2 }] },
      { name: "Strawberry Cupcake Base", unit: "g", pricePerUnit: 0.9, stock: 4000, lowStockAlert: 550, recipe: [{ name: "Flour", quantity: 220 }, { name: "Sugar", quantity: 150 }, { name: "Butter", quantity: 120 }, { name: "Milk", quantity: 120 }, { name: "Eggs", quantity: 2 }, { name: "Strawberries", quantity: 60 }, { name: "Vanilla Extract", quantity: 10 }, { name: "Baking Powder", quantity: 8 }, { name: "Salt", quantity: 2 }] },
      { name: "Egg Wash", unit: "ml", pricePerUnit: 0.3, stock: 2500, lowStockAlert: 300, recipe: [{ name: "Eggs", quantity: 2 }, { name: "Milk", quantity: 20 }] },
      { name: "Honey Glaze", unit: "ml", pricePerUnit: 0.34, stock: 2000, lowStockAlert: 250, recipe: [{ name: "Honey", quantity: 80 }, { name: "Butter", quantity: 20 }, { name: "Milk", quantity: 15 }] },
    ],
  },
};

const FIRST_BAKERY_SEED = BAKERY_PROFILES.bakery1;
const MIN_SEEDED_STOCK = 20000;

function normalizeSeed(seed) {
  if (Array.isArray(seed)) {
    return {
      raw: seed.filter((item) => !Array.isArray(item.recipe) || item.recipe.length === 0),
      compounds: seed.filter((item) => Array.isArray(item.recipe) && item.recipe.length > 0),
    };
  }

  if (seed && Array.isArray(seed.raw) && Array.isArray(seed.compounds)) {
    return seed;
  }

  return FIRST_BAKERY_SEED;
}

function resolveProfileKey(bakeryDoc) {
  const forced = String(profile || "").toLowerCase().trim();
  if (forced && BAKERY_PROFILES[forced]) return forced;

  const name = String(bakeryDoc?.name || bakeryName || "").toLowerCase();
  if (name.includes("bread") || name.includes("pizza") || /\b2\b/.test(name)) return "bakery2";
  if (name.includes("cake") || name.includes("cupcake") || /\b3\b/.test(name)) return "bakery3";
  return "bakery1";
}

function getSeedForBakery(bakeryDoc) {
  const key = resolveProfileKey(bakeryDoc);
  return BAKERY_PROFILES[key] || FIRST_BAKERY_SEED;
}

async function loadInput(file) {
  if (!file) return FIRST_BAKERY_SEED;

  try {
    const resolvedPath = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
    return JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
  } catch (err) {
    console.error("Failed to read input file, using baked-in seed:", err.message);
    return FIRST_BAKERY_SEED;
  }
}

function toRecipeRefs(recipeItems, ingredientByName) {
  return recipeItems.map((recipeItem) => {
    const ingredient = ingredientByName.get(recipeItem.name);
    if (!ingredient) {
      throw new Error(`Missing raw ingredient for recipe item: ${recipeItem.name}`);
    }

    return {
      ingredientId: ingredient._id,
      quantity: recipeItem.quantity,
    };
  });
}

async function upsertIngredient(bakeryDoc, item, recipe = []) {
  const seededStock = Math.max(Number(item.stock ?? 0), MIN_SEEDED_STOCK);

  const existing = await Ingredient.findOneAndUpdate(
    { bakeryId: bakeryDoc._id, name: item.name },
    {
      bakeryId: bakeryDoc._id,
      name: item.name,
      unit: item.unit,
      pricePerUnit: item.pricePerUnit,
      stock: seededStock,
      minStock: item.lowStockAlert ?? item.minStock ?? 0,
      isActive: item.isActive ?? true,
      recipe,
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  await BakeryInventory.findOneAndUpdate(
    { bakeryId: bakeryDoc._id, ingredientId: existing._id },
    { quantityAvailable: seededStock },
    { upsert: true, returnDocument: "after" }
  );

  return existing;
}

async function main() {
  const connectionString = process.env.DATABASE_CONNECTION_STRING;
  if (!connectionString) {
    console.error("DATABASE_CONNECTION_STRING not found in .env");
    process.exit(1);
  }

  await mongoose.connect(connectionString);

  try {
    const bakery = bakeryId
      ? await Bakery.findById(bakeryId)
      : await Bakery.findOne({ name: bakeryName });

    if (!bakery) {
      throw new Error(bakeryId ? "Bakery not found with provided bakeryId" : "Bakery not found with provided bakeryName");
    }

    const seed = inputFile ? normalizeSeed(await loadInput(inputFile)) : getSeedForBakery(bakery);

    const ingredientByName = new Map();

    for (const item of seed.raw) {
      const ingredient = await upsertIngredient(bakery, item, []);
      ingredientByName.set(ingredient.name, ingredient);
      console.log(`Upserted raw ingredient: ${ingredient.name}`);
    }

    for (const item of seed.compounds) {
      const recipe = toRecipeRefs(item.recipe || [], ingredientByName);
      const ingredient = await upsertIngredient(bakery, item, recipe);
      ingredientByName.set(ingredient.name, ingredient);
      console.log(`Upserted compound ingredient: ${ingredient.name}`);
    }

    console.log(`Seeding complete for bakery: ${bakery.name}`);
  } catch (err) {
    console.error("Error seeding inventory:", err.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
}

main();
