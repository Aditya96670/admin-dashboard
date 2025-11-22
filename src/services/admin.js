import { API } from "../config/api";

const getToken = () => localStorage.getItem("adminToken");

export async function getProducts() {
  const token = getToken();
  if (!token) return [];

  const res = await fetch(`${API}/admin/products`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function createProduct(formData) {
  const token = getToken();
  if (!token) {
    alert("Authentication Error: Please login again.");
    return;
  }

  const res = await fetch(`${API}/admin/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });
  return res.json();
}

// --- NEW FUNCTION ---
export async function deleteProductAPI(id) {
  const token = getToken();

  const res = await fetch(`${API}/admin/products/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}
