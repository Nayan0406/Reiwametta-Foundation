import React, { useState, useEffect, useRef } from "react";
import { initializeApp, getApps } from "firebase/app";
import {
  getDatabase,
  ref,
  push,
  update,
  remove,
  onValue,
  get,
} from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCss1p73oQfkiHUNrw706-kD9-neh0Cye4",
  authDomain: "rewa-4fa3e.firebaseapp.com",
  databaseURL: "https://rewa-4fa3e-default-rtdb.firebaseio.com",
  projectId: "rewa-4fa3e",
  storageBucket: "rewa-4fa3e.appspot.com",
  messagingSenderId: "458509453972",
  appId: "1:458509453972:web:c63b70f4392db157a40281",
  measurementId: "G-7XHFJRS0FK",
};

// Initialize Firebase
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);

// SimpleRichTextEditor component
const SimpleRichTextEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    const handlePaste = () => {
      // No direction forcing after paste
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
        }
      }, 0);
    };

    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener("paste", handlePaste);
      return () => {
        editor.removeEventListener("paste", handlePaste);
      };
    }
  }, []);

  // Update the editor content when value prop changes
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const handleBold = () => {
    document.execCommand("bold");
    editorRef.current.focus();
  };

  const handleItalic = () => {
    document.execCommand("italic");
    editorRef.current.focus();
  };

  const handleHeading = () => {
    document.execCommand("formatBlock", false, "h3");
    editorRef.current.focus();
  };

  const handleEditorChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden" lang="en">
      {/* Toolbar */}
      <div className="flex items-center p-2 bg-gray-100 border-b">
        <button
          type="button"
          onClick={handleBold}
          className="p-1 mr-2 rounded hover:bg-gray-200"
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={handleItalic}
          className="p-1 mr-2 rounded hover:bg-gray-200"
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={handleHeading}
          className="p-1 mr-2 rounded hover:bg-gray-200"
          title="Heading"
        >
          H
        </button>
      </div>

      {/* Editable content area - Fixed placeholder implementation */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleEditorChange}
        className="p-2 min-h-[150px] focus:outline-none"
        dir="ltr" // Ensure LTR direction
        data-placeholder="Enter event description" // Using data attribute for placeholder
        style={{ minHeight: "150px" }}
      />
    </div>
  );
};

// Add CSS to handle the placeholder properly
const editorStyles = `
  [contenteditable]:empty:before {
    content: attr(data-placeholder);
    color: #aaa;
    font-style: italic;
  }
`;

