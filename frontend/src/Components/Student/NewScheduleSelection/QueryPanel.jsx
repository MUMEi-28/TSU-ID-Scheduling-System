import React from 'react'

const QueryPanel = ({ handleBack }) =>
{
  return (
    <div className='h-fit sm:h-screen w-full sm:w-fit flex sm:flex-col justify-between bg-gradient-to-bl from-[#641500] from-100% to-[#CA2A00] to-0% py-7 sm:py-10 px-1 lg:px-3 xl:px-10 xl:pl-13  league-font sm:text-right text-left relative'>
    
      <div className=''>
      <h1 className='text-4xl sm:text-5xl font-bold text-white m-0'>2025</h1>
      <h1 className='text-xl sm:text-3xl font-bold text-white m-0'>Calendar</h1>
      <h1 className='text-md sm:text-xl font-sans  text-white m-0'>TSU ID</h1>
      <h1 className='text-md sm:text-xl font-sans  text-white m-0'>Scheduling</h1>
      <h1 className='text-md sm:text-xl font-sans  text-white m-0'>System</h1>
      </div>

      {handleBack && (
        <div className="flex flex-col sm:flex-col-reverse items-end right-0 bottom-0 z-30 w-fit h-full sm:h-full justify-between absolute sm:relative p-0">
          <button
            onClick={handleBack}
            className='bg-[#CE9D31] hover:bg-[#b88a1a] text-white font-bold py-2 px-4 rounded-xl shadow-lg mt-6 sm:mt-0 mr-3 sm:mr-0'
          >
            Back to Home
          </button>
          <button
            onClick={() => alert("this is date sched bro, its where dates are sched")}
            className='text-gray-300 text-2xl l font-bold bg-[#9D2100] mt-3 mb-3 mr-3 sm:mr-0  w-fit px-4  pt-2  pb-1 flex justify-center items-center text-center rounded-lg transition-all duration-300 hover:bg-[#ab2200] hover:text-yellow-400'
          >
            <h1>?</h1>
          </button>
        </div>
      )}
      {/* Labels */}

    </div>
  )
}

export default QueryPanel
