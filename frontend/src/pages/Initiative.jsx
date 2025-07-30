import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

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

const Initiative = () => {
  const [initiatives, setInitiatives] = useState([]);
  const navigate = useNavigate(); // Initialize navigation
  
  useEffect(() => {
    const initiativesRef = ref(db, "initiatives");
    
    onValue(initiativesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const initiativesArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setInitiatives(initiativesArray.reverse());
      }
    });
  }, []);

  // Function to safely extract and truncate text from HTML content
  const stripHtmlAndTruncate = (htmlContent, maxLength = 120) => {
    if (!htmlContent) return "";
    
    // Create a temporary div to parse HTML if the content might be HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    
    // Get the text content
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    
    // Truncate the text
    return textContent.length > maxLength
      ? textContent.substring(0, maxLength) + "..."
      : textContent;
  };

  const handleNavigate = (id) => {
    navigate(`/initiatives/${id}`);
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-medium uppercase tracking-wider mb-8">
        Our Initiatives
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initiatives.map((initiative) => (
          <div
            key={initiative.id}
            className="bg-white shadow-sm rounded-lg overflow-hidden relative p-4 cursor-pointer transition hover:shadow-md"
            onClick={() => handleNavigate(initiative.id)}
          >
            <img
              src={initiative.image}
              alt={initiative.title}
              className="w-full h-48 object-cover rounded-lg"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/400x250?text=No+Image";
              }}
            />
            
            <div className="p-4">
              <h3 className="text-xl font-semibold text-yellow-500">
                {initiative.title}
              </h3>
              {/* Truncated description with line-clamp CSS property */}
              <p className="text-gray-600 text-sm mb-2 line-clamp-3 overflow-hidden">
                {stripHtmlAndTruncate(initiative.description, 150)}
              </p>
              
              <div className="mt-4 text-xs text-gray-400">
                <span>
                  {initiative.date ? new Date(initiative.date).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short'
                  }) : 'No date'}
                </span>
                <span className="ml-2"> - {initiative.author || 'Unknown'}</span>
              </div>
            </div>
            
            <div className="absolute top-35 right-6 md:bottom-6 md:right-8 sm:bottom-3 sm:right-5 z-10">
              <button 
                className="border-2 border-yellow-500 text-black px-6 py-2 rounded-full bg-yellow-500 hover:bg-white hover:text-yellow-500 transition-colors duration-300 text-lg md:text-base sm:text-base"
                onClick={(e) => {
                  e.stopPropagation(); // Prevents triggering card click
                  handleNavigate(initiative.id);
                }}
              >
                Read More
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Initiative;