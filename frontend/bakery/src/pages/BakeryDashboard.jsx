import React, { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBakeryIngredient,
  createBakeryProduct,
  deleteBakeryProduct,
  getBakeryAnalytics,
  getBakeryCategories,
  getBakeryIngredients,
  getBakeryOrders,
  getBakeryProducts,
  getBakeryReviews,
  updateBakeryOrderStatus,
  updateBakeryProfile,
  updateBakeryProduct,
  updateBakeryIngredient,
  deleteBakeryIngredient,
  getBakeryVouchers,
  createBakeryVoucher,
  updateBakeryVoucher,
  deleteBakeryVoucher,
} from "../api/bakery";
import BakerySidebar from "../components/BakerySidebar";
import { Icon } from "../components/customize/Icons";
import { useAuth } from "../context/AuthContext";
import { getTemplateByCategory, CUSTOMIZER_TEMPLATES, getPresetToppingsForTemplate } from "../constants/customizerTemplates";

const ORDER_STATUSES = ["pending", "baking", "ready", "completed", "cancelled"];

const EMPTY_NUTRITION = {
  calories: "",
  protein: "",
  carbohydrates: "",
  fats: "",
  sugar: "",
  fiber: "",
};

const createEmptyProductOptionChoice = () => ({
  name: "",
  ingredientId: "",
  quantity: "1",
  extraPrice: "",
});

const createPresetChoice = (name, extraPrice = "") => ({
  name,
  ingredientId: "",
  quantity: "1",
  extraPrice: extraPrice === "" ? "" : String(extraPrice),
});

const createEmptyProductOption = () => ({
  name: "",
  required: false,
  perLayer: false,
  maxSelections: "1",
  choices: [createEmptyProductOptionChoice()],
});

const createOptionFromSegment = (segment, templateKey) => {
  let choices = [createEmptyProductOptionChoice()];
  const presetToppings = getPresetToppingsForTemplate(templateKey);
  
  if (segment.key === "tiers") {
    choices = [
      createPresetChoice("1 Tier", 0),
      createPresetChoice("2 Tiers", 500),
      createPresetChoice("3 Tiers", 1200),
    ];
  } else if (segment.key === "size") {
    if (templateKey === "PIZZA") {
      choices = [
        createPresetChoice("Personal", 0),
        createPresetChoice("Medium", 200),
        createPresetChoice("Large", 400),
        createPresetChoice("XL", 650),
      ];
    } else if (templateKey === "BREAD") {
      choices = [
        createPresetChoice("Small Loaf", 0),
        createPresetChoice("Classic Loaf", 120),
        createPresetChoice("Family Loaf", 260),
      ];
    } else if (templateKey === "CUPCAKE") {
      choices = [
        createPresetChoice("Mini", 0),
        createPresetChoice("Classic", 80),
        createPresetChoice("Jumbo", 160),
      ];
    }
  } else if (segment.key === "shape") {
    if (templateKey === "PIZZA") {
      choices = [createPresetChoice("Round", 0), createPresetChoice("Square", 0)];
    } else if (templateKey === "BREAD") {
      choices = [
        createPresetChoice("Classic Loaf", 0),
        createPresetChoice("Baguette", 40),
        createPresetChoice("Boule", 60),
        createPresetChoice("Rolls", 80),
      ];
    }
  } else if (segment.key === "crust") {
    choices = [
      createPresetChoice("Thin Crust", 0),
      createPresetChoice("Classic", 0),
      createPresetChoice("Stuffed", 250),
    ];
  } else if (segment.key === "sauce") {
    choices = [
      createPresetChoice("Tomato Basil", 0),
      createPresetChoice("BBQ", 50),
      createPresetChoice("White Garlic", 60),
      createPresetChoice("Pesto", 70),
    ];
  } else if (segment.key === "cheese") {
    choices = [
      createPresetChoice("Light", 0),
      createPresetChoice("Regular", 0),
      createPresetChoice("Extra", 150),
    ];
  } else if (segment.key === "spice") {
    choices = [
      createPresetChoice("Mild", 0),
      createPresetChoice("Spicy", 30),
      createPresetChoice("Extra Hot", 60),
    ];
  } else if (segment.key === "bake") {
    choices = [
      createPresetChoice("Light Bake", 0),
      createPresetChoice("Golden Bake", 20),
      createPresetChoice("Extra Crisp", 40),
    ];
  } else if (segment.key === "glaze") {
    choices = [
      createPresetChoice("No Glaze", 0),
      createPresetChoice("Egg Wash", 20),
      createPresetChoice("Honey Glaze", 40),
    ];
  } else if (segment.key === "sliced") {
    choices = [createPresetChoice("Whole", 0), createPresetChoice("Sliced", 0)];
  } else if (segment.key === "flavor") {
    choices = [
      createPresetChoice("Vanilla", 0),
      createPresetChoice("Chocolate", 0),
      createPresetChoice("Red Velvet", 40),
      createPresetChoice("Strawberry", 40),
    ];
  } else if (segment.key === "frosting_flavor") {
    choices = [
      createPresetChoice("Vanilla", 0),
      createPresetChoice("Chocolate", 0),
      createPresetChoice("Cream Cheese", 30),
      createPresetChoice("Strawberry", 30),
    ];
  } else if (segment.key === "layers") {
    choices = [
      createPresetChoice("Classic Swirl", 0),
      createPresetChoice("Double Swirl", 60),
      createPresetChoice("Sky High", 120),
    ];
  } else if (segment.key === "frosting_color") {
    choices = [
      "Classic White", "Lavender Mist", "Soft Pink", "Mint Green", 
      "Lemon Sorbet", "Chocolate Ganache", "Caramel Cream"
    ].map(color => createPresetChoice(color, 0));
  } else if (segment.key === "toppings" || segment.key === "topping") {
    choices = presetToppings.map((topping) => createPresetChoice(topping.name, topping.extraPrice));
  } else if (segment.key === "message") {
      choices = [createPresetChoice("Personalized Message", 0)];
  }

  return {
    name: segment.name,
    required: segment.key === "size" || segment.key === "tiers",
    perLayer: false,
    templateKey: segment.key,
    maxSelections: (segment.key === "toppings" || segment.key === "topping") ? "5" : "1",
    choices: choices,
  };
};

const EMPTY_PRODUCT_FORM = {
  name: "",
  basePrice: "",
  type: "FIXED",
  categoryId: "",
  description: "",
  ingredientsText: "",
  ingredients: [{ ingredientId: "", quantity: "" }],
  options: [],
  selectedTemplate: "", // e.g. "CAKE", "PIZZA"
  allergensText: "",
  nutrition: EMPTY_NUTRITION,
  isActive: true,
};

const getEmptyProductForm = () => ({
  ...EMPTY_PRODUCT_FORM,
  ingredients: [{ ingredientId: "", quantity: "" }],
  options: [],
  nutrition: { ...EMPTY_NUTRITION },
});

