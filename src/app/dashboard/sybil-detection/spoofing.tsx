import React from "react";

export default function SpoofingCard() {
  return (
    <div className="w-full h-72 p-8 rounded-2xl shadow-xl 
                    bg-gradient-to-r from-gray-200 via-gray-300 to-gray-400 
                    flex flex-col items-center justify-center 
                    transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-4 tracking-wide">
        Gps spoofing
      </h2>
      <p className="text-lg text-gray-700 italic">released soon...</p>
      <div className="mt-6 w-16 h-1 bg-gray-600 rounded-full"></div>
    </div>
  );
}




