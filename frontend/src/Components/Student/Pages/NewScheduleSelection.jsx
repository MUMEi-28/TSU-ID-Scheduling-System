import React from 'react'
import DatePicker from '../NewScheduleSelection/DatePicker'
import QueryPanel from '../NewScheduleSelection/QueryPanel'
import TimePicker from '../NewScheduleSelection/TimePicker'


const NewScheduleSelection = () => {
  return (
    <div className='flex flex-col sm:flex-row-reverse justify-center items-center bg-[#E7E7E7]'>

         <div className='flex w-full sm:w-2/12 justify-end'>
        <QueryPanel/>
        </div>

        <div className='flex flex-col justify-evenly items-center w-full sm:w-10/12 h-screen    '>
            <DatePicker />
            <TimePicker/>
        </div>



    </div>
  )
}

export default NewScheduleSelection
