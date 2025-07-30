import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";

// Firebase Configuration remains the same
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

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const Events = () => {
  const [events, setEvents] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);

  // Enhanced Date Parsing Function
  const parseDate = (dateString) => {
    if (!dateString) return { month: "JAN", day: "1" };

    try {
      const date = new Date(dateString);
      const months = [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC",
      ];

      return {
        month: months[date.getMonth()],
        day: date.getDate().toString().padStart(2, "0"),
      };
    } catch (error) {
      console.error("Error parsing date:", error);
      return { month: "JAN", day: "1" };
    }
  };

  // Fetch Events from Realtime Database
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsRef = ref(db, "events");
        const snapshot = await get(eventsRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const eventsArray = Object.keys(data).map((key) => {
            const event = data[key];

            // Improved date parsing
            const parsedDate = parseDate(event.eventDate || event.date);

            return {
              id: key,
              title: event.title || "Untitled Event",
              description: event.description || "",
              image: event.image || "",
              date: parsedDate,
              fullDate: event.eventDate || event.date || null, // Keep original date for reference
            };
          });

          // Sort events by date - most recent first
          eventsArray.sort((a, b) => {
            if (!a.fullDate) return 1;
            if (!b.fullDate) return -1;
            return new Date(b.fullDate) - new Date(a.fullDate); // Changed to descending order
          });

          setEvents(eventsArray);
        } else {
          console.log("No events found");
          setEvents([]);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  // Load More Events Function
  const loadMoreEvents = () => {
    setVisibleCount((prevCount) => prevCount + 6);
  };

  // Improved function to safely extract text from HTML content
  const stripHtmlAndTruncate = (htmlContent, maxLength = 120) => {
    if (!htmlContent) return "";
    
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    
    // Get the text content
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    
    // Truncate the text
    return textContent.length > maxLength
      ? textContent.substring(0, maxLength) + "..."
      : textContent;
  };

  // Function to check if there are more events to load
  const hasMoreEvents = () => {
    return visibleCount < events.length;
  };

  // Placeholder image for events without images
  const placeholderImage = "https://via.placeholder.com/400x250?text=No+Image";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-medium uppercase tracking-wider">
          OUR EVENTS
        </h1>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No events found. Check back soon!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.slice(0, visibleCount).map((event) => (
              <Link
                to={`/eventsubpage/${event.id}`}
                key={event.id}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={event.image || placeholderImage}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = placeholderImage;
                    }}
                  />
                </div>

                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-2 min-w-14">
                      <span className="text-yellow-500 text-xs font-medium uppercase">
                        {event.date.month}
                      </span>
                      <span className="text-2xl font-bold">{event.date.day}</span>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-medium mb-1 text-lg">{event.title}</h3>
                      <p className="text-gray-600 text-sm">
                        {stripHtmlAndTruncate(event.description)}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More Button - Only show if there are more events to load */}
          {hasMoreEvents() && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMoreEvents}
                className="border border-yellow-500 text-yellow-500 px-8 py-2 rounded-full hover:bg-yellow-500 hover:text-white transition-colors duration-300 text-sm"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Events;