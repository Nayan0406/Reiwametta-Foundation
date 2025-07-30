import React, { useState, useEffect } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, push, update, remove, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCXXSPIcBmSjKYdDTqDkIxrbrsXgKCBG0A",
  authDomain: "src-register-c9557.firebaseapp.com",
  databaseURL: "https://src-register-c9557-default-rtdb.firebaseio.com",
  projectId: "src-register-c9557",
  storageBucket: "src-register-c9557.appspot.com",
  messagingSenderId: "204628060906",
  appId: "1:204628060906:web:78e4dea997a51d991d4593",
  measurementId: "G-6YCC168SGW",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);

const SrcForm = () => {
  const [formData, setFormData] = useState({ heading: "", content: "" });
  const [src, setSrc] = useState(null);
  const [srcPreview, setSrcPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [editingItemId, setEditingItemId] = useState(null);

  useEffect(() => {
    const itemsRef = ref(db, "items");
    onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const itemList = Object.entries(data).map(([id, item]) => ({ id, ...item }));
        setItems(itemList);
      } else {
        setItems([]);
      }
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSrcUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSrcPreview(reader.result);
      reader.readAsDataURL(file);
      setSrc(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const itemData = { ...formData, src: srcPreview };
    try {
      if (editingItemId) {
        await update(ref(db, `items/${editingItemId}`), itemData);
        setEditingItemId(null);
      } else {
        await push(ref(db, "items"), itemData);
      }
      setFormData({ heading: "", content: "" });
      setSrc(null);
      setSrcPreview(null);
    } catch (error) {
      console.error("Operation error:", error);
    }
    setLoading(false);
  };

  const handleEdit = (item) => {
    setFormData({ heading: item.heading, content: item.content });
    setSrcPreview(item.src);
    setEditingItemId(item.id);
  };

  const handleDelete = async (id) => {
    try {
      await remove(ref(db, `items/${id}`));
    } catch (error) {
      console.error("Deletion error:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">{editingItemId ? "Edit Item" : "Create an Item"}</h2>
        <input name="heading" value={formData.heading} onChange={handleChange} placeholder="Heading" required className="w-full p-2 border rounded-lg" />
        <textarea name="content" value={formData.content} onChange={handleChange} placeholder="Content" required className="w-full p-2 border rounded-lg" />
        <input type="file" accept="image/*" onChange={handleSrcUpload} className="w-full p-2 border rounded-lg" />
        {srcPreview && <img src={srcPreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />}
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
          {loading ? "Saving..." : editingItemId ? "Update Item" : "Create Item"}
        </button>
      </form>
      <div className="mt-8 w-full max-w-2xl">
        {items.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-lg shadow-md mb-4">
            <h3 className="text-xl font-bold">{item.heading}</h3>
            <p>{item.content}</p>
            {item.src && <img src={item.src} alt={item.heading} className="w-full h-48 object-cover rounded-lg" />}
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => handleEdit(item)} className="bg-yellow-500 text-white py-1 px-3 rounded-lg hover:bg-yellow-600">Edit</button>
              <button onClick={() => handleDelete(item.id)} className="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SrcForm;
