import React from "react";

export default function SensorSpoofingCard() {
  return (
    <div className="w-full h-72 p-8 rounded-2xl shadow-xl 
                    bg-gradient-to-r from-indigo-200 via-indigo-300 to-indigo-400 
                    flex flex-col items-center justify-center 
                    transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
      <h2 className="text-3xl font-extrabold text-indigo-900 mb-4 tracking-wide">
        Sensor spoofing
      </h2>
      <p className="text-lg text-indigo-800 italic">released soon...</p>
      <div className="mt-6 w-16 h-1 bg-indigo-600 rounded-full"></div>
    </div>
  );
}

  
