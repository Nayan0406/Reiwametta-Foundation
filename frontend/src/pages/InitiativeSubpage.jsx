import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";

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

const InitiativeSubPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [initiative, setInitiative] = useState(location.state?.initiative || null);
  const [loading, setLoading] = useState(!initiative);

  useEffect(() => {
    const fetchInitiative = async () => {
      if (!initiative) {
        try {
          setLoading(true);
          const initiativeRef = ref(db, `initiatives/${id}`);
          const snapshot = await get(initiativeRef);

          if (snapshot.exists()) {
            setInitiative(snapshot.val());
          } else {
            console.log("Initiative not found in database.");
            setInitiative(null);
          }
        } catch (error) {
          console.error("Error fetching initiative:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchInitiative();
  }, [id, initiative]);

  if (loading) {
    return <p className="text-center text-blue-500 text-xl">Loading initiative...</p>;
  }

  if (!initiative) {
    return <p className="text-center text-red-500 text-xl">Initiative not found!</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <section className="bg-white rounded-lg shadow-sm p-4 md:p-6 flex flex-col md:flex-row gap-6 md:gap-24">
        <div className="w-full md:w-[45%] space-y-6 md:space-y-12">
          <div className="rounded-lg overflow-hidden">
            <img src={initiative.image} alt={initiative.title} className="w-full h-full object-cover rounded-lg" />
          </div>
        </div>

        <div className="w-full md:w-[45%]">
          <h1 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">{initiative.title}</h1>
          <div className="flex flex-wrap items-center gap-3 mb-3 md:mb-4">
            <span className="font-medium"> {initiative.date} </span>-
                <span className="ml-2">{initiative.author}</span>
          </div>
          <div className="space-y-3 md:space-y-4 text-gray-700">
            <p>{initiative.description}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InitiativeSubPage;
