const STORAGE_KEY = "bakeryCategoryImages";

const CATEGORY_FALLBACKS = {
  cake: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&q=80&auto=format&fit=crop",
  cupcake: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=1200&q=80&auto=format&fit=crop",
  bread: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80&auto=format&fit=crop",
  pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80&auto=format&fit=crop",
  default: "https://images.unsplash.com/photo-1509409137281-5a36f620dddf?w=1200&q=80&auto=format&fit=crop",
};

const inferCategoryKey = (product = {}) => {
  const categoryName = String(product?.category?.name || product?.categoryName || "").toLowerCase();
  const productType = String(product?.type || "").toLowerCase();
  const productName = String(product?.name || "").toLowerCase();
  const haystack = `${categoryName} ${productType} ${productName}`;

  if (haystack.includes("cupcake")) return "cupcake";
  if (haystack.includes("bread")) return "bread";
  if (haystack.includes("pizza")) return "pizza";
  if (haystack.includes("cake")) return "cake";
  return "default";
};

export const loadCategoryImages = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    return {};
  }
};

export const saveCategoryImages = (images) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
};

export const setCategoryImage = (categoryId, imageUrl) => {
  if (!categoryId || !imageUrl) return;
  const images = loadCategoryImages();
  images[categoryId] = imageUrl;
  saveCategoryImages(images);
};

export const getCategoryImage = (categoryId) => {
  const images = loadCategoryImages();
  return images[categoryId] || "";
};

export const getProductImageWithCategoryFallback = (product = {}) => {
  const explicitImage = String(product?.imageUrl || "").trim();
  if (explicitImage) return explicitImage;

  const key = inferCategoryKey(product);
  return CATEGORY_FALLBACKS[key] || CATEGORY_FALLBACKS.default;
};
