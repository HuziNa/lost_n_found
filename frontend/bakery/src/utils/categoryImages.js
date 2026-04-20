const STORAGE_KEY = "bakeryCategoryImages";

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
