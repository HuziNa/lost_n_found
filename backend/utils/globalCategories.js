import Category from "../models/Category.js";

export const DEFAULT_GLOBAL_CATEGORIES = ["Cake", "Cupcake", "Pizza", "Bread"];

export const ensureGlobalCategories = async () => {
  const existing = await Category.find({
    name: { $in: DEFAULT_GLOBAL_CATEGORIES },
  }).lean();

  const existingNames = new Set(
    existing.map((category) => category.name.toLowerCase()),
  );

  const toCreate = DEFAULT_GLOBAL_CATEGORIES.filter(
    (name) => !existingNames.has(name.toLowerCase()),
  ).map((name) => ({ name }));

  if (toCreate.length > 0) {
    try {
      await Category.insertMany(toCreate, { ordered: false });
    } catch (error) {
      if (error.code !== 11000) {
        throw error;
      }
    }
  }

  return Category.find().sort({ name: 1 }).lean();
};
