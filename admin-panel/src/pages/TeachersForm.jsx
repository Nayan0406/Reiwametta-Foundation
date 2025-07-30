import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue, update, remove } from "firebase/database";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

// Firebase Configuration
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
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const TeachersForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [editId, setEditId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/login");
    });
  }, [navigate]);

  useEffect(() => {
    const teachersRef = ref(db, "teachers");
    onValue(teachersRef, (snapshot) => {
      const data = snapshot.val();
      const loadedTeachers = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setTeachers(loadedTeachers);
    });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImageToCloudinary = async () => {
    if (!formData.image || typeof formData.image === 'string') return formData.image;

    const imageData = new FormData();
    imageData.append("file", formData.image);
    imageData.append("upload_preset", "InitiativesImages");

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dasjafuhc/image/upload`,
        {
          method: "POST",
          body: imageData,
        }
      );
      const data = await response.json();
      return data.secure_url || null;
    } catch (error) {
      console.error("Image upload error:", error);
      alert("Image upload failed!");
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const imageUrl = await uploadImageToCloudinary();
    if (!imageUrl) {
      setLoading(false);
      return;
    }

    const teacherData = { ...formData, image: imageUrl };

    try {
      if (editId) {
        await update(ref(db, `teachers/${editId}`), teacherData);
        alert("Teacher updated successfully!");
        setEditId(null);
      } else {
        await push(ref(db, "teachers"), teacherData);
        alert("Teacher added successfully!");
      }
      setFormData({ name: "", description: "", image: null });
      setImagePreview(null);
    } catch (error) {
      console.error("Error saving teacher:", error);
      alert("Failed to save teacher.");
    }

    setLoading(false);
  };

  const handleEdit = (teacher) => {
    setFormData({ name: teacher.name, description: teacher.description, image: teacher.image });
    setImagePreview(teacher.image);
    setEditId(teacher.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      try {
        await remove(ref(db, `teachers/${id}`));
        alert("Teacher deleted successfully!");
      } catch (error) {
        console.error("Error deleting teacher:", error);
        alert("Failed to delete teacher.");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">{editId ? "Edit Teacher" : "Add a Teacher"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Teacher's Name" className="w-full p-2 border rounded-lg" required />
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Teacher's Description" className="w-full p-2 border rounded-lg" required />
          <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full p-2 border rounded-lg" />
          {imagePreview && <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />}
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition" disabled={loading}>{loading ? "Saving..." : editId ? "Update Teacher" : "Add Teacher"}</button>
        </form>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {teachers.map((teacher) => (
          <div key={teacher.id} className="bg-black text-white p-6 rounded-lg shadow-lg">
            <img src={teacher.image} alt={teacher.name} className="w-full h-60 object-contain rounded-lg mb-4" />
            <h3 className="text-xl font-bold">{teacher.name}</h3>
            <p className="mt-2">{teacher.description}</p>
            <div className="mt-4 flex justify-end space-x-2">
              <button onClick={() => handleEdit(teacher)} className="bg-yellow-500 text-white px-4 py-2 rounded-lg">Edit</button>
              <button onClick={() => handleDelete(teacher.id)} className="bg-red-500 text-white px-4 py-2 rounded-lg">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeachersForm;
