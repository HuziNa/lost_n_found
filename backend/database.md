# 🧁 Bakery Management & Custom Ordering System

## 📚 Complete Backend Schema Documentation (AI-Ready Context)

---

# 🧠 1. SYSTEM OVERVIEW

This backend system is designed to support:

* Multi-role users (customer, bakery owner, admin)
* Bakery and product management
* Both **fixed** and **customizable** products
* Ingredient-based inventory tracking
* Dynamic recipe computation
* Order processing with accurate stock deduction
* Review system

---

# 🎯 CORE PRINCIPLE

> 🔥 Every product (fixed or custom) must resolve to:

```text
Ingredient → Quantity → Inventory Deduction
```

---

# 🏗️ 2. HIGH-LEVEL ARCHITECTURE

```text
User
  ↓
Bakery
  ↓
Category
  ↓
Product
  ├── Fixed → Product.ingredients
  └── Custom → ProductOptions → OptionChoices
                      ↓
                  Order.selectedOptions
                      ↓
                 Ingredients
                      ↓
              BakeryInventory
```

---

# 👤 3. USER SYSTEM

## 📌 User Schema

### Fields:

* `name`
* `email` (unique)
* `password`
* `address`
* `role`:

  * `customer`
  * `bakeryOwner`
  * `admin`
* `bakeryManaged`: reference to Bakery

---

## 🔗 Relationships:

* A **bakeryOwner** manages one bakery
* A **customer** places orders
* An **admin** is a global admin who sees all the bakeries analytics

---

# 🏪 4. BAKERY SYSTEM

## 📌 Bakery Schema

### Fields:

* `name`
* `ownerId` → User
* `isActive`

---

## 🔗 Relationships:

* One bakery belongs to one owner
* A bakery contains:

  * products
  * ingredients
  * inventory
  * categories

---

# 🗂️ 5. CATEGORY SYSTEM

## 📌 Category Schema

### Fields:

* `bakeryId`
* `name`

---

## 🔗 Purpose:

* Groups products (e.g., Cakes, Pastries, Pizza)

---

# 🧁 6. PRODUCT SYSTEM

## 📌 Product Schema

### Fields:

* `bakeryId`
* `categoryId`
* `name`
* `type`: `"FIXED"` | `"CUSTOMIZABLE"`
* `basePrice`
* `ingredients[]` (ONLY for FIXED products)
* `allergens[]`
* `nutrition`
* `isActive`

---

# 🟢 FIXED PRODUCTS

### Example:

* Cheesecake
* Brownie
* Croissant

### Recipe Source:

```text
Product.ingredients[]
```

Each entry:

* `ingredientId`
* `quantity`

---

### Flow:

```text
Product → ingredients[] → Ingredient → Inventory
```

---

# 🎨 CUSTOMIZABLE PRODUCTS

### Example:

* Make Your Own Cake
* Custom Pizza

### Recipe Source:

```text
ProductOption → OptionChoice → Ingredient
```

---

# 🎯 7. CUSTOMIZATION SYSTEM

## 📌 ProductOption Schema

Defines what user can choose.

### Fields:

* `productId`
* `name` (e.g., Sponge, Frosting)
* `required`
* `perLayer`
* `maxSelections`
* `choices[]`

---

## 📌 OptionChoice Schema

Defines each selectable choice.

for example if sponge was selected then this will determine what kind of sponge choco or strawberry  
### Fields:

* `name`
* `ingredientId`
* `quantity`
* `extraPrice`

---

## 🔗 Relationships:

```text
Product
  → ProductOption
      → OptionChoice
          → Ingredient
```

---

# 🧠 SPECIAL FIELD: `perLayer`

If:

```text
perLayer = true
```

👉 Means:

* Option applies to each layer separately

---

### Example:

3-layer cake:

```text
Layer 1 → Chocolate
Layer 2 → Chocolate
Layer 3 → Vanilla
```

---

# 🧪 8. INGREDIENT SYSTEM

## 📌 Ingredient Schema

### Fields:

