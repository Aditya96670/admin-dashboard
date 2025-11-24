import React, { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Trash2,
  X,
  Layers,
  Save,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
import { createProduct } from "../../services/admin";
import {
  COLORS,
  SPEC_OPTIONS,
  categories,
  defaultFormState,
} from "../../constants/options";

const ProductForm = ({ existingProduct, onSuccess }) => {
  const [formData, setFormData] = useState(defaultFormState);
  const [subCatOptions, setSubCatOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);
  const [showCustomColor, setShowCustomColor] = useState(false);
  const [customSpecs, setCustomSpecs] = useState({});

  useEffect(() => {
    if (existingProduct) {
      setFormData(existingProduct);

      const subs = existingProduct.mainCategory
        ? Object.keys(categories[existingProduct.mainCategory])
        : [];
      const types =
        existingProduct.mainCategory && existingProduct.subCategory
          ? categories[existingProduct.mainCategory][
              existingProduct.subCategory
            ]
          : [];

      setSubCatOptions(subs);
      setTypeOptions(types);

      const isCustomColor =
        existingProduct.color && !COLORS.includes(existingProduct.color);
      setShowCustomColor(isCustomColor);

      const newCustomSpecs = {};
      Object.keys(SPEC_OPTIONS).forEach((key) => {
        const val = existingProduct.specifications?.[key];
        if (val && !SPEC_OPTIONS[key].includes(val)) {
          newCustomSpecs[key] = true;
        }
      });
      setCustomSpecs(newCustomSpecs);
    } else {
      setFormData(defaultFormState);
      setSubCatOptions([]);
      setTypeOptions([]);
      setShowCustomColor(false);
      setCustomSpecs({});
    }
  }, [existingProduct]);

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMainCatChange = (e) => {
    const value = e.target.value;
    const subs = categories[value] ? Object.keys(categories[value]) : [];
    setFormData((prev) => ({
      ...prev,
      mainCategory: value,
      subCategory: "",
      specificType: "",
    }));
    setSubCatOptions(subs);
    setTypeOptions([]);
  };

  const handleSubCatChange = (e) => {
    const value = e.target.value;
    const types = categories[formData.mainCategory]?.[value] || [];
    setFormData((prev) => ({ ...prev, subCategory: value, specificType: "" }));
    setTypeOptions(types);
  };

  const handleColorSelect = (e) => {
    const value = e.target.value;
    if (value === "Custom") {
      setShowCustomColor(true);
      setFormData((prev) => ({ ...prev, color: "" }));
    } else {
      setShowCustomColor(false);
      setFormData((prev) => ({ ...prev, color: value }));
    }
  };

  const handleSpecChange = (field, value) => {
    if (value === "Other") {
      setCustomSpecs((prev) => ({ ...prev, [field]: true }));
      setFormData((prev) => ({
        ...prev,
        specifications: { ...prev.specifications, [field]: "" },
      }));
    } else {
      setCustomSpecs((prev) => ({ ...prev, [field]: false }));
      setFormData((prev) => ({
        ...prev,
        specifications: { ...prev.specifications, [field]: value },
      }));
    }
  };

  const handlePriceChange = (field, value) => {
    setFormData((prev) => {
      const newPrice = { ...prev.price, [field]: value };
      const original = parseFloat(newPrice.original);
      const discounted = parseFloat(newPrice.discounted);
      if (
        !isNaN(original) &&
        !isNaN(discounted) &&
        original > 0 &&
        discounted >= 0 &&
        discounted <= original
      ) {
        newPrice.offPercent = Math.round(
          ((original - discounted) / original) * 100
        ).toString();
      }
      return { ...prev, price: newPrice };
    });
  };

  const handleSizeChange = (index, field, value) =>
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.map((s, i) =>
        i === index ? { ...s, [field]: value } : s
      ),
    }));

  const addSize = () =>
    setFormData((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { size: "S", stock: "" }],
    }));
  const removeSize = (index) =>
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }));

  // Image Handlers
  const handleMainImageUpload = (file) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = () =>
      setFormData((prev) => ({
        ...prev,
        images: { ...prev.images, preview: r.result },
      }));
    r.readAsDataURL(file);
  };

  const handleGalleryUpload = (index, file) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = () =>
      setFormData((prev) => ({
        ...prev,
        images: {
          ...prev.images,
          gallery: prev.images.gallery.map((img, i) =>
            i === index ? { ...img, file: r.result } : img
          ),
        },
      }));
    r.readAsDataURL(file);
  };

  const validateForm = () => {
    if (!formData.title.trim()) return alert("Product title required");
    if (!formData.mainCategory || !formData.subCategory)
      return alert("Category required");
    if (!formData.color.trim()) return alert("Color is required");
    if (isNaN(parseFloat(formData.price.original)))
      return alert("Original price required");
    if (!formData.images.preview)
      return alert("Main Product Image is required!");
    if (!formData.sizes.some((s) => s.stock > 0))
      return alert("Add stock for at least one size");
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    const token = localStorage.getItem("adminToken");

    if (existingProduct) {
      alert("Update API logic to be implemented here.");
      return;
    }

    const response = await createProduct(formData, token);
    if (response?._id) {
      alert("Product added!");
      setFormData(defaultFormState);
      if (onSuccess) onSuccess();
    } else {
      alert("Error adding product");
    }
  };

  const currentColorDropdownValue = () => {
    if (formData.color === "") return "";
    if (COLORS.includes(formData.color)) return formData.color;
    return "Custom";
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded shadow mb-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package /> {existingProduct ? "Edit Product" : "Add New Product"}
        </h1>
      </div>

      {/* --- BASIC INFO --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          className="border p-2 rounded"
          name="title"
          placeholder="Product Title *"
          value={formData.title}
          onChange={handleInputChange}
        />

        <select
          className="border p-2 rounded"
          name="mainCategory"
          value={formData.mainCategory}
          onChange={handleMainCatChange}
        >
          <option value="">Select Main Category *</option>
          {Object.keys(categories).map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <select
          className={`border p-2 rounded ${
            !formData.mainCategory ? "bg-gray-100" : ""
          }`}
          name="subCategory"
          value={formData.subCategory}
          onChange={handleSubCatChange}
          disabled={!formData.mainCategory}
        >
          <option value="">Select Sub Category *</option>
          {subCatOptions.map((sub) => (
            <option key={sub}>{sub}</option>
          ))}
        </select>

        {typeOptions.length > 0 && (
          <select
            className="border p-2 rounded"
            name="specificType"
            value={formData.specificType}
            onChange={handleInputChange}
          >
            <option value="">Select Specific Type *</option>
            {typeOptions.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        )}

        <div className="flex gap-2">
          <select
            className="border p-2 rounded flex-1"
            value={currentColorDropdownValue()}
            onChange={handleColorSelect}
          >
            <option value="">Select Color *</option>
            {COLORS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value="Custom">Custom Color</option>
          </select>
          {showCustomColor && (
            <input
              className="border p-2 rounded w-32"
              placeholder="Type Color"
              name="color"
              value={formData.color}
              onChange={handleInputChange}
            />
          )}
        </div>
      </div>

      {/* --- DESCRIPTION --- */}
      <textarea
        className="border p-2 rounded w-full mb-6"
        rows="3"
        name="description"
        placeholder="Description..."
        value={formData.description}
        onChange={handleInputChange}
      />

      {/* --- SPECIFICATIONS --- */}
      <div className="border rounded-lg p-5 mb-6 bg-gray-50">
        <div className="flex items-center gap-2 mb-4">
          <Layers size={20} className="text-gray-600" />
          <h2 className="font-semibold text-lg text-gray-700">
            Product Details & Specifications
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(SPEC_OPTIONS).map((key) => (
            <div key={key} className="flex flex-col">
              <label className="text-xs font-semibold text-gray-500 mb-1">
                {key}
              </label>
              <div className="flex gap-2">
                <select
                  className="border p-2 rounded flex-1 bg-white"
                  value={
                    customSpecs[key] ? "Other" : formData.specifications[key]
                  }
                  onChange={(e) => handleSpecChange(key, e.target.value)}
                >
                  <option value="">Select {key}</option>
                  {SPEC_OPTIONS[key].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                  <option value="Other">Other (Type custom)</option>
                </select>
                {customSpecs[key] && (
                  <input
                    type="text"
                    placeholder={`Type ${key}`}
                    className="border p-2 rounded w-1/2"
                    value={formData.specifications[key]}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        specifications: {
                          ...prev.specifications,
                          [key]: e.target.value,
                        },
                      }))
                    }
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- PRICING & STOCK --- */}
      <h2 className="font-semibold mb-2">Pricing & Inventory</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="number"
          className="border p-2 rounded"
          placeholder="Original Price *"
          value={formData.price.original}
          onChange={(e) => handlePriceChange("original", e.target.value)}
        />
        <input
          type="number"
          className="border p-2 rounded"
          placeholder="Discounted Price"
          value={formData.price.discounted}
          onChange={(e) => handlePriceChange("discounted", e.target.value)}
        />
        <input
          type="number"
          className="border p-2 rounded bg-gray-50"
          placeholder="Discount %"
          value={formData.price.offPercent}
          readOnly
        />
      </div>

      {formData.sizes.map((s, i) => (
        <div key={i} className="flex flex-wrap gap-4 mb-3 items-center">
          <select
            value={s.size}
            className="border p-2 rounded"
            onChange={(e) => handleSizeChange(i, "size", e.target.value)}
          >
            {["S", "M", "L", "XL", "XXL"].map((sz) => (
              <option key={sz}>{sz}</option>
            ))}
          </select>
          <input
            type="number"
            className="border p-2 rounded"
            placeholder="Stock"
            value={s.stock}
            onChange={(e) => handleSizeChange(i, "stock", e.target.value)}
          />
          {formData.sizes.length > 1 && (
            <button
              type="button"
              className="text-red-600"
              onClick={() => removeSize(i)}
            >
              <Trash2 />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addSize}
        className="bg-blue-600 text-white px-3 py-1 rounded mb-8 text-sm flex items-center gap-1"
      >
        <Plus size={14} /> Add Size
      </button>

      {/* --- IMAGES --- */}
      <div className="border-t pt-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Product Images</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Image Logic */}
          <div className="col-span-1">
            <p className="text-sm font-bold mb-2 flex items-center gap-2">
              Main Image{" "}
              <span className="text-red-500 text-xs">(Required)</span>
            </p>
            <div className="border-2 border-dashed border-blue-200 bg-blue-50 rounded-lg p-6 flex flex-col items-center justify-center h-64 relative">
              {formData.images.preview ? (
                <div className="relative w-full h-full">
                  <img
                    src={formData.images.preview}
                    className="w-full h-full object-contain rounded"
                    alt="Main"
                  />
                  <button
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        images: { ...prev.images, preview: null },
                      }))
                    }
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center w-full h-full justify-center">
                  <ImageIcon size={40} className="text-blue-300 mb-2" />
                  <span className="text-sm text-blue-600 font-medium">
                    Click to Upload Main Image
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleMainImageUpload(e.target.files[0])}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Gallery Logic */}
          <div className="col-span-1 lg:col-span-2">
            <p className="text-sm font-bold mb-2 text-gray-600">
              Additional Views (Optional)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.gallery.map((img, i) => (
                <div
                  key={i}
                  className="border border-gray-200 rounded-lg p-2 flex flex-col items-center bg-gray-50 h-40 relative"
                >
                  <span className="text-[10px] text-gray-500 mb-1 uppercase">
                    {img.view}
                  </span>
                  {img.file ? (
                    <div className="relative w-full h-full">
                      <img
                        src={img.file}
                        className="w-full h-full object-cover rounded"
                        alt={img.view}
                      />
                      <button
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            images: {
                              ...prev.images,
                              gallery: prev.images.gallery.map((g, idx) =>
                                idx === i ? { ...g, file: null } : g
                              ),
                            },
                          }))
                        }
                        className="absolute -top-2 -right-2 bg-white text-red-500 border p-1 rounded-full"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full border border-dashed rounded hover:bg-gray-100">
                      <Upload size={16} className="text-gray-400 mb-1" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) =>
                          handleGalleryUpload(i, e.target.files[0])
                        }
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white px-6 py-3 rounded font-bold w-full md:w-auto"
      >
        <Save className="inline mr-2" /> Save Product
      </button>
    </div>
  );
};

export default ProductForm;