const EventForm = () => {
  // Initial form state with localStorage fallback
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem("eventFormData");
    return saved
      ? JSON.parse(saved)
      : {
          title: "",
          date: "",
          description: "",
        };
  });

  const [imagePreview, setImagePreview] = useState(() => {
    return localStorage.getItem("eventImagePreview") || null;
  });

  const [galleryImages, setGalleryImages] = useState(() => {
    const saved = localStorage.getItem("eventGalleryImages");
    return saved ? JSON.parse(saved) : [];
  });

  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [dataFetched, setDataFetched] = useState(false);

  const [editingEventId, setEditingEventId] = useState(() => {
    return localStorage.getItem("editingEventId") || null;
  });

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("eventFormData", JSON.stringify(formData));
    localStorage.setItem("eventImagePreview", imagePreview || "");
    localStorage.setItem("eventGalleryImages", JSON.stringify(galleryImages));
    localStorage.setItem("editingEventId", editingEventId || "");
  }, [formData, imagePreview, galleryImages, editingEventId]);

  // Initial data fetch from Firebase
  useEffect(() => {
    setLoading(true);
    const fetchEvents = async () => {
      try {
        const eventsRef = ref(db, "events");
        const snapshot = await get(eventsRef);
        const data = snapshot.val();

        if (data) {
          const eventList = Object.entries(data).map(([id, event]) => ({
            id,
            ...event,
          }));
          setEvents(eventList);
        } else {
          setEvents([]);
        }

        setDataFetched(true);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching events:", error);
        setLoading(false);
      }
    };

    fetchEvents();

    // Also set up real-time listener for updates
    const eventsRef = ref(db, "events");
    const unsubscribe = onValue(eventsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const eventList = Object.entries(data).map(([id, event]) => ({
          id,
          ...event,
        }));
        setEvents(eventList);
      } else {
        setEvents([]);
      }
    });

    // Clean up the subscription
    return () => unsubscribe();
  }, []);

  // Add the CSS for the editor placeholder
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = editorStyles;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // When editing an event, fetch the specific event data directly
  useEffect(() => {
    if (editingEventId && events.length > 0) {
      const fetchEventDetails = async () => {
        try {
          // First try to find the event in our current state
          const existingEvent = events.find((e) => e.id === editingEventId);

          if (existingEvent) {
            setFormData({
              title: existingEvent.title || "",
              date: existingEvent.date || "",
              description: existingEvent.description || "",
            });
            setImagePreview(existingEvent.image || null);
            setGalleryImages(existingEvent.gallery || []);
          } else {
            // If not found, fetch directly from Firebase
            const eventRef = ref(db, `events/${editingEventId}`);
            const snapshot = await get(eventRef);
            const eventData = snapshot.val();

            if (eventData) {
              setFormData({
                title: eventData.title || "",
                date: eventData.date || "",
                description: eventData.description || "",
              });
              setImagePreview(eventData.image || null);
              setGalleryImages(eventData.gallery || []);
            }
          }
        } catch (error) {
          console.error("Error fetching event details:", error);
        }
      };

      fetchEventDetails();
    }
  }, [editingEventId, events]);

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "EventsImages");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dasjafuhc/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error(`Upload failed with status: ${res.status}`);
      }

      const data = await res.json();
      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw error;
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      try {
        const imageUrl = await uploadToCloudinary(file);
        setImagePreview(imageUrl);
      } catch (error) {
        console.error("Image upload failed:", error);
        alert("Image upload failed. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setLoading(true);
    try {
      const uploadedImages = await Promise.all(
        files.map((file) => uploadToCloudinary(file))
      );
      setGalleryImages((prev) => [...prev, ...uploadedImages]);
    } catch (error) {
      console.error("Gallery upload failed:", error);
      alert("Gallery upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const eventData = {
      ...formData,
      image: imagePreview,
      gallery: galleryImages,
      lastUpdated: new Date().toISOString(),
    };

    try {
      if (editingEventId) {
        await update(ref(db, `events/${editingEventId}`), eventData);
        setEditingEventId(null);
      } else {
        const newEventRef = await push(ref(db, "events"), eventData);
        console.log("Event created with ID:", newEventRef.key);
      }

      // Reset form after submission
      setFormData({ title: "", date: "", description: "" });
      setImagePreview(null);
      setGalleryImages([]);

      // Clear localStorage after successful submission
      localStorage.removeItem("eventFormData");
      localStorage.removeItem("eventImagePreview");
      localStorage.removeItem("eventGalleryImages");
      localStorage.removeItem("editingEventId");

      alert(
        editingEventId
          ? "Event updated successfully!"
          : "Event created successfully!"
      );
    } catch (error) {
      console.error("Event operation error:", error);
      alert("Failed to save event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDescriptionChange = (html) => {
    setFormData((prev) => ({ ...prev, description: html }));
  };

  const handleCancelEdit = () => {
    setEditingEventId(null);
    setFormData({ title: "", date: "", description: "" });
    setImagePreview(null);
    setGalleryImages([]);

    // Clear localStorage on cancel
    localStorage.removeItem("eventFormData");
    localStorage.removeItem("eventImagePreview");
    localStorage.removeItem("eventGalleryImages");
    localStorage.removeItem("editingEventId");
  };

  const handleRemoveGalleryImage = (indexToRemove) => {
    setGalleryImages((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  // Fixed function to safely sanitize and display HTML content
  const createSafeHTML = (html) => {
    // If empty or only contains whitespace, return a message
    if (!html || html.trim() === '') {
      return '<div class="text-gray-400 italic">No description provided</div>';
    }
    return html;
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl mb-8"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {editingEventId ? "Edit Event" : "Create an Event"}
        </h2>

        {/* Title input */}
        <div className="mb-4">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Event Title
          </label>
          <input
            id="title"
            name="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Enter event title"
            required
            className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Date input */}
        <div className="mb-4">
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Event Date
          </label>
          <input
            id="date"
            type="date"
            name="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
            className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Rich Text Description */}
        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Event Description
          </label>
          <SimpleRichTextEditor
            value={formData.description || ""}
            onChange={handleDescriptionChange}
          />
        </div>

        {/* Main image upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Featured Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full p-2 border rounded-lg"
          />
          {imagePreview && (
            <div className="mt-2 relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => setImagePreview(null)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                title="Remove image"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Gallery images upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gallery Images
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryUpload}
            className="w-full p-2 border rounded-lg"
          />
          {galleryImages.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {galleryImages.map((img, index) => (
                <div key={index} className="relative">
                  <img
                    src={img}
                    alt={`Gallery ${index}`}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white text-xs p-1 rounded-full"
                    title="Remove image"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit and Cancel buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 py-2 px-4 rounded-lg text-white font-medium ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading
              ? "Saving Event..."
              : editingEventId
              ? "Update Event"
              : "Create Event"}
          </button>

          {editingEventId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="flex-1 py-2 px-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Events List */}
      <div className="w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4">Events</h2>

        {loading && !dataFetched ? (
          <div className="text-center p-8">
            <p className="text-gray-600">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center p-4 bg-white rounded-lg shadow">
            <p className="text-gray-500">
              No events found. Create your first event!
            </p>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="bg-white p-4 rounded-lg shadow-md mb-4"
            >
              <h3 className="text-xl font-bold">{event.title}</h3>
              <p className="text-gray-600 mb-3">{event.date}</p>

              {/* Fixed: Display HTML content safely with fallback for empty descriptions */}
              <div
                className="text-gray-800 mb-3 description-content"
                dangerouslySetInnerHTML={{ __html: createSafeHTML(event.description) }}
              ></div>

              {event.image && (
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-48 object-cover rounded-lg mb-3"
                />
              )}

              {event.gallery && event.gallery.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {event.gallery.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Gallery ${index}`}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setEditingEventId(event.id)}
                  className="bg-yellow-500 text-white py-1 px-3 rounded-lg hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to delete this event?"
                      )
                    ) {
                      remove(ref(db, `events/${event.id}`));
                    }
                  }}
                  className="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventForm;