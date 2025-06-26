import React from 'react'
import QueryPanel from '../NewScheduleSelection/QueryPanel'
import DatePicker from '../NewScheduleSelection/DatePicker'
import TimePicker from '../NewScheduleSelection/TimePicker'
import { useNavigate } from 'react-router-dom'

export default function ScheduleSelection(props) {
  const navigate = useNavigate()
  const handleBack = () => {
    if (window.confirm('Are you sure you want to go back to the home page?')) {
      if (props.handleLogout) {
        props.handleLogout();
      } else {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('registrationInputs');
        localStorage.removeItem('selectedTime');
        localStorage.removeItem('selectedDate');
        navigate('/');
      }
    }
  }
  return (
    <div className='flex flex-col sm:flex-row-reverse justify-center items-center bg-[#E7E7E7]'>
      <div className='flex w-full sm:w-fit xl:w-2/12 justify-end relative'>
        <QueryPanel handleBack={handleBack} />
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