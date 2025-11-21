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
} from "lucide-react";

// --- 1. UPDATED CATEGORY STRUCTURE (Matches your Navbar Image) ---
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
    Polos: [], // No 3rd level
    "Shop For Women": ["Topwear", "Bottomwear"],
  },
  Bottomwear: {
    // These are L2 items that don't have L3 sub-types in your image, so mapped to empty arrays
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

// --- 2. UPDATED DEFAULT STATE (Added specificType) ---
const defaultFormState = {
  title: "",
  mainCategory: "",
  subCategory: "",
  specificType: "", // New field for the 3rd level (e.g. "Oversized T-shirt")
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

  // Derived state for dropdown options
  const [subCatOptions, setSubCatOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);

  useEffect(() => {
    if (activeTab === "products") {
      const token = localStorage.getItem("adminToken");
      getProducts(token).then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        }
      });
    }
  }, [activeTab]);

  const [editingIndex, setEditingIndex] = useState(null);

  // --- 3. UPDATED INPUT HANDLERS (Cascading Logic) ---
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
      subCategory: "", // Reset child
      specificType: "", // Reset grandchild
    }));
    setSubCatOptions(subs);
    setTypeOptions([]);
  };

  const handleSubCatChange = (e) => {
    const value = e.target.value;
    // Get the array of types based on Main + Sub selection
    const types = categories[formData.mainCategory]?.[value] || [];

    setFormData((prev) => ({
      ...prev,
      subCategory: value,
      specificType: "", // Reset grandchild
    }));
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
        const off = Math.round(((original - discounted) / original) * 100);
        newPrice.offPercent = off.toString();
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

  const validateForm = () => {
    if (!formData.title.trim()) {
      alert("Product title required");
      return false;
    }
    if (!formData.mainCategory || !formData.subCategory) {
      alert("Category required");
      return false;
    }
    // If specific types exist for this subcat, force user to pick one
    if (typeOptions.length > 0 && !formData.specificType) {
      alert("Please select a specific type");
      return false;
    }

    if (!formData.color.trim()) {
      alert("Color is required");
      return false;
    }
    const original = parseFloat(formData.price.original);
    if (isNaN(original) || original <= 0) {
      alert("Original price > 0 required");
      return false;
    }
    if (!formData.images.preview) {
      alert("Preview image required");
      return false;
    }
    const hasSizeStock = formData.sizes.some(
      (s) => s.stock && parseInt(s.stock) > 0
    );
    if (!hasSizeStock) {
      alert("At least one size must have stock");
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
    setEditingIndex(null);
    setActiveTab("products");
  };

  const handleEditProduct = (index) => {
    const prod = products[index];
    setFormData(prod);

    // Re-populate options for the dropdowns based on saved data
    const subs = prod.mainCategory
      ? Object.keys(categories[prod.mainCategory])
      : [];
    const types =
      prod.mainCategory && prod.subCategory
        ? categories[prod.mainCategory][prod.subCategory]
        : [];

    setSubCatOptions(subs);
    setTypeOptions(types);

    setEditingIndex(index);
    setActiveTab("addProduct");
  };

  const handleDeleteProduct = (index) => {
    if (window.confirm("Delete this product?")) {
      setProducts((prev) => prev.filter((_, i) => i !== index));
    }
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

      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X /> : <Menu />}
          </button>
          <p className="font-medium">Admin User</p>
        </header>

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
                        <div>
                          <p className="font-semibold">{p.title}</p>
                          <p className="text-xs text-gray-500">
                            {/* Display all 3 levels of category */}
                            {p.mainCategory} ➝ {p.subCategory}
                            {p.specificType && (
                              <span className="text-gray-700 font-medium">
                                {" "}
                                ➝ {p.specificType}
                              </span>
                            )}
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
                      <div className="flex flex-col gap-2 items-end">
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

            {/* --- 4. UPDATED FORM UI (3 Dropdowns) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <input
                className="border p-2 rounded"
                name="title"
                placeholder="Product Title *"
                value={formData.title}
                onChange={handleInputChange}
              />

              {/* Dropdown 1: Main Category */}
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

              {/* Dropdown 2: Sub Category */}
              <select
                className={`border p-2 rounded ${
                  !formData.mainCategory ? "bg-gray-100 cursor-not-allowed" : ""
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

              {/* Dropdown 3: Specific Type (Only shows if options exist) */}
              {typeOptions.length > 0 ? (
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
              ) : (
                // If no types, we show a disabled placeholder or just hide it.
                // Here I'm using the Color input space if type is hidden, or just showing color below.
                <input
                  className="border p-2 rounded"
                  name="color"
                  placeholder="Color (required)"
                  value={formData.color}
                  onChange={handleInputChange}
                />
              )}

              {/* If Type options exist, Color gets pushed to next line, otherwise it was shown above. 
                  To keep layout grid clean, we render Color here only if Type options were shown. */}
              {typeOptions.length > 0 && (
                <input
                  className="border p-2 rounded"
                  name="color"
                  placeholder="Color (required)"
                  value={formData.color}
                  onChange={handleInputChange}
                />
              )}
            </div>
            {/* ------------------------------------------- */}

            <textarea
              className="border p-2 rounded w-full mb-6"
              rows="3"
              name="description"
              placeholder="Description (min 10 characters)"
              value={formData.description}
              onChange={handleInputChange}
            />

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

            <div className="border-b pb-8 mb-8">
              <h2 className="text-2xl font-semibold mb-6 text-gray-700">
                Product Images
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      Upload{" "}
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
                      Upload{" "}
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
                        Upload{" "}
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

            <div className="flex items-center gap-3">
              <button
                onClick={handleSubmit}
                className="bg-green-600 text-white px-6 py-3 rounded font-semibold flex items-center gap-2"
              >
                <Save size={20} />{" "}
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
