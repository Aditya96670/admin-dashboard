import React, { useState } from "react";
import { Search, Edit2, Trash2 } from "lucide-react";
import { deleteProductAPI } from "../../services/admin";

const ProductList = ({ products, setProducts, onEdit }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleDeleteProduct = async (product) => {
    if (!product._id) return;

    if (
      window.confirm(
        "Are you sure you want to delete this product from the database?"
      )
    ) {
      try {
        await deleteProductAPI(product._id);
        setProducts((prev) => prev.filter((p) => p._id !== product._id));
        alert("Product Deleted Successfully");
      } catch (error) {
        alert("Failed to delete product");
      }
    }
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
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
          <p className="text-center text-gray-500 py-6">No products found.</p>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((p, i) => (
              <div
                key={p._id || i}
                className="border rounded-lg p-4 flex gap-4 justify-between hover:shadow-sm"
              >
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded border overflow-hidden">
                    {p.images?.preview ? (
                      <img
                        src={p.images.preview}
                        className="w-full h-full object-cover"
                        alt={p.title}
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
                    <p className="text-xs text-gray-500">Color: {p.color}</p>
                    <p className="text-sm mt-1">
                      ₹{p.price.discounted || p.price.original}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => onEdit(p)}
                    className="text-blue-600 text-sm flex items-center gap-1"
                  >
                    <Edit2 size={16} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(p)}
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
  );
};

export default ProductList;
