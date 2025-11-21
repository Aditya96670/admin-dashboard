import React, { useState } from "react";
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
} from "lucide-react";

// CATEGORY DATA
const categories = {
  Shirts: [
    "Casual Shirts",
    "Formal Shirts",
    "Printed Shirts",
    "Plain/Solid Shirts",
    "Denim Shirts",
    "Linen Shirts",
  ],
  "T-Shirts": [
    "Half Sleeve",
    "Full Sleeve",
    "Polo T-Shirts",
    "Oversized T-Shirts",
    "Graphic/Printed",
    "Plain/Solid",
  ],
  Jeans: [
    "Slim Fit",
    "Regular Fit",
    "Skinny Fit",
    "Baggy/Loose Fit",
    "Ripped Distressed",
  ],
  "Trousers / Pants": [
    "Chinos",
    "Formal Trousers",
    "Casual Pants",
    "Joggers",
    "Cargo Pants",
  ],
  "Ethnic Wear": ["Kurta", "Kurta Set", "Sherwani", "Nehru Jacket"],
  "Activewear / Sportswear": [
    "Track Pants",
    "Sports Shorts",
    "Active T-Shirts",
    "Gym Wear",
  ],
  "Winter Wear": ["Hoodies", "Sweatshirts", "Jackets", "Sweaters", "Coats"],
  "Innerwear & Lounge": [
    "Boxers",
    "Briefs",
    "Vests",
    "Pyjama Sets",
    "Nightwear",
  ],
  Shorts: ["Casual Shorts", "Sports Shorts", "Denim Shorts"],
  Footwear: ["Casual Shoes", "Sports Shoes", "Sandals & Floaters", "Sneakers"],
};

// DEFAULT FORM DATA (reset ke liye)
const defaultFormState = {
  title: "",
  mainCategory: "Shirts",
  subCategory: "",
  price: { original: "", discounted: "", offPercent: "" },
  sizes: [{ size: "S", stock: "" }],
  rating: "",
  color: "",
  description: "",
  specifications: {
    fabric: "",
    neck: "",
    pattern: "",
    sleeve: "",
    fit: "",
    style: "",
  },
  images: {
    preview: null,
    hover: null,
    gallery: [
      { view: "front", file: null },
      { view: "back", file: null },
      { view: "left", file: null },
      { view: "right", file: null },
      { view: "detail", file: null },
    ],
  },
};

