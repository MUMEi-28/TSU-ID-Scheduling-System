import React from 'react'

const ScheduleReceipt = () => {
  return (
    <div className='flex flex-col p-10 min-w-screen min-h-screen  justify-center items-center'>
      
      <h1 className='text-center text-5xl'>Your Slot has been Confirmed!</h1>

      <div className='flex-col justify-center items-center border-6 rounded-4xl p-16 m-10 text-center w-fit text-4xl bg-gray-300'>
        <h1 className='mb-3'><u> Date and time: </u></h1>
        <h1 className='mb-6'>{/* date and time */}Jan 1, 2025, 10am-12</h1>
        <h1 className='mb-3'><u> Your Details: </u></h1>
        <h1 className='mb-3'>{/* Student Number */} Student Number</h1>
        <h1>{/* Student Name */} Student Name</h1>
        <br />
        <hr />
        <br />
 
        <button id='downloadBtn' className='border-2 px-5 rounded-lg p-1 transition duration-300 ease-in-out hover:bg-gray-100'>Print</button>

      </div>

    </div>
  )
}

export default ScheduleReceipt
