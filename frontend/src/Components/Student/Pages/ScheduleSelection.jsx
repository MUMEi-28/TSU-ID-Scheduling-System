import React from 'react'
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
    <div className='flex flex-col bg-[#E7E7E7] min-h-screen'>
      {/* Header */}
      <header className='w-full bg-gradient-to-bl from-[#641500] from-100% to-[#CA2A00] to-0% py-4 px-6 shadow-lg relative z-40'>
        <div className='flex justify-between items-center'>
          {/* Logo/Title */}
          <div className='flex items-center space-x-4'>
            <div className='text-white league-font'>
              <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold m-0'>2025</h1>
              <h2 className='text-sm sm:text-lg md:text-xl font-bold m-0'>Calendar</h2>
              <h3 className='text-xs sm:text-sm md:text-base font-sans m-0'>TSU ID</h3>
              <h4 className='text-xs sm:text-sm md:text-base font-sans m-0'>Scheduling</h4>
              <h5 className='text-xs sm:text-sm md:text-base font-sans m-0'>System</h5>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className='hidden sm:flex items-center space-x-4'>
            <button
              onClick={handleBack}
              className='bg-[#E1A500] hover:bg-[#C68C10] text-white font-bold py-2 px-4 rounded-xl shadow-lg border-2 border-[#C68C10] transition-all duration-200'
            >
              Back to Home
            </button>
          </div>

          {/* Mobile Hamburger Menu */}
          <div className='sm:hidden'>
            <button
              onClick={() => handleBack()}
              className='text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-200'
              aria-label="Back to Home"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className='flex-1 flex flex-col justify-center items-center p-4 sm:p-6'>
        <div className='w-full max-w-6xl flex flex-col lg:flex-row gap-8'>
          {/* Date Picker Section */}
          <div className='flex-1 flex justify-center'>
            <DatePicker
              selectedDate={props.selectedDate}
              setSelectedDate={props.setSelectedDate}
              setRegistrationInputs={props.setRegistrationInputs}
              registrationInputs={props.registrationInputs}
            />
          </div>
          
          {/* Time Picker Section */}
          <div className='flex-1 flex justify-center'>
            <TimePicker
              setSelectedTime={props.setSelectedTime}
              selectedTime={props.selectedTime}
              selectedDate={props.selectedDate}
              handlingDataObjectsTest={props.handlingDataObjectsTest}
              setRegistrationInputs={props.setRegistrationInputs}
            />
          </div>
        </div>
      </div>
    </div>
  )
}