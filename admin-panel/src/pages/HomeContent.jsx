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

const HomeContent = () => {
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [homeContents, setHomeContents] = useState([]);
  const [editingContentId, setEditingContentId] = useState(null);

  useEffect(() => {
    const contentRef = ref(db, "homeContent");
    onValue(contentRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const contentList = Object.entries(data).map(([id, content]) => ({
          id,
          ...content,
        }));
        setHomeContents(contentList);
      } else {
        setHomeContents([]);
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

    const contentData = { ...formData, image: imagePreview };
    try {
      if (editingContentId) {
        await update(ref(db, `homeContent/${editingContentId}`), contentData);
        setEditingContentId(null);
      } else {
        await push(ref(db, "homeContent"), contentData);
      }
      setFormData({ title: "", content: "" });
      setImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Content operation error:", error);
    }

    setLoading(false);
  };

  const handleEdit = (content) => {
    setFormData({ title: content.title });
    setImagePreview(content.image);
    setEditingContentId(content.id);
  };

  const handleDelete = async (id) => {
    try {
      await remove(ref(db, `homeContent/${id}`));
    } catch (error) {
      console.error("Content deletion error:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          {editingContentId ? "Edit Home Content" : "Create Home Content"}
        </h2>
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Home Title"
          required
          className="w-full p-2 border rounded-lg"
        />
        {/* <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder="Home Content"
          required
          className="w-full p-2 border rounded-lg"
        /> */}
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
            ? "Saving Content..."
            : editingContentId
            ? "Update Content"
            : "Create Content"}
        </button>
      </form>
      <div className="mt-8 w-full max-w-2xl">
        {homeContents.map((content) => (
          <div
            key={content.id}
            className="bg-white p-4 rounded-lg shadow-md mb-4"
          >
            <h3 className="text-xl font-bold">{content.title}</h3>
            {/* <p>{content.content}</p> */}
            {content.image && (
              <img
                src={content.image}
                alt={content.title}
                className="w-full h-48 object-cover rounded-lg"
              />
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => handleEdit(content)}
                className="bg-yellow-500 text-white py-1 px-3 rounded-lg hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(content.id)}
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

export default HomeContent;
