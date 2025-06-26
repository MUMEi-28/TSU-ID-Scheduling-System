import React from 'react'
import DatePicker from '../NewScheduleSelection/DatePicker'
import QueryPanel from '../NewScheduleSelection/QueryPanel'
import TimePicker from '../NewScheduleSelection/TimePicker'


const NewScheduleSelection = (props) =>
{
  return (
    <div className='flex flex-col sm:flex-row-reverse justify-center items-center bg-[#E7E7E7]'>

      <div className='flex w-full sm:w-fit xl:w-2/12 justify-end'>
        <QueryPanel />
      </div>

      <div className='flex flex-col justify-evenly  items-center w-full sm:w-10/12 h-screen '>
        <DatePicker
          selectedDate={props.selectedDate}
          setSelectedDate={props.setSelectedDate}

          setRegistrationInputs={props.setRegistrationInputs}
          registrationInputs={props.registrationInputs}
        />
        <TimePicker
          setSelectedTime={props.setSelectedTime}
          selectedTime={props.selectedTime}

          selectedDate={props.selectedDate}

          handlingDataObjectsTest={props.handlingDataObjectsTest}
          setRegistrationInputs={props.setRegistrationInputs}
        />

      </div>



    </div>
  )
}

export default NewScheduleSelection
