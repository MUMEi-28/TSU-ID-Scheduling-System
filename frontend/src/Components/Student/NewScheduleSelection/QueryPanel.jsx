import React, { useState } from 'react'

const QueryPanel = ({ handleBack, mobile }) =>
{
  const [showContact, setShowContact] = useState(false);
  return (
    <div className={
      mobile
        ? 'w-full flex flex-row items-start bg-gradient-to-bl from-[#641500] from-100% to-[#CA2A00] to-0% py-7 px-1 lg:px-3 xl:px-10 xl:pl-13 league-font'
        : 'h-full min-h-screen w-full sm:w-fit flex flex-col justify-between bg-gradient-to-bl from-[#641500] from-100% to-[#CA2A00] to-0% py-7 sm:py-10 px-1 lg:px-3 xl:px-10 xl:pl-13 league-font sm:text-right text-left'
    }>
      {/* Labels (left on mobile, top on desktop) */}
      <div className={mobile ? 'flex-1 text-left' : ''}>
        <h1 className='text-4xl sm:text-5xl font-bold text-white m-0'>2025</h1>
        <h1 className='text-xl sm:text-3xl font-bold text-white m-0'>Calendar</h1>
        <h1 className='text-md sm:text-xl font-sans text-white m-0'>TSU ID</h1>
        <h1 className='text-md sm:text-xl font-sans text-white m-0'>Scheduling</h1>
        <h1 className='text-md sm:text-xl font-sans text-white m-0'>System</h1>
      </div>
      {/* Buttons (right on mobile, bottom on desktop) */}
      {handleBack && (
        <div className={mobile ? 'flex flex-col items-end gap-2 ml-4' : 'flex flex-col items-end gap-2 mt-8 mb-2'}>
          <button
            onClick={handleBack}
            className='bg-[#E1A500] hover:bg-[#C68C10] text-white font-bold py-1 px-3 rounded-lg shadow border-2 border-[#C68C10] transition-all duration-200 text-base'
          >
            Back to Home
          </button>
          <button
            onClick={() => setShowContact(true)}
            className='text-gray-300 text-2xl font-bold bg-[#9D2100] mt-3 mb-3 w-fit px-4 pt-2 pb-1 flex justify-center items-center text-center rounded-lg transition-all duration-300 hover:bg-[#ab2200] hover:text-yellow-400'
          >
            <span>?</span>
          </button>
        </div>
      )}
      {/* Labels */}
      {showContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.15)' }}>
          <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-2xl w-full flex flex-col items-center relative scale-105">
            <button
              onClick={() => setShowContact(false)}
              className="absolute top-4 right-4 text-5xl text-gray-500 hover:text-red-600 font-extrabold transition-all duration-200"
              aria-label="Close"
              style={{ lineHeight: '1', width: '2.5rem', height: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              &times;
            </button>
            <h2 className="text-3xl font-extrabold mb-4 text-center">Need Help? Report a Bug?</h2>
            <p className="mb-6 text-lg text-center">For issues, suggestions, or feedback, contact us at:<br/><span className="font-mono text-blue-700 text-xl">reporthere@student.tsu.edu.ph</span></p>
            <div className="w-full flex justify-center mb-4">
              <iframe
                width="480"
                height="270"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <p className="text-base text-gray-400 mt-2">(You just got rickrolled!)</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default QueryPanel