* `bakeryId`
* `name`
* `unit`: g | ml | pcs
* `pricePerUnit`
* `recipe[]` (for compound ingredients)

---

## 🟢 RAW INGREDIENTS

* Flour
* Eggs
* Sugar

---

## 🔵 COMPOUND INGREDIENTS

Example:

```text
Chocolate Frosting = Cocoa + Cream + Sugar
```

Stored as:

```text
ingredient.recipe[]
```

---

## 🔥 IMPORTANT RULE

> Always expand compound ingredients into raw ingredients before inventory deduction.

---

# 📦 9. INVENTORY SYSTEM

## 📌 BakeryInventory Schema

### Fields:

* `bakeryId`
* `ingredientId`
* `quantityAvailable`

---

## 🔗 Unique Index:

```text
(bakeryId, ingredientId)
```

---

## 📌 Purpose:

Tracks stock of each ingredient per bakery

---

# 🧾 10. ORDER SYSTEM

## 📌 Order Schema

### Fields:

* `userId`
* `bakeryId`
* `items[]`
* `totalPrice`
* `status`

---

## 📌 OrderItem Schema

### Fields:

* `productId`
* `quantity`
* `selectedOptions[]`
* `finalPrice`

---

## 📌 selectedOptions Schema (CRITICAL)

### Fields:

* `optionName`
* `choiceName`
* `ingredientId`
* `quantity`
* `layer`

---

# 🔥 IMPORTANT CONCEPT

> `selectedOptions` stores the **final snapshot of the order**

---

## ❗ WHY THIS IS IMPORTANT

* Product options may change later
* Prices may change
* Recipes may change

👉 But orders must remain consistent

---

# 🔄 11. ORDER PROCESSING FLOW

## Step 1: Validate Product

---

## Step 2: Determine Type

### FIXED:

```text
Use Product.ingredients
```

### CUSTOM:

```text
Use selectedOptions → OptionChoices
```

---

## Step 3: Build Ingredient List

```text
Aggregate ingredientId + quantity
```

---

## Step 4: Expand Compound Ingredients

```text
If ingredient.recipe exists:
  break into sub-ingredients recursively
```

---

## Step 5: Aggregate Totals

Example:

```text
Flour → 400g
Eggs → 4
Sugar → 200g
```

---

## Step 6: Check Inventory

```text
If stock < required → reject order
```

---

## Step 7: Deduct Inventory

```text
quantityAvailable -= usedAmount
```

---

## Step 8: Save Order

Store:

* Order
* OrderItems
* selectedOptions

---

# 💰 12. PRICING SYSTEM

## Formula:

```text
Final Price =
  basePrice
  + sum(extraPrice from choices)
```

---

## Multiply:

```text
finalPrice × quantity
```

---

# ⭐ 13. REVIEW SYSTEM

## 📌 Review Schema

### Fields:

* `userId`
* `bakeryId`
* `rating`
* `comment`
* `isHidden`

---

## 🔗 Constraint:

```text
One user → one review per bakery
```

---

# ⚠️ 14. CRITICAL DESIGN RULES

## ❗ Rule 1

Do NOT mix fixed and custom logic

---

## ❗ Rule 2

Always use `selectedOptions` as source of truth

---

## ❗ Rule 3

Always expand compound ingredients

---

## ❗ Rule 4

Always check inventory BEFORE deduction

---

## ❗ Rule 5

Never recalculate old orders

---

# 🧠 FINAL MENTAL MODEL

```text
FIXED PRODUCT:
  Product → ingredients → Ingredient → Inventory

CUSTOM PRODUCT:
  Product → Options → Choices
          → selectedOptions (Order)
          → Ingredient → Inventory
```

---

# 🚀 API BUILDING CONTEXT (FOR AI)

## Suggested Order:

1. Auth APIs
2. Bakery APIs
3. Category APIs
4. Ingredient APIs
5. Inventory APIs
6. Product APIs
7. ProductOption APIs
8. Order APIs
9. Review APIs

---

# 🎯 FINAL GOAL

Build a system where:

> Every order can be traced back to exact ingredient usage and inventory impact with zero ambiguity.

---
