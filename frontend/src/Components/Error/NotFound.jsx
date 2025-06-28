import React from 'react';
import studentsBg from '../public/students-with-unif-tb.png';

export default function NotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen relative w-screen bg-cover  "
      style={{
        backgroundImage: `url(${studentsBg})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black opacity-60 pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center text-center m-4 sm:m-0">
        <h1 className="text-6xl font-bold text-red-700 mb-4">404</h1>
        <h2 className="text-3xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-lg text-white mb-6">Sorry, the page you are looking for does not exist or you do not have access.</p>
        <a href="/" className="text-blue-500 underline">Go Home</a>
      </div>
    </div>
  );
}
