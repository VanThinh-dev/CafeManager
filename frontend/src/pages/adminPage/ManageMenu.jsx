import { useEffect, useState } from "react";
import api from "../../api/api";

export default function ManageMenu() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", price: "" });

  const loadProducts = async () => {
    const res = await api.get("/products");
    setProducts(res.data);
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) return alert("Nhập đủ thông tin!");
    await api.post("/products", { ...newProduct, price: Number(newProduct.price) });
    setNewProduct({ name: "", price: "" });
    loadProducts();
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="p-5">
      <h2 className="text-xl font-bold mb-4">🍔 Quản lý menu</h2>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Tên món"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Giá"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          className="border p-2 rounded"
        />
        <button onClick={addProduct} className="bg-green-500 text-white px-4 py-2 rounded">
          Thêm món
        </button>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th>Tên</th>
            <th>Giá</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="text-center border-t">
              <td>{p.name}</td>
              <td>{p.price.toLocaleString()} đ</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}