import React, { useState, useEffect } from "react";
import { Hash } from "lucide-react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";
import { useNavigate } from "react-router-dom";

// 🔥 Firebase Configuration
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
// 🔥 Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Function to calculate the current academic year
const calculateAcademicYear = () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth(); // 0-11 (Jan-Dec)
  const currentYear = currentDate.getFullYear();
  
  // If we're in March or later, the academic year is currentYear and currentYear+1
  // Otherwise it's currentYear-1 and currentYear
  if (currentMonth >= 2) { // March is month 2 (0-indexed)
    return `${currentYear}-${currentYear + 1}`;
  } else {
    return `${currentYear - 1}-${currentYear}`;
  }
};

const ReachesForm = () => {
  // Initialize with the calculated academic year
  const [reachData, setReachData] = useState({
    reachesYear: calculateAcademicYear(),
    cities: "",
    educationalActivities: "",
    students: "",
    peopleReached: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Set the academic year whenever the component mounts
    setReachData(prev => ({
      ...prev,
      reachesYear: calculateAcademicYear()
    }));
    
    const reachesRef = ref(db, "reaches");
    const unsubscribe = onValue(reachesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Preserve the calculated academic year
        setReachData({
          ...data,
          reachesYear: calculateAcademicYear()
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await set(ref(db, "reaches"), reachData);
      alert("Reaches data updated successfully!");
      navigate("");
    } catch (err) {
      setError("Failed to update reach data. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReachData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-xl w-full max-w-md p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Update Reaches Data {reachData.reachesYear}
        </h2>
        <p className="text-center text-gray-500 mb-6">Enter the latest statistics</p>

        {error && <p className="text-red-600 text-center text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {Object.keys(reachData).map((key) => (
            key !== 'reachesYear' ? (
              <div key={key} className="space-y-2">
                <label htmlFor={key} className="text-sm font-medium text-gray-700 block">
                  {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="number"
                    id={key}
                    name={key}
                    value={reachData[key]}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    placeholder={`Enter ${key}`}
                    required
                  />
                </div>
              </div>
            ) : null
          ))}

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition duration-300 shadow-md font-semibold"
          >
            Update Reaches
          </button>
        </form>
      </div>

      {/* 📝 Display Current Data */}
      <div className="bg-white shadow-lg rounded-xl w-full max-w-md p-8 mt-8">
        <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">Current Reaches Data</h3>
        <ul className="space-y-4">
          {Object.entries(reachData).map(([key, value]) => (
            <li key={key} className="bg-gray-100 p-3 rounded-lg">
              <strong>{key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:</strong> {value}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ReachesForm;