export default function BakeryDashboard() {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const bakeryId = user?.bakeryManaged?.id || user?.bakeryManaged?._id || null;

  const [activeTab, setActiveTab] = useState("overview");
  const [orderFilter, setOrderFilter] = useState("all");
  const [actionToast, setActionToast] = useState("");
  const [ingredientModalOpen, setIngredientModalOpen] = useState(false);
  const [productModal, setProductModal] = useState({ open: false, mode: "create", product: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, product: null });
  const [ingredientDelModal, setIngredientDelModal] = useState({ open: false, ingredient: null });
  
  // Voucher states
  const [voucherViewModalOpen, setVoucherViewModalOpen] = useState(false);
  const [voucherModal, setVoucherModal] = useState({ open: false, mode: "create", voucher: null });
  const [voucherDelModal, setVoucherDelModal] = useState({ open: false, voucher: null });
  const [voucherForm, setVoucherForm] = useState({
    code: "",
    description: "",
    discountType: "fixed",
    discountValue: "",
    minOrderAmount: "",
    expiresAt: "",
    isActive: true,
  });
  const [ingredientForm, setIngredientForm] = useState({
    id: null,
    name: "",
    unit: "",
    pricePerUnit: "",
    stock: "",
    minStock: "",
    recipe: [],
  });
  const [productForm, setProductForm] = useState(() => getEmptyProductForm());
  const [storyForm, setStoryForm] = useState("");
  const [quoteForm, setQuoteForm] = useState("");
  const [imageUrlForm, setImageUrlForm] = useState("");
  const [productOptionBuilderMode, setProductOptionBuilderMode] = useState("owner");
  const [showAdvancedOptionFields, setShowAdvancedOptionFields] = useState(false);
  const [statsForm, setStatsForm] = useState({
    years: "",
    customers: "",
    recipes: "",
    baked: "",
  });
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [formError, setFormError] = useState("");
  const toastTimer = useRef(null);

  const showActionToast = (message) => {
    setActionToast(message);
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }
    toastTimer.current = setTimeout(() => setActionToast(""), 2000);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    setStoryForm(user?.bakeryManaged?.myStory || "");
    setQuoteForm(user?.bakeryManaged?.storyQuote || "");
    setImageUrlForm(user?.bakeryManaged?.imageUrl || "");
    setStatsForm({
      years: user?.bakeryManaged?.statsYears || "",
      customers: user?.bakeryManaged?.statsCustomers || "",
      recipes: user?.bakeryManaged?.statsRecipes || "",
      baked: user?.bakeryManaged?.statsBaked || "",
    });
  }, [
    user?.bakeryManaged?.myStory,
    user?.bakeryManaged?.storyQuote,
    user?.bakeryManaged?.imageUrl,
    user?.bakeryManaged?.statsYears,
    user?.bakeryManaged?.statsCustomers,
    user?.bakeryManaged?.statsRecipes,
    user?.bakeryManaged?.statsBaked,
  ]);

  const analyticsQuery = useQuery({
    queryKey: ["bakeryAnalytics"],
    queryFn: getBakeryAnalytics,
    enabled: !!bakeryId,
  });

  const ingredientsQuery = useQuery({
    queryKey: ["bakeryIngredients"],
    queryFn: getBakeryIngredients,
    enabled: !!bakeryId,
  });

  const categoriesQuery = useQuery({
    queryKey: ["bakeryCategories"],
    queryFn: () => getBakeryCategories(),
    enabled: !!bakeryId,
  });

  const productsQuery = useQuery({
    queryKey: ["bakeryProducts"],
    queryFn: getBakeryProducts,
    enabled: !!bakeryId,
  });

  const ordersQuery = useQuery({
    queryKey: ["bakeryOrders", orderFilter],
    queryFn: () => getBakeryOrders(orderFilter === "all" ? {} : { status: orderFilter }),
    enabled: user?.role === "bakeryOwner",
  });

  const reviewsQuery = useQuery({
    queryKey: ["bakeryOwnerReviews", bakeryId],
    queryFn: () => getBakeryReviews(bakeryId),
    enabled: !!bakeryId,
  });

  const vouchersQuery = useQuery({
    queryKey: ["bakeryVouchers", bakeryId],
    queryFn: () => getBakeryVouchers(),
    enabled: !!bakeryId,
  });

  const createIngredientMutation = useMutation({
    mutationFn: createBakeryIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bakeryIngredients"] });
      setIngredientModalOpen(false);
      setIngredientForm({ id: null, name: "", unit: "", pricePerUnit: "", stock: "", minStock: "", recipe: [] });
      showActionToast("Ingredient created.");
    },
    onError: (error) => {
      setFormError(error?.data?.message || "Unable to create ingredient.");
    },
  });

  const updateIngredientMutation = useMutation({
    mutationFn: ({ ingredientId, payload }) => updateBakeryIngredient(ingredientId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bakeryIngredients"] });
      setIngredientModalOpen(false);
      setIngredientForm({ id: null, name: "", unit: "", pricePerUnit: "", stock: "", minStock: "", recipe: [] });
      showActionToast("Ingredient updated.");
    },
    onError: (error) => {
      setFormError(error?.data?.message || "Unable to update ingredient.");
    },
  });

  const deleteIngredientMutation = useMutation({
    mutationFn: deleteBakeryIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bakeryIngredients"] });
      setIngredientDelModal({ open: false, ingredient: null });
      showActionToast("Ingredient deleted.");
    },
  });


  const createProductMutation = useMutation({
    mutationFn: createBakeryProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bakeryProducts"] });
      setProductModal({ open: false, mode: "create", product: null });
      setProductForm({
        ...getEmptyProductForm(),
        categoryId: categories[0]?.id || "",
      });
      showActionToast("Product created.");
    },
    onError: (error) => {
      setFormError(error?.data?.message || "Unable to create product.");
    },
  });
  const updateProductMutation = useMutation({
    mutationFn: ({ productId, payload }) => updateBakeryProduct(productId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bakeryProducts"] });
      setProductModal({ open: false, mode: "create", product: null });
      setProductForm({
        ...getEmptyProductForm(),
        categoryId: categories[0]?.id || "",
      });
      showActionToast("Product updated.");
    },
    onError: (error) => {
      setFormError(error?.data?.message || "Unable to update product.");
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (productId) => deleteBakeryProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bakeryProducts"] });
      setDeleteModal({ open: false, product: null });
      showActionToast("Product deleted.");
    },
    onError: (error) => {
      setFormError(error?.data?.message || "Unable to delete product.");
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: ({ orderId, status }) => updateBakeryOrderStatus(orderId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bakeryOrders"] });
      showActionToast("Order status updated.");
    },
  });

  const updateBakeryProfileMutation = useMutation({
    mutationFn: updateBakeryProfile,
    onSuccess: async () => {
      await refreshUser();
      showActionToast("Bakery profile updated.");
    },
    onError: (error) => {
      setFormError(error?.data?.message || "Unable to update bakery profile.");
    },
  });

  const createVoucherMutation = useMutation({
    mutationFn: createBakeryVoucher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bakeryVouchers"] });
      setVoucherModal({ open: false, mode: "create", voucher: null });
      showActionToast("Voucher created.");
    },
    onError: (error) => {
      setFormError(error?.data?.message || "Unable to create voucher.");
    },
  });

  const updateVoucherMutation = useMutation({
    mutationFn: ({ voucherId, payload }) => updateBakeryVoucher(voucherId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bakeryVouchers"] });
      setVoucherModal({ open: false, mode: "create", voucher: null });
      showActionToast("Voucher updated.");
    },
    onError: (error) => {
      setFormError(error?.data?.message || "Unable to update voucher.");
    },
  });

  const deleteVoucherMutation = useMutation({
    mutationFn: deleteBakeryVoucher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bakeryVouchers"] });
      setVoucherDelModal({ open: false, voucher: null });
      showActionToast("Voucher deleted.");
    },
  });

  const analytics = analyticsQuery.data?.analytics || {};
  const ordersByStatus = analytics.ordersByStatus || {};
  const ingredients = ingredientsQuery.data?.ingredients || [];
  const categories = categoriesQuery.data?.categories || [];
  const products = productsQuery.data?.products || [];
  const orders = ordersQuery.data?.orders || ordersQuery.data?.bakeryOrders || [];
  const reviews = reviewsQuery.data?.reviews || [];

  const getStockLabel = (ingredient) => {
    const stockValue = ingredient?.stock;
    if (stockValue === null || stockValue === undefined || Number.isNaN(Number(stockValue))) {
      return "Not tracked";
    }

    const numericStock = Number(stockValue);
    const unitSuffix = ingredient?.unit ? ` ${ingredient.unit}` : "";
    return `${numericStock.toLocaleString()}${unitSuffix}`;
  };

  const openCreateProductModal = () => {
    setFormError("");
    setProductOptionBuilderMode("owner");
    setShowAdvancedOptionFields(false);
    setProductForm({
      ...getEmptyProductForm(),
      categoryId: categories[0]?.id || "",
    });
    setProductModal({ open: true, mode: "create", product: null });
  };

  const openEditProductModal = (product) => {
    setFormError("");
    setProductOptionBuilderMode("owner");
    setShowAdvancedOptionFields(false);
    setProductForm({
      name: product.name || "",
      basePrice: product.basePrice || "",
      type: product.type || "FIXED",
      categoryId: product.categoryId || categories[0]?.id || "",
      description: product.description || "",
      imageUrl: product.imageUrl || "",
      ingredientsText: product.ingredientsText || "",
      ingredients:
        product.ingredients?.length > 0
          ? product.ingredients.map((item) => ({
              ingredientId: item.ingredientId || "",
              quantity: item.quantity ?? "",
            }))
          : [{ ingredientId: "", quantity: "" }],
      options:
        product.options?.length > 0
          ? product.options.map((option) => ({
              name: option.name || "",
              required: !!option.required,
              perLayer: !!option.perLayer,
              templateKey: option.templateKey || "",
              maxSelections:
                option.maxSelections === null || option.maxSelections === undefined
                  ? ""
                  : String(option.maxSelections),
              choices:
                option.choices?.length > 0
                  ? option.choices.map((choice) => ({
                      name: choice.name || "",
                      ingredientId: choice.ingredientId || "",
                      quantity: choice.quantity ?? "",
                      extraPrice: choice.extraPrice ?? "",
                    }))
                  : [createEmptyProductOptionChoice()],
            }))
          : [],
      allergensText: (product.allergens || []).join(", "),
      nutrition: {
        calories: product.nutrition?.calories ?? "",
        protein: product.nutrition?.protein ?? "",
        carbohydrates: product.nutrition?.carbohydrates ?? "",
        fats: product.nutrition?.fats ?? "",
        sugar: product.nutrition?.sugar ?? "",
        fiber: product.nutrition?.fiber ?? "",
      },
      isActive: product.isActive !== false,
    });
    setProductModal({ open: true, mode: "edit", product });
  };

  const toggleProductIngredientSelection = (ingredientId, checked) => {
    setProductForm((prev) => {
      const current = prev.ingredients || [];
      const exists = current.some((item) => String(item.ingredientId) === String(ingredientId));

      if (checked) {
        if (exists) return prev;
        return {
          ...prev,
          ingredients: [...current, { ingredientId, quantity: "1" }],
        };
      }

      return {
        ...prev,
        ingredients: current.filter((item) => String(item.ingredientId) !== String(ingredientId)),
      };
    });
  };

  const updateProductIngredientQuantityById = (ingredientId, quantity) => {
    setProductForm((prev) => ({
      ...prev,
      ingredients: (prev.ingredients || []).map((item) =>
        String(item.ingredientId) === String(ingredientId) ? { ...item, quantity } : item,
      ),
    }));
  };

  const addProductOptionGroup = () => {
    setProductForm((prev) => ({
      ...prev,
      options: [...(prev.options || []), createEmptyProductOption()],
    }));
  };

  const removeProductOptionGroup = (index) => {
    setProductForm((prev) => ({
      ...prev,
      options: (prev.options || []).filter((_, optionIndex) => optionIndex !== index),
    }));
  };

  const updateProductOptionGroup = (index, field, value) => {
    setProductForm((prev) => ({
      ...prev,
      options: (prev.options || []).map((option, optionIndex) =>
        optionIndex === index ? { ...option, [field]: value } : option,
      ),
    }));
  };

  const addProductOptionChoice = (optionIndex) => {
    setProductForm((prev) => ({
      ...prev,
      options: (prev.options || []).map((option, rowIndex) =>
        rowIndex === optionIndex
          ? { ...option, choices: [...(option.choices || []), createEmptyProductOptionChoice()] }
          : option,
      ),
    }));
  };

  const removeProductOptionChoice = (optionIndex, choiceIndex) => {
    setProductForm((prev) => ({
      ...prev,
      options: (prev.options || []).map((option, rowIndex) => {
        if (rowIndex !== optionIndex) return option;
        const nextChoices = (option.choices || []).filter((_, currentChoiceIndex) => currentChoiceIndex !== choiceIndex);
        return {
          ...option,
          choices: nextChoices.length > 0 ? nextChoices : [createEmptyProductOptionChoice()],
        };
      }),
    }));
  };

  const updateProductOptionChoice = (optionIndex, choiceIndex, field, value) => {
    setProductForm((prev) => ({
      ...prev,
      options: (prev.options || []).map((option, rowIndex) => {
        if (rowIndex !== optionIndex) return option;
        return {
          ...option,
          choices: (option.choices || []).map((choice, currentChoiceIndex) =>
            currentChoiceIndex === choiceIndex ? { ...choice, [field]: value } : choice,
          ),
        };
      }),
    }));
  };

  const applyProductOptionPreset = (preset) => {
    setProductForm((prev) => ({
      ...prev,
      options: preset,
    }));
    setFormError("");
  };

  const handleIngredientSubmit = (event) => {
    event.preventDefault();
    setFormError("");

    const parsedStock = ingredientForm.stock === "" ? 0 : Number(ingredientForm.stock);
    const parsedMinStock = ingredientForm.minStock === "" ? 0 : Number(ingredientForm.minStock);

    if (!Number.isFinite(parsedStock) || parsedStock < 0) {
      setFormError("Stock must be a number greater than or equal to 0.");
      return;
    }

    if (!Number.isFinite(parsedMinStock) || parsedMinStock < 0) {
      setFormError("Low-stock alert must be a number greater than or equal to 0.");
      return;
    }

    const payload = {
      name: ingredientForm.name,
      unit: ingredientForm.unit,
      pricePerUnit: ingredientForm.pricePerUnit === "" ? undefined : Number(ingredientForm.pricePerUnit),
      stock: parsedStock,
      minStock: parsedMinStock,
      recipe: (ingredientForm.recipe || [])
        .map((r) => ({
          ingredientId: r.ingredientId,
          quantity: Number(r.quantity),
        }))
        .filter((r) => r.ingredientId && r.quantity > 0),
    };

    if (ingredientForm.id) {
      updateIngredientMutation.mutate({ ingredientId: ingredientForm.id, payload });
    } else {
      createIngredientMutation.mutate(payload);
    }
  };

  const handleProductSubmit = (event) => {
    event.preventDefault();
    setFormError("");

    const parsedIngredients = (productForm.ingredients || [])
      .map((item) => ({
        ingredientId: String(item.ingredientId || "").trim(),
        quantity: Number(item.quantity),
      }))
      .filter((item) => item.ingredientId && Number.isFinite(item.quantity) && item.quantity > 0);

    const parsedAllergens = String(productForm.allergensText || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    const parsedNutrition = Object.entries(productForm.nutrition || {}).reduce((acc, [key, value]) => {
      if (value === "" || value === null || value === undefined) {
        return acc;
      }

      const numericValue = Number(value);
      if (Number.isFinite(numericValue)) {
        acc[key] = numericValue;
      }
      return acc;
    }, {});

    const parsedOptions = [];

    if (productForm.type === "CUSTOMIZABLE") {
      const rawOptions = productForm.options || [];

      if (rawOptions.length === 0) {
        setFormError("Add at least one option group for CUSTOMIZABLE products.");
        return;
      }

      for (let optionIndex = 0; optionIndex < rawOptions.length; optionIndex += 1) {
        const rawOption = rawOptions[optionIndex];
        const optionName = String(rawOption.name || "").trim();

        if (!optionName) {
          setFormError(`Option group #${optionIndex + 1} needs a name.`);
          return;
        }

        const rawMaxSelections = String(rawOption.maxSelections ?? "").trim();
        const maxSelections = rawMaxSelections === "" ? null : Number(rawMaxSelections);

        if (maxSelections !== null && (!Number.isInteger(maxSelections) || maxSelections <= 0)) {
          setFormError(`Option group \"${optionName}\" must have a valid max selections value.`);
          return;
        }

        const parsedChoices = [];
        const rawChoices = rawOption.choices || [];

        for (let choiceIndex = 0; choiceIndex < rawChoices.length; choiceIndex += 1) {
          const rawChoice = rawChoices[choiceIndex];
          const choiceName = String(rawChoice.name || "").trim();
          const ingredientId = String(rawChoice.ingredientId || "").trim();
          const quantity =
            rawChoice.quantity === "" || rawChoice.quantity === null || rawChoice.quantity === undefined
              ? 1
              : Number(rawChoice.quantity);
          const extraPrice = rawChoice.extraPrice === "" ? 0 : Number(rawChoice.extraPrice);

          if (!choiceName || !ingredientId || !Number.isFinite(quantity) || quantity <= 0) {
            setFormError(
              `Option \"${optionName}\", choice #${choiceIndex + 1} requires name, ingredient, and quantity > 0.`,
            );
            return;
          }

          parsedChoices.push({
            name: choiceName,
            ingredientId,
            quantity,
            extraPrice: Number.isFinite(extraPrice) ? extraPrice : 0,
          });
        }

        if (parsedChoices.length === 0) {
          setFormError(`Option group \"${optionName}\" must include at least one choice.`);
          return;
        }

        parsedOptions.push({
          name: optionName,
          required: !!rawOption.required,
          perLayer: !!rawOption.perLayer,
          templateKey: rawOption.templateKey || null,
          maxSelections,
          choices: parsedChoices,
        });
      }
    }

    const payload = {
      name: productForm.name,
      basePrice: Number(productForm.basePrice || 0),
      type: productForm.type,
      selectedTemplate: productForm.selectedTemplate || "",
      categoryId: productForm.categoryId,
      description: productForm.description,
      imageUrl: productForm.imageUrl,
      ingredientsText: productForm.ingredientsText,
      ingredients: parsedIngredients,
      options: productForm.type === "CUSTOMIZABLE" ? parsedOptions : [],
      allergens: parsedAllergens,
      nutrition: parsedNutrition,
      isActive: productForm.isActive,
    };

    if (productModal.mode === "edit" && productModal.product) {
      updateProductMutation.mutate({ productId: productModal.product.id, payload });
    } else {
      createProductMutation.mutate(payload);
    }
  };

  const handleStorySubmit = (event) => {
    event.preventDefault();
    setFormError("");
    updateBakeryProfileMutation.mutate({
      myStory: storyForm,
      storyQuote: quoteForm,
      statsYears: statsForm.years,
      statsCustomers: statsForm.customers,
      statsRecipes: statsForm.recipes,
      statsBaked: statsForm.baked,
      imageUrl: imageUrlForm,
    });
  };

  const handleVoucherSubmit = (event) => {
    event.preventDefault();
    setFormError("");
    const payload = {
      code: voucherForm.code,
      description: voucherForm.description,
      discountType: voucherForm.discountType,
      discountValue: voucherForm.discountValue,
      minOrderAmount: voucherForm.minOrderAmount,
      expiresAt: voucherForm.expiresAt,
      isActive: voucherForm.isActive,
    };

    if (voucherModal.mode === "edit" && voucherModal.voucher) {
      updateVoucherMutation.mutate({ voucherId: voucherModal.voucher.id, payload });
    } else {
      createVoucherMutation.mutate(payload);
    }
  };

  const openVoucherModal = (mode = "create", voucher = null) => {
    setFormError("");
    if (mode === "edit" && voucher) {
      setVoucherForm({
        code: voucher.code || "",
        description: voucher.description || "",
        discountType: voucher.discountType || "fixed",
        discountValue: voucher.discountValue || "",
        minOrderAmount: voucher.minOrderAmount || "",
        expiresAt: voucher.expiresAt ? new Date(voucher.expiresAt).toISOString().split('T')[0] : "",
        isActive: voucher.isActive !== false,
      });
    } else {
      setVoucherForm({
        code: "",
        description: "",
        discountType: "fixed",
        discountValue: "",
        minOrderAmount: "",
        expiresAt: "",
        isActive: true,
      });
    }
    setVoucherModal({ open: true, mode, voucher });
  };

  const filteredOrders = orders;

  return (
    <div className="bakery-portal">
      <BakerySidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bakeryLink={bakeryId ? `/bakery/${bakeryId}` : "/bakery"}
      />
      
      <main className="bakery-main">
        <header className="bakery-main-header">
          <div className="header-context">
            <h1 className="header-title">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            <p className="header-subtitle">Welcome back to your artisan workspace.</p>
          </div>
          <div className="header-actions">
            <button className="btn-primary-sm" onClick={openCreateProductModal}>
              <Icon name="plus" className="btn-icon" />
              Add Product
            </button>
            <div className="bakery-status">
              <span className="pips active"></span> Live
            </div>
          </div>
        </header>

        {actionToast && <div className="dashboard-toast">{actionToast}</div>}

        <div className="bakery-content">
          {activeTab === "overview" && (
            <div className="dashboard-grid">
              <div className="stat-card-gold" style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="card-label">Voucher Codes</span>
                <span className="card-value" style={{ fontSize: '20px', margin: '8px 0 16px' }}>Manage discount codes</span>
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <button className="btn-sage" style={{ flex: 1, padding: '8px 4px', fontSize: '10px' }} onClick={() => setVoucherViewModalOpen(true)}>View</button>
                  <button className="btn-outline" style={{ flex: 1, padding: '8px 4px', fontSize: '10px' }} onClick={() => openVoucherModal('create')}>Add</button>
                  <button className="btn-outline" style={{ flex: 1, padding: '8px 4px', fontSize: '10px' }} onClick={() => setVoucherViewModalOpen(true)}>Edit</button>
                </div>
              </div>
              <div className="stat-card-gold">
                <span className="card-label">Active Orders</span>
                <span className="card-value">{analytics.totalOrders || 0}</span>
                <span className="card-trend">
                  {ordersByStatus.pending || 0} pending / {ordersByStatus.completed || 0} completed
                </span>
              </div>

            </div>
          )}

          {activeTab === "ingredients" && (
            <div className="data-table-section">
              <div className="table-header">
                <div>
                  <h2>Inventory Management</h2>
                  <p style={{ margin: "6px 0 0", color: "var(--ink-muted)", fontSize: "13px" }}>
                    Track raw materials and items prepared in-house.
                  </p>
                </div>
                <button
                  className="btn-sage"
                  onClick={() => {
                    setFormError("");
                    setIngredientForm({ id: null, name: "", unit: "", pricePerUnit: "", stock: "", minStock: "", recipe: [] });
                    setIngredientModalOpen(true);
                  }}
                >
                  Add Ingredient
                </button>
              </div>

              {ingredientsQuery.isLoading && <div className="placeholder-box">Loading ingredients...</div>}
              {ingredientsQuery.isError && <div className="placeholder-box">Unable to load ingredients.</div>}
              {!ingredientsQuery.isLoading && ingredients.length === 0 && (
                <div className="placeholder-box">No ingredients in inventory.</div>
              )}

              {ingredients.length > 0 && (
                <div style={{ display: "grid", gap: "32px" }}>
                  {/* RAW MATERIALS */}
                  <div>
                    <h3 style={{ fontSize: "16px", marginBottom: "12px", color: "var(--ink-soft)" }}>Raw Materials</h3>
                    <table className="bakery-table">
                      <thead>
                        <tr>
                          <th>Ingredient</th>
                          <th>Unit</th>
                          <th>Available Stock</th>
                          <th>Price / Unit</th>
                          <th style={{ textAlign: "right" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ingredients.filter(ing => !ing.recipe || ing.recipe.length === 0).map((item) => (
                          <tr key={item.id}>
                            <td className="font-medium">{item.name}</td>
                            <td>{item.unit}</td>
                            <td>
                              {getStockLabel(item)}
                              {item.minStock !== null && item.minStock !== undefined && (
                                <div style={{ fontSize: "11px", color: "var(--ink-muted)" }}>
                                  Alert below {Number(item.minStock).toLocaleString()} {item.unit}
                                </div>
                              )}
                            </td>
                            <td>
                              {item.pricePerUnit !== undefined && item.pricePerUnit !== null
                                ? `Rs ${Number(item.pricePerUnit).toLocaleString()}`
                                : "-"}
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <button
                                className="icon-btn"
                                onClick={() => {
                                  setIngredientForm({
                                    id: item.id,
                                    name: item.name,
                                    unit: item.unit,
                                    pricePerUnit: item.pricePerUnit ?? "",
                                    stock: item.stock ?? "",
                                    minStock: item.minStock ?? "",
                                    recipe: item.recipe || [],
                                  });
                                  setIngredientModalOpen(true);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="icon-btn"
                                onClick={() => setIngredientDelModal({ open: true, ingredient: item })}
                                style={{ marginLeft: "12px" }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* PREPARED ITEMS */}
                  {ingredients.some(ing => ing.recipe && ing.recipe.length > 0) && (
                    <div>
                      <h3 style={{ fontSize: "16px", marginBottom: "12px", color: "var(--ink-soft)" }}>Prepared House Items (Compound)</h3>
                      <table className="bakery-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Components</th>
                            <th>Unit</th>
                            <th>Available Stock</th>
                            <th>Manual Price Override</th>
                            <th style={{ textAlign: "right" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ingredients.filter(ing => ing.recipe && ing.recipe.length > 0).map((item) => (
                            <tr key={item.id}>
                              <td className="font-medium">{item.name}</td>
                              <td style={{ fontSize: "12px", color: "var(--ink-muted)" }}>
                                {item.recipe.length} item{item.recipe.length > 1 ? "s" : ""}
                              </td>
                              <td>{item.unit}</td>
                              <td>
                                {getStockLabel(item)}
                                {item.minStock !== null && item.minStock !== undefined && (
                                  <div style={{ fontSize: "11px", color: "var(--ink-muted)" }}>
                                    Alert below {Number(item.minStock).toLocaleString()} {item.unit}
                                  </div>
                                )}
                              </td>
                              <td>
                                {item.pricePerUnit !== undefined && item.pricePerUnit !== null
                                  ? `Rs ${Number(item.pricePerUnit).toLocaleString()}`
                                  : "-"}
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <button
                                  className="icon-btn"
                                  onClick={() => {
                                    setIngredientForm({
                                      id: item.id,
                                      name: item.name,
                                      unit: item.unit,
                                      pricePerUnit: item.pricePerUnit ?? "",
                                      stock: item.stock ?? "",
                                      minStock: item.minStock ?? "",
                                      recipe: item.recipe || [],
                                    });
                                    setIngredientModalOpen(true);
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  className="icon-btn"
                                  onClick={() => setIngredientDelModal({ open: true, ingredient: item })}
                                  style={{ marginLeft: "12px" }}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "products" && (
            <>
              <div className="data-table-section" style={{ marginBottom: "32px" }}>
                <div className="table-header">
                  <div>
                    <h2>Categories</h2>
                    <p style={{ margin: "6px 0 0", color: "var(--ink-muted)", fontSize: "13px" }}>
                      Admin-defined categories used to organize products.
                    </p>
                  </div>
                </div>
                {categoriesQuery.isLoading && <div className="placeholder-box">Loading categories...</div>}
                {categoriesQuery.isError && <div className="placeholder-box">Unable to load categories.</div>}
                {!categoriesQuery.isLoading && categories.length === 0 && (
                  <div className="placeholder-box">No categories yet.</div>
                )}
                {categories.length > 0 && (
                  <table className="bakery-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category) => (
                        <tr key={category.id}>
                          <td className="font-medium">{category.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="data-table-section">
                <div className="table-header">
                  <h2>Product Catalog</h2>
                  <button className="btn-primary-sm" onClick={openCreateProductModal}>
                    Add Product
                  </button>
                </div>
              {productsQuery.isLoading && <div className="placeholder-box">Loading products...</div>}
              {productsQuery.isError && <div className="placeholder-box">Unable to load products.</div>}
              {!productsQuery.isLoading && products.length === 0 && (
                <div className="placeholder-box">No products found.</div>
              )}
              {products.length > 0 && (
                <table className="bakery-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Type</th>
                      <th>Price</th>
                      <th>Active</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((prod) => (
                      <tr key={prod.id}>
                        <td className="font-medium">{prod.name}</td>
                        <td>{prod.type}</td>
                        <td>Rs {Number(prod.basePrice || 0).toLocaleString()}</td>
                        <td>
                          <span className={`badge ${prod.isActive ? "in-stock" : "low-stock"}`}>
                            {prod.isActive ? "Yes" : "No"}
                          </span>
                        </td>
                        <td>
                          <button className="icon-btn" onClick={() => openEditProductModal(prod)}>
                            Edit
                          </button>
                          <button className="icon-btn" onClick={() => setDeleteModal({ open: true, product: prod })}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
                </div>
              </>
          )}

          {activeTab === "orders" && (
            <div className="data-table-section">
              <div className="table-header">
                <h2>Active Orders</h2>
                <div className="table-filters">
                  <button
                    className={`btn-filter ${orderFilter === "all" ? "active" : ""}`}
                    onClick={() => setOrderFilter("all")}
                  >
                    All
                  </button>
                  <button
                    className={`btn-filter ${orderFilter === "pending" ? "active" : ""}`}
                    onClick={() => setOrderFilter("pending")}
                  >
                    Pending
                  </button>
                  <button
                    className={`btn-filter ${orderFilter === "completed" ? "active" : ""}`}
                    onClick={() => setOrderFilter("completed")}
                  >
                    Completed
                  </button>
                </div>
              </div>
              {ordersQuery.isLoading && <div className="placeholder-box">Loading orders...</div>}
              {ordersQuery.isError && <div className="placeholder-box">Unable to load orders.</div>}
              {!ordersQuery.isLoading && filteredOrders.length === 0 && (
                <div className="placeholder-box">No orders in this status.</div>
              )}
              {filteredOrders.length > 0 && (
                <table className="bakery-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <React.Fragment key={order.id}>
                        <tr
                          className={expandedOrderId === order.id ? "row-expanded" : ""}
                          onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                          style={{ cursor: "pointer" }}
                        >
                          <td className="font-mono">{order.id}</td>
                          <td>{order.customer?.name || "Customer"}</td>
                          <td>Rs {Number(order.totalAmount || order.totalPrice || 0).toLocaleString()}</td>
                          <td>{order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}</td>
                          <td>
                            <span className={`status-dot ${order.status}`}></span>
                            {order.status}
                          </td>
                          <td>
                            <select
                              value={order.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(event) =>
                                updateOrderMutation.mutate({ orderId: order.id, status: event.target.value })
                              }
                            >
                              {ORDER_STATUSES.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                        {expandedOrderId === order.id && (
                          <tr className="order-details-expanded">
                            <td colSpan="6">
                              <div className="details-card">
                                <div className="details-grid">
                                  <div className="details-group">
                                    <h4>Delivery Info</h4>
                                    <p><strong>Option:</strong> {order.deliveryOption || "Standard"}</p>
                                    <p><strong>Address:</strong> {order.deliveryAddress ? `${order.deliveryAddress.street}, ${order.deliveryAddress.city} ${order.deliveryAddress.postalCode}` : "N/A"}</p>
                                    {order.deliveryInstructions && <p><strong>Instructions:</strong> {order.deliveryInstructions}</p>}
                                  </div>
                                  <div className="details-group">
                                    <h4>Contact & Payment</h4>
                                    <p><strong>Phone:</strong> {order.customerPhone || "N/A"}</p>
                                    <p><strong>Payment Method:</strong> {order.paymentMethod?.toUpperCase() || "COD"}</p>
                                  </div>
                                  <div className="details-group full-width">
                                    <h4>Ordered Items</h4>
                                    <div className="items-list">
                                      {(order.items || []).map((item, idx) => (
                                        <div key={idx} className="item-line" style={{ display: "grid", gap: "6px" }}>
                                          <div style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
                                            <span>{item.quantity} × {item.productName || "Product"}</span>
                                            <span>Rs {Number(item.finalPrice || 0).toLocaleString()}</span>
                                          </div>
                                          {Array.isArray(item.selectedOptions) && item.selectedOptions.length > 0 && (
                                            <div className="item-options" style={{ color: "var(--ink-muted)", fontSize: "12px", lineHeight: 1.5 }}>
                                              {item.selectedOptions.map((option, optionIndex) => (
                                                <div key={`${idx}-${optionIndex}`}>
                                                  <strong>{option.optionName}:</strong> {option.choiceName}
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="reviews-grid">
              {reviewsQuery.isLoading && <div className="placeholder-box">Loading reviews...</div>}
              {reviewsQuery.isError && <div className="placeholder-box">Unable to load reviews.</div>}
              {!reviewsQuery.isLoading && reviews.length === 0 && (
                <div className="placeholder-box">No reviews yet.</div>
              )}
              {reviews.map((review) => (
                <div className="review-card" key={review.id}>
                  <div className="review-header">
                    <div className="review-meta">
                      <div className="review-name">{review.customer?.name || "Customer"}</div>
                      <div className="review-stars">
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </div>
                    </div>
                    <div className="review-date">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
                    </div>
                  </div>
                  <div className="review-text">{review.comment}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="settings-panel">
              <div className="settings-header">
                <h2>Bakery Profile</h2>
              </div>
              <div className="settings-grid">
                <label className="settings-field">
                  <span>Name</span>
                  <input type="text" value={user?.bakeryManaged?.name || ""} readOnly />
                </label>
                <label className="settings-field">
                  <span>Status</span>
                  <input type="text" value={user?.bakeryManaged?.isActive ? "Active" : "Inactive"} readOnly />
                </label>
                <label className="settings-field">
                  <span>Address</span>
                  <input type="text" value={user?.bakeryManaged?.address || ""} readOnly />
                </label>
                <label className="settings-field">
                  <span>Contact</span>
                  <input type="text" value={user?.bakeryManaged?.contactNumber || ""} readOnly />
                </label>
                <label className="settings-field settings-span">
                  <span>Bakery Image URL</span>
                  <input
                    type="text"
                    value={imageUrlForm}
                    onChange={(event) => setImageUrlForm(event.target.value)}
                    placeholder="https://..."
                  />
                </label>
                <label className="settings-field settings-span">
                  <span>Owner</span>
                  <textarea rows="2" value={user?.name || ""} readOnly></textarea>
                </label>
                <label className="settings-field settings-span">
                  <span>My Story</span>
                  <textarea
                    rows="6"
                    value={storyForm}
                    onChange={(event) => setStoryForm(event.target.value)}
                    placeholder="Share your bakery's story..."
                  ></textarea>
                </label>
                <label className="settings-field settings-span">
                  <span>Quote</span>
                  <textarea
                    rows="3"
                    value={quoteForm}
                    onChange={(event) => setQuoteForm(event.target.value)}
                    placeholder="Add a short quote for your bakery."
                  ></textarea>
                </label>
                <label className="settings-field">
                  <span>Years of Heritage</span>
                  <input
                    type="text"
                    value={statsForm.years}
                    onChange={(event) =>
                      setStatsForm((prev) => ({ ...prev, years: event.target.value }))
                    }
                    placeholder="115+"
                  />
                </label>
                <label className="settings-field">
                  <span>Happy Customers</span>
                  <input
                    type="text"
                    value={statsForm.customers}
                    onChange={(event) =>
                      setStatsForm((prev) => ({ ...prev, customers: event.target.value }))
                    }
                    placeholder="50K+"
                  />
                </label>
                <label className="settings-field">
                  <span>Unique Recipes</span>
                  <input
                    type="text"
                    value={statsForm.recipes}
                    onChange={(event) =>
                      setStatsForm((prev) => ({ ...prev, recipes: event.target.value }))
                    }
                    placeholder="200+"
                  />
                </label>
                <label className="settings-field">
                  <span>Baked Fresh Daily</span>
                  <input
                    type="text"
                    value={statsForm.baked}
                    onChange={(event) =>
                      setStatsForm((prev) => ({ ...prev, baked: event.target.value }))
                    }
                    placeholder="24/7"
                  />
                </label>
              </div>
              {formError && <div className="auth-error" style={{ marginTop: "12px" }}>{formError}</div>}
              <button
                className="btn-primary"
                style={{ marginTop: "16px" }}
                onClick={handleStorySubmit}
                disabled={updateBakeryProfileMutation.isPending}
              >
                {updateBakeryProfileMutation.isPending ? "Saving..." : "Save Profile"}
              </button>
            </div>
          )}
        </div>
      </main>

      {ingredientModalOpen && (
        <div className="auth-overlay" onClick={() => setIngredientModalOpen(false)}>
          <div className="auth-modal dashboard-modal" onClick={(event) => event.stopPropagation()}>
            <h3>{ingredientForm.id ? "Edit Ingredient" : "Add Ingredient"}</h3>
            <form onSubmit={handleIngredientSubmit}>
              <div className="auth-field">
                <label>Name</label>
                <input
                  value={ingredientForm.name}
                  onChange={(event) => setIngredientForm((prev) => ({ ...prev, name: event.target.value }))}
                  required
                />
              </div>
              <div className="auth-field">
                <label>Unit</label>
                <select
                  value={ingredientForm.unit}
                  onChange={(event) => setIngredientForm((prev) => ({ ...prev, unit: event.target.value }))}
                  required
                >
                  <option value="" disabled>
                    Select unit
                  </option>
                  <option value="g">g</option>
                  <option value="ml">ml</option>
                  <option value="pcs">pcs</option>
                </select>
              </div>
              <div className="auth-field">
                <label>Price Per Unit</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={ingredientForm.pricePerUnit}
                  onChange={(event) =>
                    setIngredientForm((prev) => ({ ...prev, pricePerUnit: event.target.value }))
                  }
                  required
                />
              </div>
              <div className="auth-field">
                <label>Available Stock</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={ingredientForm.stock}
                  onChange={(event) =>
                    setIngredientForm((prev) => ({ ...prev, stock: event.target.value }))
                  }
                  placeholder="e.g. 500"
                />
                <div className="product-option-note" style={{ marginTop: "6px" }}>
                  Enter the current quantity available in the selected unit ({ingredientForm.unit || "unit"}).
                </div>
              </div>
              <div className="auth-field">
                <label>Low-Stock Alert Level</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={ingredientForm.minStock}
                  onChange={(event) =>
                    setIngredientForm((prev) => ({ ...prev, minStock: event.target.value }))
                  }
                  placeholder="e.g. 100"
                />
                <div className="product-option-note" style={{ marginTop: "6px" }}>
                  Helps you see when an ingredient is running low.
                </div>
              </div>

              <div className="auth-field">
                <label>Inventory Composition (Recipe)</label>
                <div className="product-option-note" style={{ marginBottom: "12px" }}>
                  Use this only for compound ingredients. Example: Frosting = sugar + butter. Leave empty for raw items.
                </div>
                
                <div className="recipe-builder">
                  {(ingredientForm.recipe || []).map((row, idx) => {
                    const selectedIngredient = ingredients.find((ing) => String(ing.id) === String(row.ingredientId));
                    const selectedStock =
                      selectedIngredient?.stock === undefined || selectedIngredient?.stock === null
                        ? "Not tracked"
                        : `${Number(selectedIngredient.stock).toLocaleString()} ${selectedIngredient.unit}`;

                    return (
                      <div key={idx} style={{ marginBottom: "10px" }}>
                        <div className="recipe-row" style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                          <div style={{ flex: 1 }}>
                            <select
                              value={row.ingredientId}
                              onChange={(e) => {
                                const newRecipe = [...ingredientForm.recipe];
                                newRecipe[idx].ingredientId = e.target.value;
                                setIngredientForm(prev => ({ ...prev, recipe: newRecipe }));
                              }}
                              required
                            >
                              <option value="">Select ingredient</option>
                              {ingredients.filter(ing => ing.id !== ingredientForm.id).map(ing => (
                                <option key={ing.id} value={ing.id}>{ing.name}</option>
                              ))}
                            </select>
                          </div>
                          <div style={{ width: "140px" }}>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Qty to consume"
                              value={row.quantity}
                              onChange={(e) => {
                                const newRecipe = [...ingredientForm.recipe];
                                newRecipe[idx].quantity = e.target.value;
                                setIngredientForm(prev => ({ ...prev, recipe: newRecipe }));
                              }}
                              required
                            />
                          </div>
                          <button 
                            type="button" 
                            className="icon-btn" 
                            style={{ color: "var(--rose)", marginBottom: "8px" }}
                            onClick={() => {
                              const newRecipe = ingredientForm.recipe.filter((_, i) => i !== idx);
                              setIngredientForm(prev => ({ ...prev, recipe: newRecipe }));
                            }}
                          >
                            <Icon name="trash" />
                          </button>
                        </div>
                        {selectedIngredient && (
                          <div style={{ fontSize: "11px", color: "var(--ink-muted)", marginTop: "4px" }}>
                            Unit: {selectedIngredient.unit} | Available: {selectedStock}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  <button
                    type="button"
                    className="btn-outline-sm recipe-add-btn"
                    onClick={() => {
                      setIngredientForm(prev => ({
                        ...prev,
                        recipe: [...(prev.recipe || []), { ingredientId: "", quantity: "1" }]
                      }));
                    }}
                  >
                    + Add Sub-Ingredient
                  </button>
                </div>
              </div>
              {formError && <div className="auth-error">{formError}</div>}
              <button
                className="btn-primary"
                disabled={createIngredientMutation.isPending || updateIngredientMutation.isPending}
              >
                {createIngredientMutation.isPending || updateIngredientMutation.isPending
                  ? "Saving..."
                  : ingredientForm.id
                  ? "Update Ingredient"
                  : "Create Ingredient"}
              </button>
            </form>
          </div>
        </div>
      )}

      {ingredientDelModal.open && (
        <div className="auth-overlay" onClick={() => setIngredientDelModal({ open: false, ingredient: null })}>
          <div className="auth-modal dashboard-modal" onClick={(event) => event.stopPropagation()}>
            <h3>Delete Ingredient</h3>
            <p>Are you sure you want to delete {ingredientDelModal.ingredient?.name}?</p>
            <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
              <button
                className="btn-primary"
                onClick={() => deleteIngredientMutation.mutate(ingredientDelModal.ingredient?.id)}
                disabled={deleteIngredientMutation.isPending}
              >
                {deleteIngredientMutation.isPending ? "Deleting..." : "Confirm"}
              </button>
              <button className="btn-outline" onClick={() => setIngredientDelModal({ open: false, ingredient: null })}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {productModal.open && (
        <div className="auth-overlay" onClick={() => setProductModal({ open: false, mode: "create", product: null })}>
          <div className="auth-modal dashboard-modal product-editor-modal" onClick={(event) => event.stopPropagation()}>
            <h3>{productModal.mode === "edit" ? "Edit Product" : "Add Product"}</h3>
            <form onSubmit={handleProductSubmit} className="product-editor-form">
              <div className="auth-field">
                <label>Name</label>
                <input
                  value={productForm.name}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, name: event.target.value }))}
                  required
                />
              </div>
              <div className="auth-field">
                <label>Category ID</label>
                <select
                  value={productForm.categoryId}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, categoryId: event.target.value }))}
                  required
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <div className="auth-error" style={{ marginTop: "8px" }}>
                    No categories yet. Add one first.
                  </div>
                )}
              </div>
              <div className="auth-field">
                <label>Base Price</label>
                <input
                  type="number"
                  value={productForm.basePrice}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, basePrice: event.target.value }))}
                  required
                />
              </div>
              <div className="auth-field">
                <label>Image URL</label>
                <input
                  value={productForm.imageUrl}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div className="auth-field">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={productForm.description}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, description: event.target.value }))}
                  placeholder="Short product summary"
                ></textarea>
              </div>
              <div className="auth-field">
                <label>Ingredients Text</label>
                <textarea
                  rows="3"
                  value={productForm.ingredientsText}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, ingredientsText: event.target.value }))}
                  placeholder="Ingredient details shown on product page"
                ></textarea>
              </div>
              <div className="auth-field">
                <label>Recipe Ingredients (from inventory)</label>
                <div className="product-ingredient-checklist">
                  {ingredients.map((ingredient) => {
                    const selected = (productForm.ingredients || []).find(
                      (item) => String(item.ingredientId) === String(ingredient.id),
                    );

                    return (
                      <div
                        key={ingredient.id}
                        className={`product-ingredient-check ${selected ? "selected" : ""}`}
                      >
                        <label>
                          <input
                            type="checkbox"
                            checked={!!selected}
                            onChange={(event) =>
                              toggleProductIngredientSelection(ingredient.id, event.target.checked)
                            }
                          />
                          <span>{ingredient.name}</span>
                          <small>{ingredient.unit}</small>
                        </label>
                        {selected && (
                          <div className="ingredient-quantity-field">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={selected.quantity}
                              onChange={(event) =>
                                updateProductIngredientQuantityById(ingredient.id, event.target.value)
                              }
                              placeholder="Stock usage"
                            />
                            <span className="ingredient-unit-hint is-set">{ingredient.unit}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="product-option-note" style={{ marginTop: "8px" }}>
                  Checked ingredients with quantity are what reduce inventory when this product is ordered.
                </div>
                {ingredients.length === 0 && (
                  <div style={{ color: "var(--ink-muted)", fontSize: "12px", marginTop: "8px" }}>
                    Add bakery ingredients first to select here.
                  </div>
                )}
              </div>
              <div className="auth-field">
                <label>Allergens (comma-separated)</label>
                <input
                  value={productForm.allergensText}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, allergensText: event.target.value }))}
                  placeholder="e.g. Gluten, Dairy, Nuts"
                />
              </div>
              <div className="auth-field">
                <label>Nutrition</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px" }}>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={productForm.nutrition.calories}
                    onChange={(event) =>
                      setProductForm((prev) => ({
                        ...prev,
                        nutrition: { ...prev.nutrition, calories: event.target.value },
                      }))
                    }
                    placeholder="Calories"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={productForm.nutrition.protein}
                    onChange={(event) =>
                      setProductForm((prev) => ({
                        ...prev,
                        nutrition: { ...prev.nutrition, protein: event.target.value },
                      }))
                    }
                    placeholder="Protein"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={productForm.nutrition.carbohydrates}
                    onChange={(event) =>
                      setProductForm((prev) => ({
                        ...prev,
                        nutrition: { ...prev.nutrition, carbohydrates: event.target.value },
                      }))
                    }
                    placeholder="Carbohydrates"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={productForm.nutrition.fats}
                    onChange={(event) =>
                      setProductForm((prev) => ({
                        ...prev,
                        nutrition: { ...prev.nutrition, fats: event.target.value },
                      }))
                    }
                    placeholder="Fats"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={productForm.nutrition.sugar}
                    onChange={(event) =>
                      setProductForm((prev) => ({
                        ...prev,
                        nutrition: { ...prev.nutrition, sugar: event.target.value },
                      }))
                    }
                    placeholder="Sugar"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={productForm.nutrition.fiber}
                    onChange={(event) =>
                      setProductForm((prev) => ({
                        ...prev,
                        nutrition: { ...prev.nutrition, fiber: event.target.value },
                      }))
                    }
                    placeholder="Fiber"
                  />
                </div>
              </div>
              <div className="auth-field">
                <label>Type</label>
                <select
                  value={productForm.type}
                  onChange={(event) => {
                    const nextType = event.target.value;
                    setProductForm((prev) => ({
                      ...prev,
                      type: nextType,
                      options:
                        nextType === "CUSTOMIZABLE" && (prev.options || []).length === 0
                          ? [createEmptyProductOption()]
                          : prev.options,
                    }));
                  }}
                >
                  <option value="FIXED">FIXED</option>
                  <option value="CUSTOMIZABLE">CUSTOMIZABLE</option>
                </select>
              </div>
              {productForm.type === "CUSTOMIZABLE" && (
                <div className="auth-field">
                  <label>Customization Setup</label>
                  <div className="product-option-builder-header">
                    <div className="product-option-helper-text">
                      1. Add what customer can choose (Size, Flavor). 2. Add choices. 3. Set extra price.
                    </div>
                    <div className="product-option-builder-controls">
                      <select
                        value={productOptionBuilderMode}
                        onChange={(event) => setProductOptionBuilderMode(event.target.value)}
                      >
                        <option value="owner">Owner mode</option>
                        <option value="advanced">Advanced mode</option>
                      </select>
                      <button
                        type="button"
                        className="btn-outline"
                        onClick={() => setShowAdvancedOptionFields((prev) => !prev)}
                      >
                        {showAdvancedOptionFields ? "Hide advanced" : "Show advanced"}
                      </button>
                    </div>
                  </div>
                  <div className="product-option-presets" style={{ flexDirection: "column", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{ width: "100%" }}>
                      <label style={{ fontSize: "12px", color: "var(--ink-muted)", marginBottom: "4px", display: "block" }}>Builder Template</label>
                      <select 
                        style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--sage-light)" }}
                        value={productForm.selectedTemplate}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProductForm(prev => ({ ...prev, selectedTemplate: val }));
                        }}
                      >
                        <option value="">Manual Builder (No Template)</option>
                        {Object.entries(CUSTOMIZER_TEMPLATES).map(([key, t]) => (
                          <option key={key} value={key}>{t.label}</option>
                        ))}
                      </select>
                    </div>

                    {productForm.selectedTemplate && (
                      <div className="template-segments-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", width: "100%" }}>
                        {CUSTOMIZER_TEMPLATES[productForm.selectedTemplate].segments.map(seg => {
                          const isEnabled = (productForm.options || []).some(o => o.templateKey === seg.key);
                          return (
                            <button
                              key={seg.key}
                              type="button"
                              className={`btn-outline-sm ${isEnabled ? "active" : ""}`}
                              style={{ 
                                background: isEnabled ? "var(--sage-light)" : "transparent",
                                color: isEnabled ? "var(--sage-dark)" : "inherit",
                                borderColor: "var(--sage-light)"
                              }}
                              onClick={() => {
                                if (isEnabled) {
                                  setProductForm(prev => ({
                                    ...prev,
                                    options: prev.options.filter(o => o.templateKey !== seg.key)
                                  }));
                                } else {
                                  setProductForm(prev => ({
                                    ...prev,
                                    options: [...(prev.options || []), createOptionFromSegment(seg, productForm.selectedTemplate)]
                                  }));
                                }
                              }}
                            >
                              {isEnabled ? "✓" : "+"} {seg.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="product-options-builder">
                    {(productForm.options || []).map((option, optionIndex) => (
                      <div key={`option-${optionIndex}`} className="product-option-group">
                        <div className="product-option-header">
                          <h4>Customer Choice Group {optionIndex + 1}</h4>
                          <button
                            type="button"
                            className="btn-outline"
                            onClick={() => removeProductOptionGroup(optionIndex)}
                          >
                            Remove Group
                          </button>
                        </div>
                        <div
                          className={`product-option-grid ${(showAdvancedOptionFields || productOptionBuilderMode === "advanced") ? "product-option-grid-advanced" : "product-option-grid-simple"}`}
                        >
                          <input
                            value={option.name}
                            onChange={(event) =>
                              updateProductOptionGroup(optionIndex, "name", event.target.value)
                            }
                            placeholder="What can customer choose? (e.g. Size, Flavor, Toppings)"
                          />
                          <input
                            type="number"
                            min="1"
                            value={option.maxSelections}
                            onChange={(event) =>
                              updateProductOptionGroup(optionIndex, "maxSelections", event.target.value)
                            }
                            placeholder="How many can customer pick?"
                          />
                          <label className="product-option-toggle">
                            <input
                              type="checkbox"
                              checked={!!option.required}
                              onChange={(event) =>
                                updateProductOptionGroup(optionIndex, "required", event.target.checked)
                              }
                            />
                            Customer must choose this
                          </label>
                          {(showAdvancedOptionFields || productOptionBuilderMode === "advanced") && (
                            <label className="product-option-toggle">
                              <input
                                type="checkbox"
                                checked={!!option.perLayer}
                                onChange={(event) =>
                                  updateProductOptionGroup(optionIndex, "perLayer", event.target.checked)
                                }
                              />
                              Per layer (advanced)
                            </label>
                          )}
                        </div>

                        <div className="product-option-choices">
                          {(option.choices || []).map((choice, choiceIndex) => (
                            <div
                              key={`choice-${choiceIndex}`}
                              className={`product-option-choice-row ${(showAdvancedOptionFields || productOptionBuilderMode === "advanced") ? "product-option-choice-row-advanced" : "product-option-choice-row-simple"}`}
                            >
                              <input
                                value={choice.name}
                                onChange={(event) =>
                                  updateProductOptionChoice(optionIndex, choiceIndex, "name", event.target.value)
                                }
                                placeholder="Choice customer sees (e.g. Chocolate, Large)"
                              />
                              <select
                                value={choice.ingredientId}
                                onChange={(event) =>
                                  updateProductOptionChoice(optionIndex, choiceIndex, "ingredientId", event.target.value)
                                }
                              >
                                <option value="">Map to ingredient</option>
                                {ingredients.map((ingredient) => (
                                  <option key={ingredient.id} value={ingredient.id}>
                                    {ingredient.name} ({ingredient.unit})
                                  </option>
                                ))}
                              </select>
                              {(showAdvancedOptionFields || productOptionBuilderMode === "advanced") && (
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={choice.quantity}
                                  onChange={(event) =>
                                    updateProductOptionChoice(optionIndex, choiceIndex, "quantity", event.target.value)
                                  }
                                  placeholder="Stock usage per order"
                                />
                              )}
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={choice.extraPrice}
                                onChange={(event) =>
                                  updateProductOptionChoice(optionIndex, choiceIndex, "extraPrice", event.target.value)
                                }
                                placeholder="Extra price customer pays"
                              />
                              <button
                                type="button"
                                className="btn-outline"
                                onClick={() => removeProductOptionChoice(optionIndex, choiceIndex)}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="product-option-actions">
                          <button
                            type="button"
                            className="btn-outline"
                            onClick={() => addProductOptionChoice(optionIndex)}
                          >
                            Add Choice
                          </button>
                          {ingredients.length === 0 && (
                            <span className="product-option-note">
                              Add bakery ingredients first to map choices.
                            </span>
                          )}
                          <span className="product-option-note">
                            Tip: set "How many can customer pick" to 1 for single-choice groups.
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="btn-outline" onClick={addProductOptionGroup}>
                    Add Option Group
                  </button>
                </div>
              )}
              <div className="auth-field">
                <label>Active</label>
                <select
                  value={productForm.isActive ? "true" : "false"}
                  onChange={(event) =>
                    setProductForm((prev) => ({ ...prev, isActive: event.target.value === "true" }))
                  }
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              {formError && <div className="auth-error">{formError}</div>}
              <button
                className="btn-primary"
                disabled={
                  createProductMutation.isPending ||
                  updateProductMutation.isPending ||
                  categories.length === 0
                }
              >
                {createProductMutation.isPending || updateProductMutation.isPending ? "Saving..." : "Save Product"}
              </button>
            </form>
          </div>
        </div>
      )}

      {deleteModal.open && (
        <div className="auth-overlay" onClick={() => setDeleteModal({ open: false, product: null })}>
          <div className="auth-modal dashboard-modal" onClick={(event) => event.stopPropagation()}>
            <h3>Delete Product</h3>
            <p>Are you sure you want to delete {deleteModal.product?.name}?</p>
            {formError && <div className="auth-error">{formError}</div>}
            <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
              <button
                className="btn-primary"
                onClick={() => deleteProductMutation.mutate(deleteModal.product?.id)}
                disabled={deleteProductMutation.isPending}
              >
                {deleteProductMutation.isPending ? "Deleting..." : "Confirm"}
              </button>
              <button className="btn-outline" onClick={() => setDeleteModal({ open: false, product: null })}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {voucherViewModalOpen && (
        <div className="auth-overlay" onClick={() => setVoucherViewModalOpen(false)}>
          <div className="auth-modal dashboard-modal" style={{ width: '600px', maxWidth: '90vw' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3>Voucher Codes</h3>
              <button className="btn-outline-sm" onClick={() => { setVoucherViewModalOpen(false); openVoucherModal('create'); }}>Add Voucher</button>
            </div>
            {vouchersQuery.isLoading && <p>Loading vouchers...</p>}
            {vouchersQuery.isError && <p>Error loading vouchers.</p>}
            {vouchersQuery.data && vouchersQuery.data.vouchers && vouchersQuery.data.vouchers.length === 0 && (
              <p>No vouchers found.</p>
            )}
            {vouchersQuery.data && vouchersQuery.data.vouchers && vouchersQuery.data.vouchers.length > 0 && (
              <div style={{ display: 'grid', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                {vouchersQuery.data.vouchers.map(v => (
                  <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', border: '1px solid var(--border-gold)', background: 'var(--cream)', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '14px', color: 'var(--gold-dark)' }}>{v.code}</strong>
                      <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                        {v.discountType === 'fixed' ? `Rs ${v.discountValue} off` : `${v.discountValue}% off`}
                        {v.minOrderAmount > 0 && ` on orders over Rs ${v.minOrderAmount}`}
                      </div>
                      <div style={{ fontSize: '11px', color: v.isActive ? 'var(--sage-dark)' : 'var(--rose-dark)' }}>
                        {v.isActive ? 'Active' : 'Inactive'} {v.expiresAt && `• Expires ${new Date(v.expiresAt).toLocaleDateString()}`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn-outline-sm" onClick={() => { setVoucherViewModalOpen(false); openVoucherModal('edit', v); }}>Edit</button>
                      <button className="btn-outline-sm" style={{ color: 'var(--rose-dark)', borderColor: 'var(--rose-dark)' }} onClick={() => { setVoucherViewModalOpen(false); setVoucherDelModal({ open: true, voucher: v }); }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button className="btn-outline" style={{ marginTop: '20px', width: '100%' }} onClick={() => setVoucherViewModalOpen(false)}>Close</button>
          </div>
        </div>
      )}

      {voucherModal.open && (
        <div className="auth-overlay" onClick={() => setVoucherModal({ open: false, mode: "create", voucher: null })}>
          <div className="auth-modal dashboard-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{voucherModal.mode === "create" ? "Add Voucher" : "Edit Voucher"}</h3>
            <form onSubmit={handleVoucherSubmit}>
              <div className="auth-field">
                <label>Voucher Code</label>
                <input type="text" value={voucherForm.code} onChange={e => setVoucherForm({...voucherForm, code: e.target.value})} required placeholder="e.g. SUMMER10" style={{ textTransform: 'uppercase' }} />
              </div>
              <div className="auth-field">
                <label>Description</label>
                <input type="text" value={voucherForm.description} onChange={e => setVoucherForm({...voucherForm, description: e.target.value})} placeholder="Optional description" />
              </div>
              <div className="auth-field">
                <label>Discount Type</label>
                <select value={voucherForm.discountType} onChange={e => setVoucherForm({...voucherForm, discountType: e.target.value})}>
                  <option value="fixed">Fixed Amount (Rs)</option>
                  <option value="percent">Percentage (%)</option>
                </select>
              </div>
              <div className="auth-field">
                <label>Discount Value</label>
                <input type="number" value={voucherForm.discountValue} onChange={e => setVoucherForm({...voucherForm, discountValue: e.target.value})} required min="0" placeholder={voucherForm.discountType === 'fixed' ? 'e.g. 150' : 'e.g. 10'} />
              </div>
              <div className="auth-field">
                <label>Min Order Amount</label>
                <input type="number" value={voucherForm.minOrderAmount} onChange={e => setVoucherForm({...voucherForm, minOrderAmount: e.target.value})} min="0" placeholder="e.g. 1000 (Optional)" />
              </div>
              <div className="auth-field">
                <label>Expires At</label>
                <input type="date" value={voucherForm.expiresAt} onChange={e => setVoucherForm({...voucherForm, expiresAt: e.target.value})} />
              </div>
              <div className="auth-field">
                <label>Status</label>
                <select value={voucherForm.isActive ? "true" : "false"} onChange={e => setVoucherForm({...voucherForm, isActive: e.target.value === "true"})}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              {formError && <div className="auth-error">{formError}</div>}
              <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                <button className="btn-primary" type="submit" disabled={createVoucherMutation.isPending || updateVoucherMutation.isPending}>
                  {createVoucherMutation.isPending || updateVoucherMutation.isPending ? "Saving..." : "Save Voucher"}
                </button>
                <button className="btn-outline" type="button" onClick={() => setVoucherModal({ open: false, mode: "create", voucher: null })}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {voucherDelModal.open && (
        <div className="auth-overlay" onClick={() => setVoucherDelModal({ open: false, voucher: null })}>
          <div className="auth-modal dashboard-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Voucher</h3>
            <p>Are you sure you want to delete the voucher "{voucherDelModal.voucher?.code}"? This action cannot be undone.</p>
            {formError && <div className="auth-error">{formError}</div>}
            <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
              <button className="btn-primary" onClick={() => deleteVoucherMutation.mutate(voucherDelModal.voucher?.id)} disabled={deleteVoucherMutation.isPending}>
                {deleteVoucherMutation.isPending ? "Deleting..." : "Confirm Delete"}
              </button>
              <button className="btn-outline" onClick={() => setVoucherDelModal({ open: false, voucher: null })}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
