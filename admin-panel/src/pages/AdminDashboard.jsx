import React, { useState, useEffect, useRef } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";

const firebaseConfig = {
  apiKey: "AIzaSyCss1p73oQfkiHUNrw706-kD9-neh0Cye4",
  authDomain: "rewa-4fa3e.firebaseapp.com",
  projectId: "rewa-4fa3e",
  storageBucket: "rewa-4fa3e.appspot.com",
  messagingSenderId: "458509453972",
  appId: "1:458509453972:web:c63b70f4392db157a40281",
};

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);

const AdminDashboard = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const [startID, setStartID] = useState("");
  const [endID, setEndID] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [currentColumnSet, setCurrentColumnSet] = useState(0);
  const carouselRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // All possible columns that can be displayed
  const allColumns = [
    "ID",
    "First Name",
    "Age",
    "DOB",
    "Gender",
    "Email",
    "Address",
    "Qualification",
    "Category",
    "Contact",
    "Caste",
    "Aadhar",
    "Marksheet",
    "Caste Certificate",
    "Action",
    "Download",
  ];

  // Column sets for different screen sizes
  const columnSets = {
    xs: [
      // For 320px-374px
      ["ID", "First Name", "Email", "Action"],
      ["ID", "Age", "Gender", "Contact"],
      ["ID", "Qualification", "Category", "Caste"],
      ["ID", "Aadhar", "Marksheet", "Caste Certificate", "Download"],
    ],
    sm: [
      // For 375px-424px
      ["ID", "First Name", "Email", "Action"],
      ["ID", "Age", "Gender", "Contact"],
      ["ID", "Qualification", "Category", "Caste"],
      ["ID", "Aadhar", "Marksheet", "Caste Certificate", "Download"],
    ],
    md: [
      // For 425px-767px
      ["ID", "First Name", "Email", "Age", "Action"],
      ["ID", "Gender", "Contact", "Qualification", "Category"],
      ["ID", "Caste", "Aadhar", "Marksheet", "Caste Certificate", "Download"],
    ],
    lg: [
      // For 768px and above - all columns
      allColumns,
    ],
  };

  // Helper function to extract filename from URL
  const extractFilenameFromURL = (url) => {
    if (!url || url === "N/A") return "N/A";

    try {
      // Extract filename from the URL
      // First try to get it from the path segments
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split("/");
      let filename = pathSegments[pathSegments.length - 1];

      // If filename has query parameters, remove them
      if (filename.includes("?")) {
        filename = filename.split("?")[0];
      }

      // Decode URI components to handle special characters
      filename = decodeURIComponent(filename);

      // If no filename was found or it's empty, return a placeholder
      return filename || "file";
    } catch (error) {
      // If URL parsing fails, return a generic name
      return "document";
    }
  };

  // Function to set visible columns based on screen width
  const updateVisibleColumns = () => {
    const width = window.innerWidth;
    let breakpoint;

    if (width >= 768) {
      breakpoint = "lg";
      setCurrentColumnSet(0);
    } else if (width >= 425) {
      breakpoint = "md";
    } else if (width >= 375) {
      breakpoint = "sm";
    } else {
      breakpoint = "xs";
    }

    // For screen sizes with multiple column sets, use the current set
    if (breakpoint !== "lg") {
      setVisibleColumns(columnSets[breakpoint][currentColumnSet]);
    } else {
      // For large screens, show all columns
      setVisibleColumns(columnSets.lg[0]);
    }
  };

  // Change to next set of columns (for carousel functionality)
  const nextColumnSet = () => {
    if (isTransitioning || window.innerWidth >= 768) return;

    const width = window.innerWidth;
    let breakpoint;

    if (width >= 425) {
      breakpoint = "md";
    } else if (width >= 375) {
      breakpoint = "sm";
    } else {
      breakpoint = "xs";
    }

    const numSets = columnSets[breakpoint].length;
    const nextSet = (currentColumnSet + 1) % numSets;

    animateCarousel("next", nextSet);
  };

  // Change to previous set of columns
  const prevColumnSet = () => {
    if (isTransitioning || window.innerWidth >= 768) return;

    const width = window.innerWidth;
    let breakpoint;

    if (width >= 425) {
      breakpoint = "md";
    } else if (width >= 375) {
      breakpoint = "sm";
    } else {
      breakpoint = "xs";
    }

    const numSets = columnSets[breakpoint].length;
    const prevSet = (currentColumnSet - 1 + numSets) % numSets;

    animateCarousel("prev", prevSet);
  };

  // Animate carousel transition
  const animateCarousel = (direction, newSetIndex) => {
    if (!carouselRef.current) return;

    setIsTransitioning(true);

    const carousel = carouselRef.current;
    carousel.style.transition = "transform 0.3s ease-in-out";
    carousel.style.transform =
      direction === "next" ? "translateX(-100%)" : "translateX(100%)";

    setTimeout(() => {
      carousel.style.transition = "none";
      carousel.style.transform = "translateX(0)";
      setCurrentColumnSet(newSetIndex);
      setIsTransitioning(false);
    }, 300);
  };

  // Handle touch events for swiping
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextColumnSet();
    }

    if (isRightSwipe) {
      prevColumnSet();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  useEffect(() => {
    const fetchUsers = () => {
      const usersRef = ref(db, "registrations");
      onValue(usersRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const userData = Object.entries(data).map(([key, user], index) => ({
            id: index + 1,
            firebaseId: key,
            name: user.name,
            dob: user.dob || "N/A",
            email: user.email || "N/A",
            age: user.age || "N/A",
            gender: user.gender || "N/A",
            address: user.current || "N/A",
            qualification: user.qualification || "N/A",
            category: user.category || "N/A",
            contact: user.contact || "N/A",
            caste: user.caste || "N/A",
            aadhar: user.aadharURL || "N/A",
            casteCertificate: user.casteCertURL || "N/A",
            marksheet: user.degreeURL || "N/A",
          }));

          setUsers(userData);
        } else {
          setUsers([]);
        }
      });
    };
    fetchUsers();

    // Set initial visible columns
    updateVisibleColumns();

    // Add event listener for window resize
    window.addEventListener("resize", updateVisibleColumns);

    // Clean up
    return () => window.removeEventListener("resize", updateVisibleColumns);
  }, []);

  // Update visible columns when currentColumnSet changes
  useEffect(() => {
    updateVisibleColumns();
  }, [currentColumnSet]);

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedUsers(newSelected);
  };

  // Function to download full Excel sheet
  const downloadExcel = () => {
    if (users.length === 0) {
      alert("No user data available to download.");
      return;
    }

    // Create a copy of users data with properly formatted fields for Excel
    const excelData = users.map((user) => ({
      ID: user.id,
      FirstName: user.name,
      Age: user.age,
      DOB: user.dob,
      Gender: user.gender,
      Email: user.email,
      Address: user.address,
      Qualification: user.qualification,
      Category: user.category,
      Contact: user.contact,
      Caste: user.caste,
      Aadhar:
        user.aadhar !== "N/A" ? extractFilenameFromURL(user.aadhar) : "N/A",
      Marksheet:
        user.marksheet !== "N/A"
          ? extractFilenameFromURL(user.marksheet)
          : "N/A",
      "Caste Certificate":
        user.casteCertificate !== "N/A"
          ? extractFilenameFromURL(user.casteCertificate)
          : "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");

    // Create Excel file and trigger download
    XLSX.writeFile(workbook, "RegistrationsData.xlsx");
  };

  // Function to download a single user's data
  const downloadSingleUserData = (user) => {
    // Create formatted data for Excel
    const excelData = [
      {
        ID: user.id,
        FirstName: user.name,
        Age: user.age,
        DOB: user.dob,
        Gender: user.gender,
        Email: user.email,
        Address: user.address,
        Qualification: user.qualification,
        Category: user.category,
        Contact: user.contact,
        Caste: user.caste,
        Aadhar:
          user.aadhar !== "N/A" ? extractFilenameFromURL(user.aadhar) : "N/A",
        Marksheet:
          user.marksheet !== "N/A"
            ? extractFilenameFromURL(user.marksheet)
            : "N/A",
        "Caste Certificate":
          user.casteCertificate !== "N/A"
            ? extractFilenameFromURL(user.casteCertificate)
            : "N/A",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "UserData");

    // Create Excel file and trigger download
    XLSX.writeFile(
      workbook,
      `User_${user.id}_${user.name.replace(/\s+/g, "_")}.xlsx`
    );
  };

  const downloadSingleUserDataPDF = (user) => {
    console.log("Downloading user data:", user); // Debugging log

    if (!user) {
      console.error("User object is undefined or null");
      alert("User data is not available. Please try again.");
      return;
    }

    try {
      const doc = new jsPDF();

      const bgColor = [205, 217, 229];
      const padding = 10;
      // Title of the document
      doc.setFillColor(...bgColor);
      doc.rect(
        padding, // X position (left padding)
        padding, // Y position (top padding)
        doc.internal.pageSize.width - 2 * padding, // Width (reduce left & right padding)
        doc.internal.pageSize.height - 2 * padding, // Height (reduce top & bottom padding)
        "F"
      ); // 'F' means fill the rectangle

      doc.setFontSize(18);
      doc.setTextColor(0, 0, 128); // Dark blue
      doc.text("Student Registration Details", 14, 20);
      doc.setDrawColor(255, 0, 0); // Red underline
      doc.line(14, 22, 196, 22);

      // Add each piece of user data
      let yPosition = 30;
      doc.setFontSize(12);

      const userData = [
        { label: "ID", value: user.id },
        { label: "First Name", value: user.name },
        { label: "Age", value: user.age },
        { label: "DOB", value: user.dob },
        { label: "Gender", value: user.gender },
        { label: "Email", value: user.email },
        { label: "Address", value: user.address },
        { label: "Qualification", value: user.qualification },
        { label: "Category", value: user.category },
        { label: "Contact", value: user.contact },
        { label: "Caste", value: user.caste },
        {
          label: "Aadhar",
          value:
            user.aadhar && user.aadhar !== "N/A"
              ? `Link: ${user.aadhar}` // Add the link to the Aadhar document
              : "N/A",
        },
        {
          label: "Marksheet",
          value:
            user.marksheet && user.marksheet !== "N/A"
              ? `Link: ${user.marksheet}` // Add the link to the Marksheet document
              : "N/A",
        },
        {
          label: "Caste Certificate",
          value:
            user.casteCertificate && user.casteCertificate !== "N/A"
              ? `Link: ${user.casteCertificate}` // Add the link to the Caste Certificate document
              : "N/A",
        },
      ];

      userData.forEach((data) => {
        // Ensure data.value is a string
        const value = String(data.value || "N/A"); // Convert to string or default to "N/A"

        // Check if the value contains a link
        if (typeof value === "string" && value.startsWith("Link: ")) {
          const link = value.replace("Link: ", "");
          try {
            // Try to add a clickable link
            if (doc.textWithLink) {
              doc.setTextColor(0, 0, 255); // Set text color to blue for links
              doc.textWithLink(`${data.label}: Click Here`, 14, yPosition, {
                url: link,
              });
            } else {
              // Fallback: Display the link as plain text
              doc.setTextColor(0, 0, 0); // Set text color to black
              doc.text(`${data.label}: ${link}`, 14, yPosition);
            }
          } catch (error) {
            console.error("Error adding link to PDF:", error);
            // Fallback: Display the link as plain text
            doc.setTextColor(0, 0, 0); // Set text color to black
            doc.text(`${data.label}: ${link}`, 14, yPosition);
          }
        } else {
          doc.setTextColor(0, 0, 0); // Set text color to black for normal text
          doc.text(`${data.label}: ${value}`, 14, yPosition);
        }
        yPosition += 10;
      });

      // Trigger download
      doc.save(`User_${user.id}_${user.name.replace(/\s+/g, "_")}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };
  // New function to download a document file as PDF
  const downloadDocumentAsPDF = async (url, fileName, documentType) => {
    if (url === "N/A") {
      alert(`No ${documentType} document available.`);
      return;
    }

    setIsLoading(true);

    try {
      // Fetch the file from the URL
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch the document: ${response.statusText}`);
      }

      const blob = await response.blob();

      // Check if the file is already a PDF
      if (blob.type === "application/pdf") {
        // If it's already a PDF, just download it
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = `${fileName}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
      } else {
        // If it's an image or other file type, convert to PDF
        const doc = new jsPDF();

        // Convert image to base64
        const reader = new FileReader();
        reader.readAsDataURL(blob);

        reader.onload = function () {
          const imgData = reader.result;

          // Add title
          doc.setFontSize(16);
          doc.text(`${documentType} - ${fileName}`, 20, 20);

          // Add image to PDF if it's an image
          if (blob.type.startsWith("image/")) {
            const img = new Image();
            img.src = imgData;

            img.onload = function () {
              // Calculate dimensions to fit in PDF
              const imgWidth = doc.internal.pageSize.getWidth() - 40;
              const imgHeight = (img.height * imgWidth) / img.width;

              doc.addImage(imgData, "JPEG", 20, 30, imgWidth, imgHeight);
              doc.save(`${documentType}_${fileName}.pdf`);
              setIsLoading(false);
            };
          } else {
            // For other file types, just add info about the file
            doc.setFontSize(12);
            doc.text(`This is a ${blob.type} file.`, 20, 30);
            doc.text(`Original filename: ${fileName}`, 20, 40);
            doc.save(`${documentType}_${fileName}.pdf`);
            setIsLoading(false);
          }
        };
      }
    } catch (error) {
      console.error("Error downloading document:", error);
      alert(`Error downloading document: ${error.message}`);
      setIsLoading(false);
    }
  };

  // Function to download selected user details
  const downloadSelectedEmails = () => {
    const selectedUserData = users.filter((user) => selectedUsers.has(user.id));

    if (selectedUserData.length === 0) {
      alert("No selected users to download.");
      return;
    }

    // Create a copy of selected users data with properly formatted fields for Excel
    const excelData = selectedUserData.map((user) => ({
      ID: user.id,
      Firstname: user.name,
      Age: user.age,
      DOB: user.dob,
      Gender: user.gender,
      Email: user.email,
      Address: user.address,
      Qualification: user.qualification,
      Category: user.category,
      Contact: user.contact,
      Caste: user.caste,
      Aadhar:
        user.aadhar !== "N/A" ? extractFilenameFromURL(user.aadhar) : "N/A",
      Marksheet:
        user.marksheet !== "N/A"
          ? extractFilenameFromURL(user.marksheet)
          : "N/A",
      "Caste Certificate":
        user.casteCertificate !== "N/A"
          ? extractFilenameFromURL(user.casteCertificate)
          : "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SelectedUsers");

    XLSX.writeFile(workbook, "SelectedUsersData.xlsx");
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        alert("Logged out successfully!");
        navigate("/"); // Redirect user to login page after logout
      })
      .catch((error) => {
        console.error("Logout Error:", error);
        alert("Logout failed. Please try again.");
      });
  };

  // Helper function to check if a column should be displayed
  const shouldShowColumn = (columnName) => {
    return visibleColumns.includes(columnName);
  };

  // Get cell value for a specific column
  const getCellValue = (user, column) => {
    switch (column) {
      case "ID":
        return user.id;
      case "First Name":
        return user.name;
      case "Age":
        return user.age;
      case "DOB":
        return user.dob;
      case "Gender":
        return user.gender;
      case "Email":
        return user.email;
      case "Address":
        return user.address;
      case "Qualification":
        return user.qualification;
      case "Category":
        return user.category;
      case "Contact":
        return user.contact;
      case "Caste":
        return user.caste;
      case "Aadhar":
        return user.aadhar !== "N/A" ? (
          <div className="flex flex-col space-y-1">
            <a
              href={user.aadhar}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-xs"
            >
              View
            </a>
            <button
              onClick={() =>
                downloadDocumentAsPDF(
                  user.aadhar,
                  `Aadhar_${user.id}_${user.name.replace(/\s+/g, "_")}`,
                  "Aadhar"
                )
              }
              className="bg-blue-500 text-white px-1 py-0.3 rounded text-xs hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? "..." : "PDF"}
            </button>
          </div>
        ) : (
          "N/A"
        );
      case "Marksheet":
        return user.marksheet !== "N/A" ? (
          <div className="flex flex-col space-y-1">
            <a
              href={user.marksheet}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-xs"
            >
              View
            </a>
            <button
              onClick={() =>
                downloadDocumentAsPDF(
                  user.marksheet,
                  `Marksheet_${user.id}_${user.name.replace(/\s+/g, "_")}`,
                  "Marksheet"
                )
              }
              className="bg-blue-500 text-white px-1 py-0.5 rounded text-xs hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? "..." : "PDF"}
            </button>
          </div>
        ) : (
          "N/A"
        );
      case "Caste Certificate":
        return user.casteCertificate !== "N/A" ? (
          <div className="flex flex-col space-y-1">
            <a
              href={user.casteCertificate}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-xs"
            >
              View
            </a>
            <button
              onClick={() =>
                downloadDocumentAsPDF(
                  user.casteCertificate,
                  `CasteCert_${user.id}_${user.name.replace(/\s+/g, "_")}`,
                  "Caste Certificate"
                )
              }
              className="bg-blue-500 text-white px-1 py-0.5 rounded text-xs hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? "..." : "PDF"}
            </button>
          </div>
        ) : (
          "N/A"
        );
      case "Action":
        return (
          <button
            onClick={() => toggleSelect(user.id)}
            className={`${
              selectedUsers.has(user.id) ? "bg-red-500" : "bg-blue-500"
            } text-white px-1 py-1 rounded text-xs hover:opacity-80 w-full`}
          >
            {selectedUsers.has(user.id) ? "Deselect" : "Select"}
          </button>
        );
      case "Download":
        return (
          <button
            onClick={() => downloadSingleUserDataPDF(user)}
            className="bg-green-500 text-white px-1 py-1 rounded text-xs hover:bg-green-600 w-full"
          >
            DL
          </button>
        );
      default:
        return "N/A";
    }
  };

  // Calculate the total number of column sets based on screen width
  const getTotalColumnSets = () => {
    const width = window.innerWidth;
    if (width >= 768) return 1;
    if (width >= 425) return columnSets.md.length;
    if (width >= 375) return columnSets.sm.length;
    return columnSets.xs.length;
  };

  return (
    <div className="min-h-screen2     flex flex-col">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-lg">
            <p className="text-lg">Downloading document...</p>
          </div>
        </div>
      )}

      <header className="bg-white shadow px-3 sm:px-4 py-3 sm:py-4 sticky top-0 z-10">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
          <div className="flex flex-col sm:flex-row items-center mb-3 sm:mb-0 w-full">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 text-center sm:text-left">
              Admin Dashboard: Registrations Data
            </h1>
            {/* Moved buttons to the left side */}
            <div className="flex gap-2 mt-3 sm:mt-0 sm:ml-4">
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 text-sm sm:text-base rounded-full transition"
              >
                Logout
              </button>
              <button
                onClick={downloadExcel}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 text-sm sm:text-base rounded-full transition"
              >
                Download Excel
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto mt-4 sm:mt-6 px-3 sm:px-4 sticky top-16 z-10 bg-gray-50">
        <div className="bg-white border border-green-200 rounded-lg p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
            <div className="flex flex-col w-full sm:w-auto sm:flex-1">
              <label className="font-medium text-gray-700 text-sm sm:text-base mb-1">
                Start ID:
              </label>
              <input
                type="text"
                placeholder="Enter start ID"
                className="border border-gray-300 rounded p-2 w-full text-sm"
                value={startID}
                onChange={(e) => setStartID(e.target.value)}
              />
            </div>
            <div className="flex flex-col w-full sm:w-auto sm:flex-1">
              <label className="font-medium text-gray-700 text-sm sm:text-base mb-1">
                End ID:
              </label>
              <input
                type="text"
                placeholder="Enter end ID"
                className="border border-gray-300 rounded p-2 w-full text-sm"
                value={endID}
                onChange={(e) => setEndID(e.target.value)}
              />
            </div>
            <div className="flex items-end w-full sm:w-auto mt-1 sm:mt-0">
              <button
                onClick={downloadSelectedEmails}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium transition w-full text-sm sm:text-base"
              >
                Download Selected Users
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto mt-4 sm:mt-6 px-3 sm:px-4 pb-8 flex-grow">
        {/* Table carousel indicator (only for small screens) */}
        {window.innerWidth < 768 && (
          <div className="flex justify-center items-center mb-3 sticky top-40 z-10 bg-gray-50">
            <div className="flex space-x-2">
              {Array.from({ length: getTotalColumnSets() }).map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full ${
                    currentColumnSet === index ? "bg-blue-500" : "bg-gray-300"
                  }`}
                  onClick={() => {
                    if (!isTransitioning) {
                      const direction =
                        index > currentColumnSet ? "next" : "prev";
                      animateCarousel(direction, index);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden flex flex-col h-96">
          <div
            ref={carouselRef}
            className="overflow-x-auto flex-grow overflow-y-auto"
            style={{
              transition: "transform 0.3s ease-in-out",
              transform: "translateX(0)",
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <table className="min-w-full border-collapse border border-gray-300">
              <thead className="bg-gray-200 sticky top-0 z-10">
                <tr>
                  {allColumns.map(
                    (header) =>
                      shouldShowColumn(header) && (
                        <th
                          key={header}
                          className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700"
                        >
                          {header}
                        </th>
                      )
                  )}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.firebaseId}
                    className={`${
                      selectedUsers.has(user.id) ? "bg-blue-100" : ""
                    }`}
                  >
                    {allColumns.map(
                      (column) =>
                        shouldShowColumn(column) && (
                          <td
                            key={`${user.id}-${column}`}
                            className="border border-gray-300 px-2 py-2 text-xs"
                          >
                            {getCellValue(user, column)}
                          </td>
                        )
                    )}
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan={visibleColumns.length}
                      className="text-center py-4 text-gray-500"
                    >
                      No user data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile swipe instructions */}
        {window.innerWidth < 768 && (
          <div className="text-center text-xs text-gray-500 mt-3">
            Swipe left or right to see additional table columns
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
