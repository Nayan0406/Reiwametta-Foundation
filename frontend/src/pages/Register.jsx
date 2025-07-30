import { useState, useRef } from "react";
import { ref, push } from "firebase/database";
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import axios from "axios"; // Import axios for Cloudinary upload

// 🔹 Firebase Configuration
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

// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const Register = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    dob: "",
    gender: "",
    contact: "",
    email: "",
    current: "",
    qualification: "",
    category: "",
    caste: "",
    aadharURL: "", // Changed to store URLs directly
    degreeURL: "",
    casteCertURL: "",
  });

  // 🔹 State for file objects
  const [fileObjects, setFileObjects] = useState({
    aadhar: null,
    degree: null,
    casteCertificate: null,
  });

  // 🔹 Refs for file inputs
  const fileInputRefs = {
    aadhar: useRef(null),
    degree: useRef(null),
    casteCertificate: useRef(null),
  };

  // 🔹 Handle text input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 🔹 Handle file input changes (only PDFs allowed)
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === "application/pdf") {
        // Store file object separately
        setFileObjects((prev) => ({
          ...prev,
          [name]: file,
        }));
      } else {
        alert("⚠️ Only PDF files are allowed.");
        e.target.value = "";
      }
    }
  };

  // 🔹 Upload PDFs to Cloudinary
  const uploadToCloudinary = async (file) => {
    if (!file) return ""; // Return empty string if no file

    const cloudName = "dasjafuhc";
    const uploadPreset = "TeacherImages";

    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("upload_preset", uploadPreset);
    uploadData.append("resource_type", "raw"); // For PDFs

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
        uploadData
      );
      return response.data.secure_url; // Return Cloudinary file URL
    } catch (error) {
      console.error("❌ Cloudinary Upload Error:", error);
      return "";
    }
  };

  // 🔹 Form Submission Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Upload PDFs and get URLs
      const aadharUrl = await uploadToCloudinary(fileObjects.aadhar);
      const degreeUrl = await uploadToCloudinary(fileObjects.degree);
      const casteCertUrl = await uploadToCloudinary(fileObjects.casteCertificate);

      // Prepare final data with correct field names
      const finalData = {
        name: formData.name,
        age: formData.age,
        dob: formData.dob,
        gender: formData.gender,
        contact: formData.contact,
        email: formData.email,
        current: formData.current,
        qualification: formData.qualification,
        category: formData.category,
        caste: formData.caste,
        aadharURL: aadharUrl,
        degreeURL: degreeUrl,
        casteCertURL: casteCertUrl,
      };

      console.log("📌 Data being submitted:", finalData);

      // Store data in Firebase - using correct ref path
      const registrationsRef = ref(db, "registrations");
      await push(registrationsRef, finalData);

      // 🎉 Success Alert
      alert("🎉 Registration Successful!");

      // Reset form data
      setFormData({
        name: "",
        age: "",
        dob: "",
        gender: "",
        contact: "",
        email: "",
        current: "",
        qualification: "",
        category: "",
        caste: "",
        aadharURL: "",
        degreeURL: "",
        casteCertURL: "",
      });

      // Reset file objects
      setFileObjects({
        aadhar: null,
        degree: null,
        casteCertificate: null,
      });

      // Reset file inputs
      Object.keys(fileInputRefs).forEach((key) => {
        if (fileInputRefs[key].current) {
          fileInputRefs[key].current.value = "";
        }
      });
    } catch (error) {
      console.error("❌ Error submitting form:", error);
      alert("⚠️ Registration failed: " + error.message);
    }
  };

  return (
    <div className="relative w-full max-w-5xl bg-white rounded-lg shadow-1xl z-1500">
      <button
        onClick={onClose}
        className="absolute top-6 right-4 text-gray-600 hover:text-gray-800"
      >
        ✕
      </button>
      <h1 className="text-3xl font-bold text-center p-4 mb-1">Register</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Personal Information */}
          <div>
            <label className="block text-gray-600 mb-1">Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your Name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded bg-white"
              required
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Age</label>
            <input
              type="text"
              name="age"
              placeholder="Enter your Age"
              value={formData.age}
              onChange={handleInputChange}
              className="w-full p-2 border rounded bg-white"
              required
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Date of Birth</label>
            <input
              type="date"
              name="dob"
              placeholder="Enter your Date of Birth"
              value={formData.dob}
              onChange={handleInputChange}
              className="w-full p-2 border rounded bg-white"
              required
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Gender</label>
            <input
              type="text"
              name="gender"
              placeholder="Enter your Gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full p-2 border rounded bg-white"
              required
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Contact</label>
            <input
              type="text"
              name="contact"
              placeholder="Enter your Contact"
              value={formData.contact}
              onChange={handleInputChange}
              className="w-full p-2 border rounded bg-white"
              required
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Email</label>
            <input
              type="text"
              name="email"
              placeholder="Enter your Email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 border rounded bg-white"
              required
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Current Address</label>
            <input
              type="text"
              name="current"
              placeholder="Enter your Current Address"
              value={formData.current}
              onChange={handleInputChange}
              className="w-full p-2 border rounded bg-white"
              required
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Qualification</label>
            <input
              type="text"
              name="qualification"
              placeholder="Enter your Qualification"
              value={formData.qualification}
              onChange={handleInputChange}
              className="w-full p-2 border rounded bg-white"
              required
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Category</label>
            <input
              type="text"
              name="category"
              placeholder="Enter your Category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full p-2 border rounded bg-white"
              required
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Caste</label>
            <input
              type="text"
              name="caste"
              placeholder="Enter your Caste"
              value={formData.caste}
              onChange={handleInputChange}
              className="w-full p-2 border rounded bg-white"
              required
            />
          </div>
          
          {/* File uploads */}
          <div>
            <label className="block text-gray-600 mb-2">Upload Aadhar (PDF only)</label>
            <input
              type="file"
              name="aadhar"
              ref={fileInputRefs.aadhar}
              onChange={handleFileChange}
              className="w-full p-2 border rounded bg-white"
              required
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-2">Upload Degree (PDF only)</label>
            <input
              type="file"
              name="degree"
              ref={fileInputRefs.degree}
              onChange={handleFileChange}
              className="w-full p-2 border rounded bg-white"
              required
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-2">Upload Caste Certificate (PDF only)</label>
            <input
              type="file"
              name="casteCertificate"
              ref={fileInputRefs.casteCertificate}
              onChange={handleFileChange}
              className="w-full p-2 border rounded bg-white"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-yellow-500 text-white py-2 rounded-full hover:bg-yellow-600"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;