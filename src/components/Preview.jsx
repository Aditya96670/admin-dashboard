import { useState, useEffect } from "react";
import { getProducts } from "../services/admin";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  Menu,
  X,
  Save,
  Upload,
  Image as ImageIcon,
} from "lucide-react";

// --- CONFIGURATION ---
const COLORS = [
  "Beige",
  "Black",
  "Blue",
  "Brown",
  "Green",
  "Grey",
  "Maroon",
  "Orange",
  "Pink",
  "Purple",
  "Red",
  "White",
  "Yellow",
];

const categories = {
  Topwear: {
    "T-shirts": [
      "Plain T-shirts",
      "Printed T-shirts",
      "Regular Fit T-shirts",
      "Oversized T-shirts",
      "Polo T-shirts",
      "Plus Size T-shirts",
      "Full Sleeve T-shirts",
    ],
    Shirts: [
      "Plain Shirts",
      "Oxford Shirts",
      "Flannel Shirts",
      "Satin Shirts",
      "Festive Shirts",
      "Cotton Shirts",
      "Shackets",
    ],
    Polos: [],
    "Shop For Women": ["Topwear", "Bottomwear"],
  },
  Bottomwear: {
    "Cargo Joggers": [],
    "Cargo Pants": [],
    Trousers: [],
    "Japanese Pants": [],
    "Gurkha Pants": [],
    "Korean Pants": [],
    Pyjamas: [],
    Jeans: [],
    Shorts: [],
    Boxers: [],
  },
  Combos: { General: [] },
  "New Arrivals": { General: [] },
  Winterwear: { General: [] },
};

const defaultFormState = {
  title: "",
  mainCategory: "",
  subCategory: "",
  specificType: "",
  price: { original: "", discounted: "", offPercent: "" },
  sizes: [{ size: "S", stock: "" }],
  rating: "",
  color: "",
  description: "",
  images: {
    preview: null, // REQUIRED
    // OPTIONAL GALLERY (4 Slots)
    gallery: [
      { view: "Front View", file: null },
      { view: "Back View", file: null },
      { view: "Side View", file: null },
      { view: "Close-up View", file: null },
    ],
  },
};

