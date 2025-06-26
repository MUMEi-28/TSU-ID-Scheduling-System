import React from 'react'

const QueryPanel = ({ handleBack }) =>
{
  return (
    <div className='h-fit sm:h-screen w-full sm:w-fit bg-gradient-to-bl from-[#641500] from-100% to-[#CA2A00] to-0% py-7 sm:py-10 px-1 lg:px-3 xl:px-15 league-font sm:text-right text-left relative'>
    
      {handleBack && (
        <div className="block sm:hidden w-full flex flex-col items-end gap-1 mt-8">
          <button
            onClick={() => alert("this is date sched bro, its where dates are sched")}
            className='text-gray-300 text-2xl font-bold bg-[#9D2100] w-fit px-4 pt-2 pb-1 flex justify-center items-center text-center rounded-lg transition-all duration-300 hover:bg-[#ab2200] hover:text-yellow-400'
          >
            <h1>?</h1>
          </button>
          <button
            onClick={handleBack}
            className='bg-[#CE9D31] hover:bg-[#b88a1a] text-white font-bold py-2 px-4 rounded-xl shadow-lg'
          >
            Back to Home
          </button>
        </div>
      )}
      
      {handleBack && (
        <div className="hidden sm:flex flex-col items-end absolute right-0 bottom-0 m-5 lg:m-4 z-30 gap-2">
          <button
            onClick={handleBack}
            className='bg-[#CE9D31] hover:bg-[#b88a1a] text-white font-bold py-2 px-4 rounded-xl shadow-lg'
          >
            Back to Home
          </button>
          <button
            onClick={() => alert("this is date sched bro, its where dates are sched")}
            className='text-gray-300 text-2xl sm:text-4xl font-bold bg-[#9D2100] w-fit px-4 sm:px-5 pt-2 sm:pt-4 pb-1 sm:pb-1 flex justify-center items-center text-center rounded-lg transition-all duration-300 hover:bg-[#ab2200] hover:text-yellow-400'
          >
            <h1>?</h1>
          </button>
        </div>
      )}
      {/* Labels */}
      <h1 className='text-4xl sm:text-5xl font-bold text-white m-0'>2025</h1>
      <h1 className='text-xl sm:text-3xl font-bold text-white m-0'>Calendar</h1>
      <h1 className='text-md sm:text-xl font-sans  text-white m-0'>TSU ID</h1>
      <h1 className='text-md sm:text-xl font-sans  text-white m-0'>Scheduling</h1>
      <h1 className='text-md sm:text-xl font-sans  text-white m-0'>System</h1>
    </div>
  )
}

export default QueryPanel
