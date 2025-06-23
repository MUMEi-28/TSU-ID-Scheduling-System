import React from 'react'

const QueryPanel = () => {
  return (
    <div className='h-fit sm:h-screen w-full sm:w-fit bg-gradient-to-bl from-[#641500] from-100% to-[#CA2A00] to-0% p-7 sm:p-10 sm:px-15 league-font sm:text-right text-left relative'>
      <h1 className='text-4xl sm:text-5xl font-bold text-white m-0'>2025</h1>
      <h1 className='text-xl sm:text-3xl font-bold text-white m-0'>Calendar</h1>   
      <h1 className='text-md sm:text-xl font-sans  text-white m-0'>TSU ID</h1>
      <h1 className='text-md sm:text-xl font-sans  text-white m-0'>Scheduling</h1>
      <h1 className='text-md sm:text-xl font-sans  text-white m-0'>System</h1>

        <button onClick={() => alert("this is date sched bro, its where dates are sched")} className='text-gray-300 text-2xl sm:text-4xl font-bold bg-[#9D2100] 
        w-fit px-4 sm:px-5 pt-2 sm:pt-4 pb-1 sm:pb-1 flex justify-center 
        items-center text-center rounded-lg 
        transition-all duration-300 hover:bg-[#ab2200] hover:text-yellow-400 
        absolute top-0 sm:top-auto sm:bottom-0 m-5 sm:m-10 right-0'>
            <h1>?</h1>
        </button>

    </div>
  )
}

export default QueryPanel
