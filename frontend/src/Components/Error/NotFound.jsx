import React from 'react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-6xl font-bold text-red-700 mb-4">404</h1>
      <h2 className="text-3xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-lg text-gray-600 mb-6">Sorry, the page you are looking for does not exist or you do not have access.</p>
      <a href="/" className="text-blue-500 underline">Go Home</a>
    </div>
  );
}