const Preview = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState(defaultFormState);

  // null = naya product, number = edit index
  const [editingIndex, setEditingIndex] = useState(null);

  // INPUT HANDLERS
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "mainCategory") {
      setFormData((prev) => ({
        ...prev,
        mainCategory: value,
        subCategory: "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePriceChange = (field, value) => {
    setFormData((prev) => {
      const newPrice = { ...prev.price, [field]: value };

      // Agar original & discounted dono diye ho to offPercent auto calculate
      const original = parseFloat(newPrice.original);
      const discounted = parseFloat(newPrice.discounted);

      if (
        !isNaN(original) &&
        !isNaN(discounted) &&
        original > 0 &&
        discounted >= 0 &&
        discounted <= original
      ) {
        const off = Math.round(((original - discounted) / original) * 100);
        newPrice.offPercent = off.toString();
      }

      return {
        ...prev,
        price: newPrice,
      };
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

  // IMAGE HANDLERS
  const handleImageUpload = (field, file) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = () =>
      setFormData((prev) => ({
        ...prev,
        images: { ...prev.images, [field]: r.result },
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

  // VALIDATION
  const validateForm = () => {
    if (!formData.title.trim()) {
      alert("Product title required");
      return false;
    }
    if (!formData.mainCategory || !formData.subCategory) {
      alert("Category & sub-category required");
      return false;
    }
    if (!formData.color.trim()) {
      alert("Color is required");
      return false;
    }
    const original = parseFloat(formData.price.original);
    if (isNaN(original) || original <= 0) {
      alert("Original price is required and must be > 0");
      return false;
    }
    if (!formData.images.preview) {
      alert("Preview image is required");
      return false;
    }
    const hasSizeStock = formData.sizes.some(
      (s) => s.stock && parseInt(s.stock) > 0
    );
    if (!hasSizeStock) {
      alert("At least one size must have stock > 0");
      return false;
    }
    if (formData.description.trim().length < 10) {
      alert("Description should be at least 10 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    if (editingIndex !== null) {
      // Update existing product
      setProducts((prev) =>
        prev.map((p, i) => (i === editingIndex ? formData : p))
      );
      alert("Product updated successfully!");
    } else {
      // Add new product
      setProducts((prev) => [...prev, formData]);
      alert("Product added successfully!");
    }

    // Reset state
    setFormData(defaultFormState);
    setEditingIndex(null);
    setActiveTab("products");
  };

  const handleEditProduct = (index) => {
    setFormData(products[index]);
    setEditingIndex(index);
    setActiveTab("addProduct");
  };

  const handleDeleteProduct = (index) => {
    const confirmDelete = window.confirm("Delete this product?");
    if (!confirmDelete) return;
    setProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    {
      label: "Total Products",
      value: products.length,
      icon: Package,
      color: "bg-blue-500",
    },
    {
      label: "Total Orders",
      value: "1,234",
      icon: ShoppingBag,
      color: "bg-green-500",
    },
    { label: "Customers", value: "856", icon: Users, color: "bg-purple-500" },
    {
      label: "Revenue",
      value: "₹2.4L",
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
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
              {tab === "addProduct" && "Add New Product"}
              {tab === "orders" && "Orders"}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X /> : <Menu />}
          </button>
          <p className="font-medium">Admin User</p>
        </header>

        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded shadow flex items-center justify-between"
              >
                <div>
                  <p className="text-sm text-gray-500">{s.label}</p>
                  <p className="text-2xl font-bold mt-1">{s.value}</p>
                </div>
                <div className={`${s.color} p-3 rounded-lg`}>
                  <s.icon className="text-white" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products */}
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

            {/* List */}
            <div className="bg-white p-4 rounded shadow">
              {filteredProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-6">
                  No products added yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {filteredProducts.map((p, i) => (
                    <div
                      key={i}
                      className="border rounded-lg p-4 flex gap-4 items-start justify-between hover:shadow-sm transition"
                    >
                      <div className="flex gap-4">
                        {/* Image */}
                        <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex items-center justify-center border">
                          {p.images.preview ? (
                            <img
                              src={p.images.preview}
                              className="w-full h-full object-cover"
                              alt={p.title}
                            />
                          ) : (
                            <span className="text-[10px] text-gray-400 text-center px-1">
                              No Image
                            </span>
                          )}
                        </div>

                        {/* Info */}
                        <div>
                          <p className="font-semibold">{p.title}</p>
                          <p className="text-xs text-gray-500">
                            {p.mainCategory} ➝ {p.subCategory}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Color:{" "}
                            <span className="font-medium">{p.color}</span>
                          </p>
                          <p className="text-sm mt-1">
                            ₹{p.price.discounted || p.price.original}{" "}
                            {p.price.offPercent && (
                              <span className="text-green-600 text-xs ml-2">
                                ({p.price.offPercent}% OFF)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Sizes:{" "}
                            {p.sizes
                              .filter((s) => s.stock && parseInt(s.stock) > 0)
                              .map((s) => `${s.size}(${s.stock})`)
                              .join(", ") || "No Stock"}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 items-end">
                        {editingIndex === i && (
                          <span className="text-[10px] text-blue-600 border border-blue-200 px-2 py-1 rounded-full">
                            Editing
                          </span>
                        )}
                        <button
                          className="flex items-center gap-1 text-sm text-blue-600"
                          onClick={() => handleEditProduct(i)}
                        >
                          <Edit2 size={16} /> Edit
                        </button>
                        <button
                          className="flex items-center gap-1 text-sm text-red-600"
                          onClick={() => handleDeleteProduct(i)}
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

        {/* Add New Product */}
        {activeTab === "addProduct" && (
          <div className="p-6 max-w-5xl mx-auto bg-white rounded shadow mb-10">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Package />{" "}
                {editingIndex !== null ? "Edit Product" : "Add New Product"}
              </h1>
              {editingIndex !== null && (
                <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                  Editing existing product
                </span>
              )}
            </div>

            {/* Basic Info */}
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
                onChange={handleInputChange}
              >
                {Object.keys(categories).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>

              <select
                className="border p-2 rounded"
                name="subCategory"
                value={formData.subCategory}
                onChange={handleInputChange}
              >
                <option value="">Select Sub Category *</option>
                {categories[formData.mainCategory].map((sub) => (
                  <option key={sub}>{sub}</option>
                ))}
              </select>

              <input
                className="border p-2 rounded"
                name="color"
                placeholder="Color (required)"
                value={formData.color}
                onChange={handleInputChange}
              />
            </div>

            <textarea
              className="border p-2 rounded w-full mb-6"
              rows="3"
              name="description"
              placeholder="Description (min 10 characters)"
              value={formData.description}
              onChange={handleInputChange}
            />

            {/* Pricing */}
            <h2 className="font-semibold mb-2">Pricing</h2>
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
                placeholder="Discount % (auto)"
                value={formData.price.offPercent}
                readOnly
              />
            </div>

            {/* Sizes */}
            <h2 className="font-semibold mb-3">Sizes & Stock</h2>
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

            {/* PRODUCT IMAGES */}
            <div className="border-b pb-8 mb-8">
              <h2 className="text-2xl font-semibold mb-6 text-gray-700">
                Product Images
              </h2>

              {/* Preview + Hover */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Preview Image */}
                <div className="bg-gray-100 rounded-xl p-5 shadow-sm border">
                  <h3 className="text-sm font-semibold mb-3">
                    Preview Image *
                  </h3>
                  <div className="w-full flex flex-col items-center">
                    {formData.images.preview ? (
                      <img
                        src={formData.images.preview}
                        className="w-32 h-32 object-cover rounded-lg mb-3 border"
                        alt="Preview"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-lg bg-white border-2 border-dashed flex items-center justify-center text-xs text-gray-500 mb-3">
                        No Image
                      </div>
                    )}

                    <label className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer text-sm">
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleImageUpload("preview", e.target.files[0])
                        }
                      />
                    </label>
                  </div>
                </div>

                {/* Hover Image */}
                <div className="bg-gray-100 rounded-xl p-5 shadow-sm border">
                  <h3 className="text-sm font-semibold mb-3">Hover Image</h3>
                  <div className="w-full flex flex-col items-center">
                    {formData.images.hover ? (
                      <img
                        src={formData.images.hover}
                        className="w-32 h-32 object-cover rounded-lg mb-3 border"
                        alt="Hover"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-lg bg-white border-2 border-dashed flex items-center justify-center text-xs text-gray-500 mb-3">
                        No Image
                      </div>
                    )}

                    <label className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer text-sm">
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleImageUpload("hover", e.target.files[0])
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Gallery */}
              <div className="mt-8">
                <h3 className="font-semibold mb-4 text-gray-700">
                  Gallery Images
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
                  {formData.images.gallery.map((img, i) => (
                    <div
                      key={i}
                      className="p-4 bg-gray-100 rounded-lg border flex flex-col items-center"
                    >
                      <p className="text-xs mb-2 capitalize">{img.view} View</p>

                      {img.file ? (
                        <img
                          src={img.file}
                          className="w-20 h-20 rounded-md object-cover mb-3 border"
                          alt={img.view}
                        />
                      ) : (
                        <div className="w-20 h-20 border-dashed border-2 bg-white border-gray-300 rounded-md flex items-center justify-center text-[9px] mb-3">
                          No Image
                        </div>
                      )}

                      <label className="bg-blue-500 text-white px-2 py-1 rounded-md text-xs cursor-pointer">
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleGalleryUpload(i, e.target.files[0])
                          }
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SAVE PRODUCT */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSubmit}
                className="bg-green-600 text-white px-6 py-3 rounded font-semibold flex items-center gap-2"
              >
                <Save size={20} />
                {editingIndex !== null ? "Update Product" : "Save Product"}
              </button>

              {editingIndex !== null && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData(defaultFormState);
                    setEditingIndex(null);
                  }}
                  className="text-sm text-gray-500 underline"
                >
                  Cancel Editing
                </button>
              )}
            </div>
          </div>
        )}

        {/* Orders */}
        {activeTab === "orders" && (
          <div className="p-6 text-center text-gray-500">
            <ShoppingBag size={40} className="mx-auto mb-3 text-gray-400" />
            Orders management coming soon...
          </div>
        )}
      </div>
    </div>
  );
};

export default Preview;
