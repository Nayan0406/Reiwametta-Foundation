import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";

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

const EventSubPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [event, setEvent] = useState(location.state?.event || null);
  const [loading, setLoading] = useState(!event);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!event) {
        try {
          setLoading(true);
          const eventRef = ref(db, `events/${id}`);
          const snapshot = await get(eventRef);

          if (snapshot.exists()) {
            const eventData = snapshot.val();

            // ✅ Ensure gallery is an array (convert object to array if needed)
            const galleryArray = eventData.gallery
              ? Array.isArray(eventData.gallery)
                ? eventData.gallery
                : Object.values(eventData.gallery) // Convert object to array
              : [];

            setEvent({ ...eventData, gallery: galleryArray });
          } else {
            console.log("Event not found in database.");
            setEvent(null);
          }
        } catch (error) {
          console.error("Error fetching event:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchEvent();
  }, [id, event]);

  if (loading) {
    return <div className="text-center text-blue-500 text-xl">Loading event...</div>;
  }

  if (!event) {
    return <div className="text-center text-red-500 text-xl">Event not found!</div>;
  }

  // Function to safely render HTML content
  const createMarkup = (htmlContent) => {
    return { __html: htmlContent };
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      {/* 🔹 Event Details Section */}
      <section className="bg-white rounded-lg shadow-sm p-4 md:p-6 flex flex-col md:flex-row gap-6 md:gap-24">
        <div className="w-full md:w-[45%] space-y-6 md:space-y-12">
          <div className="rounded-lg overflow-hidden">
            <img src={event.image} alt={event.title} className="w-full h-full object-cover rounded-lg" />
          </div>
        </div>

        <div className="w-full md:w-[45%]">
          <h1 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">{event.title}</h1>
          <div className="flex flex-wrap items-center gap-3 mb-3 md:mb-4">
            <span className="font-medium">Date: {event.date}</span>
          </div>
          <div className="space-y-3 md:space-y-4 text-gray-700">
            {/* Use dangerouslySetInnerHTML to properly render HTML content */}
            <div 
              dangerouslySetInnerHTML={createMarkup(event.description)} 
              className="description-content"
            />
          </div>
        </div>
      </section>

      {/* 🔹 Gallery Section with Pinterest Layout */}
      {event.gallery && event.gallery.length > 0 && (
        <section className="mt-6">
          {/* 🔹 "GALLERY" Title */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-12 h-[2px] bg-gray-800"></div>
            <span className="text-sm font-bold tracking-widest uppercase text-gray-800">Gallery</span>
          </div>

          {/* 🔹 Masonry Gallery */}
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {event.gallery.map((img, index) => (
              <div key={index} className="w-full break-inside-avoid rounded-lg overflow-hidden shadow-sm">
                <img 
                  src={img} 
                  alt={`Gallery ${index}`} 
                  className="w-full object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default EventSubPage;