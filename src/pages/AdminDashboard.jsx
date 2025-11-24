import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { getProducts } from "../services/admin";

import Sidebar from "../components/admin/Sidebar";
import ProductList from "../components/admin/ProductList";
import ProductForm from "../components/admin/ProductForm";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  // Fetch products when tab changes to "products"
  useEffect(() => {
    if (activeTab === "products") {
      fetchData();
    }
  }, [activeTab]);

  const fetchData = () => {
    const token = localStorage.getItem("adminToken");
    getProducts(token).then((data) => {
      if (Array.isArray(data)) setProducts(data);
    });
  };

  const handleEditRequest = (product) => {
    setEditingProduct(product);
    setActiveTab("addProduct");
  };

  const handleFormSuccess = () => {
    // Refresh data and go back to list
    fetchData();
    setEditingProduct(null);
    setActiveTab("products");
  };

  const handleResetForm = () => {
    setEditingProduct(null);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        sidebarOpen={sidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetForm={handleResetForm}
      />

      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X /> : <Menu />}
          </button>
          <p className="font-medium">Admin User</p>
        </header>

        {activeTab === "dashboard" && (
          <div className="p-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p>Welcome to the admin panel.</p>
          </div>
        )}

        {activeTab === "products" && (
          <ProductList
            products={products}
            setProducts={setProducts}
            onEdit={handleEditRequest}
          />
        )}

        {activeTab === "addProduct" && (
          <ProductForm
            existingProduct={editingProduct}
            onSuccess={handleFormSuccess}
          />
        )}

        {activeTab === "orders" && (
          <div className="p-6">
            <h1 className="text-2xl font-bold">Orders</h1>
            <p>Order management coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
