import React, { useEffect, useState } from "react";
import api from "../../api/api";

export default function MenuPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get("/products/")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-8 min-h-screen bg-gradient-to-r from-amber-50 to-orange-100">
      <h2 className="text-3xl font-bold text-center mb-6">🍽 Thực đơn hôm nay</h2>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <div
            key={p._id}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-5 flex flex-col justify-between"
          >
            <h3 className="text-xl font-semibold mb-2 text-gray-800">{p.name}</h3>
            <p className="text-lg text-amber-600 font-medium">{p.price}₫</p>
          </div>
        ))}
      </div>
    </div>
  );
}
