// MarqueeComponent.js
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set } from 'firebase/database';

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
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const MarqueeComponent = () => {
  const [marqueeText, setMarqueeText] = useState('');
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    const fetchMarqueeText = async () => {
      try {
        const marqueeRef = ref(database, 'marquee/text');
        const snapshot = await get(marqueeRef);

        if (snapshot.exists()) {
          setMarqueeText(snapshot.val().message);
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching marquee text:', error);
      }
    };

    fetchMarqueeText();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const marqueeRef = ref(database, 'marquee/text');
      await set(marqueeRef, { message: inputText });
      setMarqueeText(inputText);
      setInputText('');
    } catch (error) {
      console.error('Error saving marquee text:', error);
    }
  };

  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-4">Marquee Component</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <input 
          type="text" 
          value={inputText} 
          onChange={(e) => setInputText(e.target.value)} 
          placeholder="Enter marquee text" 
          className="border p-2 w-full"
        />
        <button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-2 mt-2"
        >
          Save
        </button>
      </form>
      {marqueeText && (
        <div className="border p-4 bg-gray-100">
          <marquee scrollamount="8" className="bg-black text-white py-2 px-4">
            {marqueeText}
          </marquee>
        </div>
      )}
    </div>
  );
};

export default MarqueeComponent;