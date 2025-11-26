import { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Trash2,
  X,
  Layers,
  Save,
  Image as ImageIcon,
  Upload,
  Loader,
} from "lucide-react";
import { createProduct, updateProduct } from "../../services/admin";
import { COLORS, categories } from "../../constants/options";

const defaultProductInfo = {
  title: "",
  description: "",
  mainCategory: "",
  subCategory: "",
  specificType: "",
  specifications: [],
  images: {
    preview: null,
    gallery: [
      { view: "Front View", file: null },
      { view: "Back View", file: null },
      { view: "Hover View", file: null },
      { view: "Close-up View", file: null },
    ],
  },
};

const getFreshVariant = () => ({
  color: "",
  isCustomColor: false,
  price: {
    original: "",
    discounted: "",
    offPercent: "",
  },
  sizes: [{ size: "S", stock: "" }],
});

const ProductForm = ({ existingProduct, onSuccess }) => {
  const [formData, setFormData] = useState(defaultProductInfo);
  const [variants, setVariants] = useState([getFreshVariant()]);
  const [isLoading, setIsLoading] = useState(false);
  const [subCatOptions, setSubCatOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);

  useEffect(() => {
    if (existingProduct) {
      let loadedSpecs = [];
      if (Array.isArray(existingProduct.specifications)) {
        loadedSpecs = existingProduct.specifications;
      } else if (
        existingProduct.specifications &&
        typeof existingProduct.specifications === "object"
      ) {
        loadedSpecs = Object.entries(existingProduct.specifications).map(
          ([key, value]) => ({ key, value })
        );
      }

      setFormData({
        title: existingProduct.title,
        description: existingProduct.description,
        mainCategory: existingProduct.mainCategory,
        subCategory: existingProduct.subCategory,
        specificType: existingProduct.specificType,
        specifications: loadedSpecs,
        images: existingProduct.images,
      });

      if (existingProduct.variants) {
        setVariants(existingProduct.variants);
      } else {
        setVariants([
          {
            color: existingProduct.color,
            isCustomColor: !COLORS.includes(existingProduct.color),
            price: existingProduct.price,
            sizes: existingProduct.sizes,
          },
        ]);
      }

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
    } else {
      setFormData(defaultProductInfo);
      setVariants([getFreshVariant()]);
      setSubCatOptions([]);
      setTypeOptions([]);
    }
  }, [existingProduct]);

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

  const handleAddSpec = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { key: "", value: "" }],
    }));
  };

  const handleRemoveSpec = (index) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  };

  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...formData.specifications];
    newSpecs[index][field] = value;
    setFormData((prev) => ({ ...prev, specifications: newSpecs }));
  };

  const addVariant = () => {
    setVariants([...variants, getFreshVariant()]);
  };

  const removeVariant = (index) => {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
  };

  const handleVariantColorChange = (index, value) => {
    const updatedVariants = JSON.parse(JSON.stringify(variants));
    if (value === "Custom") {
      updatedVariants[index].isCustomColor = true;
      updatedVariants[index].color = "";
    } else {
      updatedVariants[index].isCustomColor = false;
      updatedVariants[index].color = value;
    }
    setVariants(updatedVariants);
  };

  const handleVariantCustomColorType = (index, value) => {
    const updatedVariants = [...variants];
    updatedVariants[index].color = value;
    setVariants(updatedVariants);
  };

  const handleVariantPriceChange = (index, field, value) => {
    const updatedVariants = JSON.parse(JSON.stringify(variants));
    updatedVariants[index].price[field] = value;

    const original = parseFloat(updatedVariants[index].price.original);
    const discounted = parseFloat(updatedVariants[index].price.discounted);

    if (
      !isNaN(original) &&
      !isNaN(discounted) &&
      original > 0 &&
      discounted >= 0 &&
      discounted <= original
    ) {
      updatedVariants[index].price.offPercent = Math.round(
        ((original - discounted) / original) * 100
      ).toString();
    }

    setVariants(updatedVariants);
  };

  const handleVariantSizeChange = (varIndex, sizeIndex, field, value) => {
    const updatedVariants = JSON.parse(JSON.stringify(variants));
    updatedVariants[varIndex].sizes[sizeIndex][field] = value;
    setVariants(updatedVariants);
  };

  const addSizeToVariant = (varIndex) => {
    const updatedVariants = JSON.parse(JSON.stringify(variants));
    updatedVariants[varIndex].sizes.push({ size: "S", stock: "" });
    setVariants(updatedVariants);
  };

  const removeSizeFromVariant = (varIndex, sizeIndex) => {
    const updatedVariants = JSON.parse(JSON.stringify(variants));
    updatedVariants[varIndex].sizes = updatedVariants[varIndex].sizes.filter(
      (_, i) => i !== sizeIndex
    );
    setVariants(updatedVariants);
  };

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

  const handleSubmit = async () => {
    if (!formData.title.trim()) return alert("Product title required");
    if (!formData.mainCategory) return alert("Category required");
    if (!formData.images.preview) return alert("Main Image required");

    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.color) return alert(`Color required for Variant ${i + 1}`);
      if (!v.price.original)
        return alert(`Original Price required for Variant ${i + 1}`);
      if (v.sizes.length === 0)
        return alert(`Add at least one size for Variant ${i + 1}`);

      for (let j = 0; j < v.sizes.length; j++) {
        const s = v.sizes[j];
        if (s.stock === "" || s.stock === null || s.stock < 0) {
          return alert(
            `Please enter a valid Stock quantity for size "${
              s.size
            }" in Variant ${i + 1}`
          );
        }
      }
    }

    const token = localStorage.getItem("adminToken");

    const cleanVariants = variants.map((v) => ({
      ...v,
      price: {
        ...v.price,
        original: parseFloat(v.price.original),
        discounted: parseFloat(v.price.discounted) || 0,
      },
      sizes: v.sizes.map((s) => ({
        ...s,
        stock: parseInt(s.stock, 10),
      })),
    }));

    const finalPayload = {
      ...formData,
      variants: cleanVariants,
    };

    setIsLoading(true);

    try {
      let response;
      if (existingProduct) {
        response = await updateProduct(
          existingProduct._id,
          finalPayload,
          token
        );
      } else {
        response = await createProduct(finalPayload, token);
      }

      if (response?._id) {
        alert(
          existingProduct
            ? "Product Updated Successfully!"
            : "Product Created Successfully!"
        );

        if (!existingProduct) {
          setFormData(defaultProductInfo);
          setVariants([getFreshVariant()]);
          window.scrollTo(0, 0);
        }

        if (onSuccess) onSuccess();
      } else {
        alert("Server Error: Operation failed.");
      }
    } catch (error) {
      console.error(error);
      const errMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Error saving product";
      alert(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded shadow mb-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package /> {existingProduct ? "Edit Product" : "Add New Product"}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          className="border p-2 rounded"
          name="title"
          placeholder="Product Title *"
          value={formData.title}
          onChange={handleInputChange}
        />

        <select
          className="border p-2 rounded cursor-pointer"
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
          className={`border p-2 rounded cursor-pointer ${
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
      </div>

      <textarea
        className="border p-2 rounded w-full mb-6"
        rows="3"
        name="description"
        placeholder="Description..."
        value={formData.description}
        onChange={handleInputChange}
      />

      <div className="border rounded-lg p-5 mb-8 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers size={20} className="text-gray-600" />
            <h2 className="font-semibold text-lg text-gray-700">
              Specifications
            </h2>
          </div>
          <button
            type="button"
            onClick={handleAddSpec}
            className="text-sm text-blue-600 font-bold hover:underline flex items-center gap-1"
          >
            <Plus size={16} /> Add Specification
          </button>
        </div>

        {formData.specifications.length === 0 && (
          <p className="text-sm text-gray-400 italic text-center py-2">
            No specifications added. Click "Add Specification" to start.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {formData.specifications.map((spec, index) => (
            <div key={index} className="flex gap-2 items-center">
              {/* KEY INPUT */}
              <input
                type="text"
                list="common-keys"
                placeholder="Name (e.g. Fabric)"
                className="border p-2 rounded flex-1"
                value={spec.key}
                onChange={(e) => handleSpecChange(index, "key", e.target.value)}
              />

              {/* VALUE INPUT */}
              <input
                type="text"
                placeholder="Value (e.g. Cotton)"
                className="border p-2 rounded flex-1"
                value={spec.value}
                onChange={(e) =>
                  handleSpecChange(index, "value", e.target.value)
                }
              />

              {/* REMOVE BUTTON */}
              <button
                type="button"
                onClick={() => handleRemoveSpec(index)}
                className="text-red-400 hover:text-red-600 p-2"
                title="Remove Specification"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Optional: Suggestions for common keys */}
        <datalist id="common-keys">
          <option value="Fabric" />
          <option value="Pattern" />
          <option value="Fit" />
          <option value="Sleeve" />
          <option value="Neck" />
          <option value="Warranty" />
          <option value="Material" />
        </datalist>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          Pricing & Variants
        </h2>

        {variants.map((variant, index) => (
          <div
            key={index}
            className="border-2 border-blue-100 rounded-lg p-5 mb-6 bg-white shadow-sm relative"
          >
            {variants.length > 1 && (
              <button
                onClick={() => removeVariant(index)}
                className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1 rounded"
              >
                <Trash2 size={18} />
              </button>
            )}

            <h3 className="text-sm font-bold text-blue-600 mb-3 uppercase tracking-wider">
              Variant {index + 1}
            </h3>

            <div className="mb-4 bg-gray-50 p-3 rounded">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <div className="flex gap-2">
                <select
                  className="border p-2 rounded flex-1 cursor-pointer"
                  value={variant.isCustomColor ? "Custom" : variant.color}
                  onChange={(e) =>
                    handleVariantColorChange(index, e.target.value)
                  }
                >
                  <option value="">Select Color *</option>
                  {COLORS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="Custom">Custom Color</option>
                </select>
                {variant.isCustomColor && (
                  <input
                    className="border p-2 rounded w-1/2"
                    placeholder="Type Color Name"
                    value={variant.color}
                    onChange={(e) =>
                      handleVariantCustomColorType(index, e.target.value)
                    }
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs text-gray-500">Original Price</label>
                <input
                  type="number"
                  className="border p-2 rounded w-full"
                  placeholder="0"
                  value={variant.price.original}
                  onChange={(e) =>
                    handleVariantPriceChange(index, "original", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">
                  Discounted Price
                </label>
                <input
                  type="number"
                  className="border p-2 rounded w-full"
                  placeholder="0"
                  value={variant.price.discounted}
                  onChange={(e) =>
                    handleVariantPriceChange(
                      index,
                      "discounted",
                      e.target.value
                    )
                  }
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Discount %</label>
                <input
                  type="text"
                  className="border p-2 rounded w-full bg-gray-100"
                  value={variant.price.offPercent}
                  readOnly
                />
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sizes & Stock
              </label>
              {variant.sizes.map((s, sIndex) => (
                <div
                  key={sIndex}
                  className="flex flex-wrap gap-2 mb-2 items-center"
                >
                  <select
                    value={s.size}
                    className="border p-2 rounded w-24 cursor-pointer"
                    onChange={(e) =>
                      handleVariantSizeChange(
                        index,
                        sIndex,
                        "size",
                        e.target.value
                      )
                    }
                  >
                    {["S", "M", "L", "XL", "XXL"].map((sz) => (
                      <option key={sz}>{sz}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="border p-2 rounded flex-1"
                    placeholder="Qty"
                    value={s.stock}
                    onChange={(e) =>
                      handleVariantSizeChange(
                        index,
                        sIndex,
                        "stock",
                        e.target.value
                      )
                    }
                  />
                  {variant.sizes.length > 1 && (
                    <button
                      type="button"
                      className="text-red-400 hover:text-red-600"
                      onClick={() => removeSizeFromVariant(index, sIndex)}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addSizeToVariant(index)}
                className="text-blue-600 text-xs font-bold flex items-center gap-1 mt-2 cursor-pointer"
              >
                <Plus size={14} /> Add Another Size
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addVariant}
          className="w-full border-2 border-dashed border-blue-300 text-blue-600 p-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-50 cursor-pointer"
        >
          <Plus size={20} /> Add Another Color Variant
        </button>
      </div>

      <div className="border-t pt-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Product Images (General)</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

          <div className="col-span-1 lg:col-span-2">
            <p className="text-sm font-bold mb-2 text-gray-600">
              Additional Views
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

      <div className="flex flex-col md:flex-row gap-4 mt-8 pt-6 border-t">
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className={`flex-1 px-6 py-3 rounded font-bold flex items-center justify-center gap-2 transition-colors shadow-sm 
            ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-green-600 hover:bg-green-700 text-white cursor-pointer active:scale-95"
            }`}
        >
          {isLoading ? (
            <>
              <Loader size={20} className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Save size={20} />
              {existingProduct ? "Update Product" : "Save Product"}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductForm;
