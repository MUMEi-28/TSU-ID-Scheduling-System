import React from 'react'
import DatePicker from '../NewScheduleSelection/DatePicker'
import QueryPanel from '../NewScheduleSelection/QueryPanel'
import TimePicker from '../NewScheduleSelection/TimePicker'


const NewScheduleSelection = () =>
{
  return (
    <div className='flex flex-col sm:flex-row-reverse justify-center items-center bg-[#E7E7E7]'>

      <div className='flex w-full sm:w-fit xl:w-2/12 justify-end'>
        <QueryPanel />
      </div>

      <div className='flex flex-col justify-center items-center w-full sm:w-10/12 h-fit mt-4 sm:mt-0 sm:h-screen gap-y-3 xl:gap-y-15 '>
        <DatePicker />
        <TimePicker />
      </div>



    </div>
  )
}

export default NewScheduleSelection
