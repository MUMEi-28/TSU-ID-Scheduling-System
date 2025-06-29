import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { buildApiUrl, API_ENDPOINTS } from '../../../config/api';
import { canonicalToDisplay, normalizeDate } from '../../../utils/timeUtils';

const AnimatedOverlay = ({ type, show, appointment, onClose }) => {
  // type: 'success' | 'existing'
  // appointment: object with schedule info
  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-60 transition-opacity duration-500 ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="bg-white rounded-2xl p-8 flex flex-col items-center shadow-2xl min-w-[300px] min-h-[220px] relative">
        {/* Icon Animation */}
        <div className={`transition-all duration-700 ${show ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: '0ms' }}>
          {type === 'success' ? (
            <svg className="w-20 h-20 mb-4" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="30" fill="#22c55e"/>
              <path d="M20 34l8 8 16-16" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg className="w-20 h-20 mb-4" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="30" fill="#ef4444"/>
              <path d="M24 24l16 16M40 24L24 40" stroke="#fff" strokeWidth="5" strokeLinecap="round"/>
            </svg>
          )}
        </div>
        {/* Text Animation */}
        <div className={`transition-all duration-700 text-center ${show ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: '300ms' }}>
          {type === 'success' ? (
            <>
              <h2 className="text-2xl font-bold text-green-700 mb-2">Slot Confirmed!</h2>
              <p className="text-lg text-gray-700 mb-2">Your slot has been successfully confirmed.</p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-red-700 mb-2">Existing Appointment</h2>
              <p className="text-lg text-gray-700 mb-4">You already have an existing appointment and cannot book another slot.</p>
              {appointment && (
                <div className="bg-gray-100 rounded-xl p-4 mb-4 text-center">
                  <h3 className="font-semibold text-gray-800 mb-2">Your Appointment Details:</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Date:</span> {appointment.schedule_date}</p>
                    <p><span className="font-medium">Time:</span> {appointment.schedule_time}</p>
                    <p><span className="font-medium">Student Number:</span> {appointment.student_number}</p>
                    <p><span className="font-medium">Name:</span> {appointment.fullname}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        {type === 'existing' && (
          <button onClick={onClose} className="mt-2 bg-[#E1A500] hover:bg-[#C68C10] text-white font-bold py-2 px-6 rounded-xl shadow-lg border-2 border-[#C68C10] transition-all duration-200">Close</button>
        )}
      </div>
    </div>
  );
};

const ScheduleReceipt = (props) =>
{
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [isViewingExisting, setIsViewingExisting] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [showExistingModal, setShowExistingModal] = useState(false);

  useEffect(() => {
    // Check if we're viewing existing student data
    const viewingData = localStorage.getItem('viewing_student_data');
    const existingUserToken = localStorage.getItem('existing_user_token');
    
    if (viewingData) {
        setStudentData(JSON.parse(viewingData));
        setIsViewingExisting(true);
    }
    
    // Handle existing user token
    if (existingUserToken) {
        setIsViewingExisting(true);
    }
  }, []);

  const handleBack = () => {
    if (confirmed || isViewingExisting) {
        localStorage.removeItem('confirmedSlot');
        localStorage.removeItem('viewing_student_data');
        localStorage.removeItem('viewing_student_id');
        localStorage.removeItem('done_view_token');
        localStorage.removeItem('pending_view_token');
        localStorage.removeItem('existing_user_token');
        if (props.handleLogout) {
            props.handleLogout();
        } else {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('registrationInputs');
            localStorage.removeItem('selectedTime');
            localStorage.removeItem('selectedDate');
            navigate('/');
        }
    } else {
        navigate('/schedule');
    }
  };

  const handleConfirm = async () => {
    try {
      let id = displayData.id;
      if (!id) {
        const storedId = localStorage.getItem('student_id');
        id = storedId ? parseInt(storedId, 10) : undefined;
      }
      const payload = {
        id,
        fullname: displayData.fullname,
        student_number: displayData.student_number,
        schedule_date: normalizeDate(displayData.schedule_date),
        schedule_time: displayData.schedule_time,
        email: displayData.email,
        id_reason: displayData.id_reason,
        data_privacy_agreed: displayData.data_privacy_agreed,
        status: 'pending',
      };
      console.log('Payload sent to confirm_slot:', payload);
      const response = await axios.put(buildApiUrl(API_ENDPOINTS.CONFIRM_SLOT), JSON.stringify(payload), {
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.data.status === 1) {
        setConfirmed(true);
        localStorage.setItem('confirmedSlot', 'true');
        localStorage.setItem('student_id', id);
        setShowSuccessOverlay(true);
        setTimeout(() => setShowSuccessOverlay(false), 2000);
        
        // Invalidate slot cache to ensure other users see updated counts
        const cacheKey = `slot_data_${displayData.schedule_date}`;
        localStorage.removeItem(cacheKey);
        console.log('Invalidated slot cache for date:', displayData.schedule_date);
      } else if (response.data.message && response.data.message.toLowerCase().includes('existing appointment')) {
        setShowExistingModal(true);
      } else {
        alert(response.data.message || 'Failed to confirm slot');
      }
    } catch (err) {
      alert('Error confirming slot: ' + (err.response?.data?.message || err.message));
    }
  };

  // Remove confirmedSlot flag when leaving the page or logging out
  useEffect(() => {
    return () => {
      localStorage.removeItem('confirmedSlot');
    };
  }, []);

  // Use studentData if available, otherwise use props.registrationInputs
  const displayData = studentData || props.registrationInputs;

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-[url('Components\\public\\students-with-unif-tb.png')] bg-cover bg-center px-4 py-8">
      {/* Animated Overlays */}
      <AnimatedOverlay type="success" show={showSuccessOverlay} />
      <AnimatedOverlay type="existing" show={showExistingModal} appointment={displayData} onClose={() => { setShowExistingModal(false); navigate('/'); }} />
      <div className="absolute inset-0 bg-black opacity-70 z-0"></div>
      <div className="relative flex flex-col items-center justify-center gap-4 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg z-10">
        {(confirmed && !isViewingExisting) && (
          <div className="w-12 sm:w-14 md:w-16 lg:w-18">
            <svg className="w-full h-auto" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="30" fill="#22c55e"/>
              <path d="M20 34l8 8 16-16" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
        <div className="poppins-font text-[#ECECEC] text-center font-medium text-lg sm:text-xl md:text-2xl lg:text-3xl px-4">
          {isViewingExisting ? 'Your Appointment Information' : 
           confirmed ? 'Your slot has been confirmed!' : 'Please confirm your slot to continue.'}
        </div>
        <div className="poppins-font bg-gray-200 text-center rounded-3xl shadow-xl w-full max-w-sm sm:max-w-md md:max-w-lg pb-6 text-sm sm:text-base md:text-lg flex flex-col items-center justify-center overflow-hidden">
          {/* Red bar flush with card */}
          <div className="w-full h-6 bg-[#5C0101] text-[#ECECEC] flex items-center justify-center rounded-t-3xl text-sm sm:text-base font-semibold p-0 m-0" style={{marginBottom: 0}}></div>
          <div className="h-4" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl tracking-tighter font-semibold underline text-[#5B0000]">Slot Information</h1>
          <div className="h-3" />
          <h2 className="mt-2 mb-2 font-medium underline text-[#656565] text-sm sm:text-base">Date and Time:</h2>
          <h3 className="mb-4 font-light text-[#656565] text-sm sm:text-base">
            {displayData.schedule_date},<br></br>
            {canonicalToDisplay(displayData.schedule_time)}
          </h3>
          <h2 className="mb-2 font-medium underline text-[#656565] text-sm sm:text-base">Your Details:</h2>
          <h3 className="mb-2 font-light text-[#656565] text-sm sm:text-base">Student Number: {displayData.student_number} </h3>
          <h3 className="mb-6 font-light text-[#656565] text-sm sm:text-base">Student Name: {displayData.fullname}</h3>
          <div className="flex w-full justify-center gap-2 mb-2">
            <button
              onClick={handleBack}
              className="bg-[#E1A500] hover:bg-[#C68C10] text-white font-bold py-2 px-3 sm:px-4 rounded-lg shadow-lg border-2 border-[#C68C10] transition-all duration-200 text-xs sm:text-sm"
            >
              {confirmed || isViewingExisting ? 'Back to Home' : 'Back'}
            </button>
            {!confirmed && !isViewingExisting && (
              <button
                id="downloadBtn"
                className="px-4 sm:px-6 rounded-lg bg-[#E1A500] hover:bg-[#C68C10] self-center py-2 sm:py-3 text-xs sm:text-sm md:text-base istok-font text-white font-bold rounded-lg shadow-lg border-2 border-[#C68C10] transition-all duration-200"
                onClick={handleConfirm}
              >
                Confirm
              </button>
            )}
          </div>
        </div>
        <h1 className="text-center italic poppins-font font-extralight text-[#D9D9D9] text-xs sm:text-sm md:text-base px-4">
          {isViewingExisting ? 'Note: This is your current appointment information.' : 
           'Note: Please take a screenshot of the receipt and close the website as soon as you finished your slot confirmation.'}
        </h1>
      </div >
    </div >
  );
};

export default ScheduleReceipt;