const Preview = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState(defaultFormState);

  // UI States
  const [subCatOptions, setSubCatOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showCustomColor, setShowCustomColor] = useState(false);

  useEffect(() => {
    if (activeTab === "products") {
      const token = localStorage.getItem("adminToken");
      getProducts(token).then((data) => {
        if (Array.isArray(data)) setProducts(data);
      });
    }
  }, [activeTab]);

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  // --- IMAGE HANDLERS ---
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

  const removeGalleryImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: {
        ...prev.images,
        gallery: prev.images.gallery.map((img, i) =>
          i === index ? { ...img, file: null } : img
        ),
      },
    }));
  };

  // --- VALIDATION ---
  const validateForm = () => {
    if (!formData.title.trim()) {
      alert("Product title required");
      return false;
    }
    if (!formData.mainCategory || !formData.subCategory) {
      alert("Category required");
      return false;
    }
    if (typeOptions.length > 0 && !formData.specificType) {
      alert("Please select a specific type");
      return false;
    }
    if (!formData.color.trim()) {
      alert("Color is required");
      return false;
    }
    if (isNaN(parseFloat(formData.price.original))) {
      alert("Original price required");
      return false;
    }

    // IMAGE VALIDATION: Only Main Preview is Checked
    if (!formData.images.preview) {
      alert("Main Product Image (Preview) is COMPULSORY!");
      return false;
    }

    if (!formData.sizes.some((s) => s.stock > 0)) {
      alert("Add stock for at least one size");
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    if (editingIndex !== null) {
      setProducts((prev) =>
        prev.map((p, i) => (i === editingIndex ? formData : p))
      );
      alert("Product updated!");
    } else {
      setProducts((prev) => [...prev, formData]);
      alert("Product added!");
    }
    setFormData(defaultFormState);
    setSubCatOptions([]);
    setTypeOptions([]);
    setShowCustomColor(false);
    setEditingIndex(null);
    setActiveTab("products");
  };

  const handleEditProduct = (index) => {
    const prod = products[index];
    setFormData(prod);
    const subs = prod.mainCategory
      ? Object.keys(categories[prod.mainCategory])
      : [];
    const types =
      prod.mainCategory && prod.subCategory
        ? categories[prod.mainCategory][prod.subCategory]
        : [];
    setSubCatOptions(subs);
    setTypeOptions(types);
    const isCustom = prod.color && !COLORS.includes(prod.color);
    setShowCustomColor(isCustom);
    setEditingIndex(index);
    setActiveTab("addProduct");
  };

  const handleDeleteProduct = (index) => {
    if (window.confirm("Delete this product?"))
      setProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentColorDropdownValue = () => {
    if (formData.color === "") return "";
    if (COLORS.includes(formData.color)) return formData.color;
    return "Custom";
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } bg-gray-900 text-white transition-all duration-300 overflow-hidden`}
      >
        <h2 className="p-6 text-xl font-bold tracking-wide">BEYOUNG ADMIN</h2>
        <nav className="space-y-1">
          {["dashboard", "products", "addProduct", "orders"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab === "addProduct" && editingIndex === null) {
                  setFormData(defaultFormState);
                  setSubCatOptions([]);
                  setTypeOptions([]);
                  setShowCustomColor(false);
                }
              }}
              className={`w-full text-left px-6 py-3 hover:bg-gray-800 flex items-center gap-2 ${
                activeTab === tab
                  ? "bg-gray-800 border-l-4 border-blue-500"
                  : ""
              }`}
            >
              {tab === "dashboard" && "Dashboard"}
              {tab === "products" && "Products"}
              {tab === "addProduct" && "Add Product"}
              {tab === "orders" && "Orders"}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X /> : <Menu />}
          </button>
          <p className="font-medium">Admin User</p>
        </header>

        {activeTab === "products" && (
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold">Products</h2>
              <div className="flex items-center gap-2 bg-white p-2 rounded shadow w-full md:w-80">
                <Search size={18} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search product..."
                  className="outline-none w-full text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="bg-white p-4 rounded shadow">
              {filteredProducts.length === 0 ? (
                <p className="text-center text-gray-500 py-6">
                  No products found.
                </p>
              ) : (
                <div className="space-y-4">
                  {filteredProducts.map((p, i) => (
                    <div
                      key={i}
                      className="border rounded-lg p-4 flex gap-4 justify-between hover:shadow-sm"
                    >
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded border overflow-hidden">
                          {p.images.preview ? (
                            <img
                              src={p.images.preview}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="h-full flex items-center justify-center text-[10px]">
                              No Img
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">{p.title}</p>
                          <p className="text-xs text-gray-500">
                            {p.mainCategory} / {p.subCategory}
                          </p>
                          <p className="text-xs text-gray-500">
                            Color: {p.color}
                          </p>
                          <p className="text-sm mt-1">
                            ₹{p.price.discounted || p.price.original}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleEditProduct(i)}
                          className="text-blue-600 text-sm flex items-center gap-1"
                        >
                          <Edit2 size={16} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(i)}
                          className="text-red-600 text-sm flex items-center gap-1"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "addProduct" && (
          <div className="p-6 max-w-5xl mx-auto bg-white rounded shadow mb-10">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Package />{" "}
                {editingIndex !== null ? "Edit Product" : "Add New Product"}
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

            <textarea
              className="border p-2 rounded w-full mb-6"
              rows="3"
              name="description"
              placeholder="Description..."
              value={formData.description}
              onChange={handleInputChange}
            />

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
                onChange={(e) =>
                  handlePriceChange("discounted", e.target.value)
                }
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

            {/* --- UPDATED IMAGE SECTION --- */}
            <div className="border-t pt-6 mb-8">
              <h2 className="text-xl font-semibold mb-6">Product Images</h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. MAIN IMAGE (COMPULSORY) - Takes up 1 column but highlighted */}
                <div className="col-span-1">
                  <p className="text-sm font-bold mb-2 flex items-center gap-2">
                    Main Image{" "}
                    <span className="text-red-500 text-xs">(Required)</span>
                  </p>
                  <div className="border-2 border-dashed border-blue-200 bg-blue-50 rounded-lg p-6 flex flex-col items-center justify-center text-center h-64 relative">
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
                          className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600"
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
                          onChange={(e) =>
                            handleMainImageUpload(e.target.files[0])
                          }
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* 2. GALLERY IMAGES (OPTIONAL) - Grid of 4 */}
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
                        <span className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide">
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
                              onClick={() => removeGalleryImage(i)}
                              className="absolute -top-2 -right-2 bg-white text-red-500 border border-red-100 p-1 rounded-full shadow-sm hover:bg-red-50"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full border border-dashed border-gray-300 rounded hover:bg-gray-100 transition">
                            <Upload size={16} className="text-gray-400 mb-1" />
                            <span className="text-[10px] text-gray-500">
                              Upload
                            </span>
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
        )}
      </div>
    </div>
  );
};

export default Preview;
