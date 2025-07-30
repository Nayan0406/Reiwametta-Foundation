import React, { useState, useEffect } from "react";
import Register from "./Register";
import { getDatabase, ref, onValue } from "firebase/database";

const Src = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [srcData, setSrcData] = useState({ heading: "", content: "", src: "" });

  useEffect(() => {
    const db = getDatabase();
    const srcRef = ref(db, "items");

    onValue(srcRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const itemList = Object.entries(data).map(([id, item]) => ({
          id,
          ...item,
        }));
        const latestItem = itemList[itemList.length - 1]; // Fetch the latest uploaded item
        setSrcData(latestItem);
      }
    });
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header Section */}
      {/* <h1 className="text-2xl uppercase text-gray-600 mb-4">SRC</h1> */}

      {/* Main Content */}
      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/* Left Column - Text Content */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {srcData.heading || "Savitribai Phule Resource Center"}
          </h1>

          <p className="text-gray-700 leading-relaxed">
            {srcData.content ||
              "Default content about the SRC. This will be replaced by the latest data from Firebase."}
          </p>
        </div>

        {/* Right Column - Dynamic Image */}
        <div className="md:pl-7 px-4 md:px-0">
  <img
    src={srcData.src && "/src.jpeg"}
    alt="SRC Display"
    className="rounded-2xl w-full h-auto object-cover scale-100 md:scale-110 transform max-w-full"
  />
</div>
</div>
      {/* Ready to Begin Section */}
      <div className="bg-yellow-400 rounded-lg p-9 mt-6 flex items-center hover:bg-yellow-600  transition-colors">
        <div>
          <h3 className="text-lg font-semibold">
            Ready to begin? Register for our Foundation Course
          </h3>
        </div>
        <button
  onClick={() => setShowPopup(true)}
  className="ml-auto bg-white text-gray-900 px-6 py-2 rounded-lg border border-gray-300"
>
  REGISTER NOW
</button>
      </div>

      {/* Popup Modal for Register Form */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-200 opacity-95 overflow-y-auto">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            <Register onClose={() => setShowPopup(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Src;
