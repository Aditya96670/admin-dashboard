import { API } from "../config/api.js";

export async function adminLogin(email, password) {
  const res = await fetch(`${API}/api/admin/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return res.json();
}

export async function getProducts(token) {
  const res = await fetch(`${API}/api/admin/products`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}
