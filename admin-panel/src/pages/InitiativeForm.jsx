import React, { useState, useEffect } from "react";
import { initializeApp, getApps } from "firebase/app";
import {
  getDatabase,
  ref,
  push,
  update,
  remove,
  onValue,
} from "firebase/database";

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

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);

const Initiatives = () => {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    description: "",
    author: "", // Added author field
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initiatives, setInitiatives] = useState([]);
  const [editingInitiativeId, setEditingInitiativeId] = useState(null);

  useEffect(() => {
    const initiativesRef = ref(db, "initiatives");
    onValue(initiativesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const initiativeList = Object.entries(data).map(([id, initiative]) => ({
          id,
          ...initiative,
        }));
        setInitiatives(initiativeList);
      } else {
        setInitiatives([]);
      }
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      setImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const initiativeData = { ...formData, image: imagePreview };
    try {
      if (editingInitiativeId) {
        await update(
          ref(db, `initiatives/${editingInitiativeId}`),
          initiativeData
        );
        setEditingInitiativeId(null);
      } else {
        await push(ref(db, "initiatives"), initiativeData);
      }
      setFormData({ title: "", date: "", description: "", author: "" }); // Reset author field
      setImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Initiative operation error:", error);
    }

    setLoading(false);
  };

  const handleEdit = (initiative) => {
    setFormData({
      title: initiative.title,
      date: initiative.date,
      description: initiative.description,
      author: initiative.author || "", // Handle existing entries that might not have author
    });
    setImagePreview(initiative.image);
    setEditingInitiativeId(initiative.id);
  };

  const handleDelete = async (id) => {
    try {
      await remove(ref(db, `initiatives/${id}`));
    } catch (error) {
      console.error("Initiative deletion error:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          {editingInitiativeId ? "Edit Initiative" : "Create an Initiative"}
        </h2>
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Initiative Title"
          required
          className="w-full p-2 border rounded-lg"
        />
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded-lg"
        />
        <input
          name="author"
          value={formData.author}
          onChange={handleChange}
          placeholder="Author Name"
          required
          className="w-full p-2 border rounded-lg"
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Initiative Description"
          required
          className="w-full p-2 border rounded-lg"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="w-full p-2 border rounded-lg"
        />
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
          />
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          {loading
            ? "Saving Initiative..."
            : editingInitiativeId
            ? "Update Initiative"
            : "Create Initiative"}
        </button>
      </form>
      <div className="mt-8 w-full max-w-2xl">
        {initiatives.map((initiative) => (
          <div
            key={initiative.id}
            className="bg-white p-4 rounded-lg shadow-md mb-4"
          >
            <h3 className="text-xl font-bold">{initiative.title}</h3>
            <div className="flex text-sm text-gray-500">
              <p>{initiative.date}</p>
              {initiative.author && (
                <p className="ml-2">By {initiative.author}</p>
              )}
            </div>
            <p>{initiative.description}</p>
            {initiative.image && (
              <img
                src={initiative.image}
                alt={initiative.title}
                className="w-full h-48 object-cover rounded-lg"
              />
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => handleEdit(initiative)}
                className="bg-yellow-500 text-white py-1 px-3 rounded-lg hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(initiative.id)}
                className="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Initiatives;