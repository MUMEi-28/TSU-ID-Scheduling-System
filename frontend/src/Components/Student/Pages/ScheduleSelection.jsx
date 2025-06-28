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
    <div className="flex flex-col min-h-screen w-full bg-[#E7E7E7] overflow-x-hidden">
      {/* QueryPanel: top on small screens */}
      <div className="block lg:hidden w-full">
        <QueryPanel handleBack={handleBack} mobile />
            </div>
      {/* Main area: row on desktop, col on mobile */}
      <div className="flex-1 flex flex-col lg:flex-row w-full">
        {/* Main content: center pickers, take all space except sidebar */}
        <div className="flex flex-col flex-1 items-center p-4 sm:p-6 w-full gap-8 lg:gap-8 lg:justify-center">
          <div className="w-full max-w-xl flex justify-center">
            <DatePicker
              selectedDate={props.selectedDate}
              setSelectedDate={props.setSelectedDate}
              setRegistrationInputs={props.setRegistrationInputs}
              registrationInputs={props.registrationInputs}
            />
          </div>
          <div className="w-full max-w-xl flex justify-center">
            <TimePicker
              setSelectedTime={props.setSelectedTime}
              selectedTime={props.selectedTime}
              selectedDate={props.selectedDate}
              handlingDataObjectsTest={props.handlingDataObjectsTest}
              setRegistrationInputs={props.setRegistrationInputs}
            />
          </div>
        </div>
        {/* QueryPanel: fixed width, flush right on desktop */}
        <div className="hidden lg:flex flex-col w-80 xl:w-[340px] 2xl:w-[400px] justify-start relative h-full" style={{marginRight: 0, paddingRight: 0}}>
          <QueryPanel handleBack={handleBack} />
        </div>
      </div>
    </div>
  )
}