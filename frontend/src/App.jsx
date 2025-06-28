import RegistrationForm from "./Components/Student/Pages/RegistrationForm";
import ScheduleReceipt from "./Components/Student/Pages/ScheduleReceipt";
import ScheduleSelection from "./Components/Student/Pages/ScheduleSelection";
import AdminPage from "./Components/Admin/AdminPage";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import QueryPanel from "./Components/Student/NewScheduleSelection/QueryPanel";
import TimePicker from "./Components/Student/NewScheduleSelection/TimePicker";
import NotFound from "./Components/Error/NotFound";
import kuruKuru from './Components/public/kurukuru-kururing.gif';
import { buildApiUrl, API_ENDPOINTS } from './config/api';
import checkImg from './Components/public/check.png';

import axios from "axios";
import { useEffect, useState, useRef } from "react";

function AdminRoute({ children }) {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    return <NotFound />;
  }
  return children;
}

function StudentRoute({ children }) {
  const token = localStorage.getItem('admin_token');
  const doneToken = localStorage.getItem('done_view_token');
  const pendingToken = localStorage.getItem('pending_view_token');
  const existingUserToken = localStorage.getItem('existing_user_token');
  
  if (!token && !doneToken && !pendingToken && !existingUserToken) {
    return <NotFound />;
  }
  return children;
}

export default function App()
{
  const navigate = useNavigate();
  const location = useLocation();

  // Global loading overlay state
  const [globalLoading, setGlobalLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const fadeTimeoutRef = useRef(null);

  // Success animation state
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const [showSuccessText, setShowSuccessText] = useState(false);
  const [successFadeOut, setSuccessFadeOut] = useState(false);

  // Existing user modal state
  const [showExistingModal, setShowExistingModal] = useState(false);
  const [existingUserData, setExistingUserData] = useState(null);

  // Submission 
  const [registrationInputs, setRegistrationInputs] = useState(() => {
    const saved = localStorage.getItem('registrationInputs');
    return saved ? JSON.parse(saved) : {};
  });
  const [selectedTime, setSelectedTime] = useState(() => {
    const saved = localStorage.getItem('selectedTime');
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedDate, setSelectedDate] = useState(() => {
    const saved = localStorage.getItem('selectedDate');
    return saved ? JSON.parse(saved) : null;
  });

  // Always clear progress when navigating to home page
  useEffect(() => {
    if (location.pathname === '/') {
      localStorage.removeItem('registrationInputs');
      localStorage.removeItem('selectedTime');
      localStorage.removeItem('selectedDate');
      setRegistrationInputs({});
      setSelectedTime(null);
      setSelectedDate(null);
    }
  }, [location.pathname]);

  // Show loading overlay on initial mount and route changes
  useEffect(() => {
    setGlobalLoading(true);
    setFadeOut(false);
    // Simulate a short delay for demonstration, or wait for actual data if needed
    const timeout = setTimeout(() => {
      setFadeOut(true);
      fadeTimeoutRef.current = setTimeout(() => setGlobalLoading(false), 600); // 600ms fade duration
    }, 5000); // 5 seconds for testing
    return () => {
      clearTimeout(timeout);
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    };
  }, [location.pathname]);

  // Simple navigation guard: alert and clear progress only when navigating to home page
  useEffect(() => {
    if (location.pathname === '/') return;
    const handlePopState = () => {
      if (window.location.pathname === '/') {
        const hasProgress = localStorage.getItem('registrationInputs') || localStorage.getItem('selectedTime') || localStorage.getItem('selectedDate');
        if (hasProgress) {
          const confirmReset = window.confirm('Navigating to the home page will reset your progress. Continue?');
          if (confirmReset) {
            localStorage.removeItem('registrationInputs');
            localStorage.removeItem('selectedTime');
            localStorage.removeItem('selectedDate');
            setRegistrationInputs({});
            setSelectedTime(null);
            setSelectedDate(null);
          } else {
            window.history.go(1); // Prevent navigation
          }
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location.pathname]);

  function handleStudentInfoChange(event)
  {
    const name = event.target.name;
    const value = event.target.value;
    setRegistrationInputs(values => {
      const updated = { ...values, [name]: value };
      localStorage.setItem('registrationInputs', JSON.stringify(updated));
      return updated;
    });
  }

  useEffect(() =>
  {
    localStorage.setItem('registrationInputs', JSON.stringify(registrationInputs));
  }, [registrationInputs])

  useEffect(() => {
    localStorage.setItem('selectedTime', JSON.stringify(selectedTime));
  }, [selectedTime]);
  useEffect(() => {
    localStorage.setItem('selectedDate', JSON.stringify(selectedDate));
  }, [selectedDate]);

  function handlingDataObjectsTest()
  {
    /*  console.log(registrationInputs); */
  }

  function handleRegistrationSuccess() {
    setShowSuccessOverlay(true);
    setShowCheck(false);
    setShowSuccessText(false);
    setSuccessFadeOut(false);

    setTimeout(() => setShowCheck(true), 200);
    setTimeout(() => setShowSuccessText(true), 700);
    setTimeout(() => setSuccessFadeOut(true), 2200);
    setTimeout(() => {
      setShowSuccessOverlay(false);
      setShowCheck(false);
      setShowSuccessText(false);
      setSuccessFadeOut(false);
      // Optionally, navigate or reset state here
    }, 2800);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const completeRegistrationData = {
      ...registrationInputs,
      schedule_date: selectedDate || registrationInputs.schedule_date,
      schedule_time: selectedTime || registrationInputs.schedule_time
    };

    axios.post(buildApiUrl(API_ENDPOINTS.REGISTER), 
      completeRegistrationData,
      { headers: { 'Content-Type': 'application/json' } }
    )
    .then((response) => {
      if (response.data.status === 1) {
        // Registration success: show animation
        localStorage.setItem('student_id', response.data.student_id);
        handleRegistrationSuccess();
      } else if (
        response.data.message &&
        response.data.message.toLowerCase().includes('already have an account')
      ) {
        setExistingUserData({
          fullname: completeRegistrationData.fullname,
          student_number: completeRegistrationData.student_number,
          schedule_date: completeRegistrationData.schedule_date,
          schedule_time: completeRegistrationData.schedule_time
        });
        setShowExistingModal(true);
      } else {
        alert('Registration failed: ' + (response.data.message || 'Unknown error'));
      }
    })
    .catch((error) => {
      alert('Registration failed: ' + (error.response?.data?.message || error.message || 'Unknown error'));
    });
  }

  // Clear registrationInputs and token on logout
  function handleLogout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('registrationInputs');
    localStorage.removeItem('selectedTime');
    localStorage.removeItem('selectedDate');
    setRegistrationInputs({});
    setSelectedTime(null);
    setSelectedDate(null);
    navigate('/');
  }

  // Clear localStorage when unselecting date or time
  function handleUnselectDate() {
    setSelectedDate(null);
    setSelectedTime(null);
    localStorage.removeItem('selectedDate');
    localStorage.removeItem('selectedTime');
    // Optionally clear registrationInputs.schedule_date
    setRegistrationInputs(prev => ({ ...prev, schedule_date: null }));
    localStorage.setItem('registrationInputs', JSON.stringify({ ...registrationInputs, schedule_date: null }));
  }
  function handleUnselectTime() {
    setSelectedTime(null);
    localStorage.removeItem('selectedTime');
    // Optionally clear registrationInputs.schedule_time
    setRegistrationInputs(prev => ({ ...prev, schedule_time: null }));
    localStorage.setItem('registrationInputs', JSON.stringify({ ...registrationInputs, schedule_time: null }));
  }

  return (
    <>
      {globalLoading && (
        <div
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white bg-opacity-90 transition-opacity duration-700 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
        >
          <img src={kuruKuru} alt="Loading..." className="w-32 h-32 mx-auto animate-spin-slow" />
          <p className="text-lg text-gray-700 mt-4 font-bold">Loading...</p>
        </div>
      )}

      {/* Registration Success Overlay */}
      {showSuccessOverlay && (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-90 transition-opacity duration-700 ${successFadeOut ? 'opacity-0' : 'opacity-100'}`}>
          <div className={`transition-all duration-700 ${showCheck ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="w-24 h-24 flex items-center justify-center mb-6">
              <img src={checkImg} alt="Success" className="w-full h-auto" />
            </div>
          </div>
          <div className={`transition-all duration-700 ${showSuccessText ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Registration Successful!</h2>
            <p className="text-xl text-gray-600">Your appointment has been scheduled.</p>
          </div>
        </div>
      )}

      {/* Existing User Modal */}
      {showExistingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <img src={checkImg} alt="Existing User" className="w-full h-auto" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Existing Account Found</h2>
              <p className="text-gray-600">You already have an account. Here's your current appointment:</p>
            </div>
            
            {existingUserData && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Your Appointment Details:</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {existingUserData.fullname}</p>
                  <p><span className="font-medium">Student Number:</span> {existingUserData.student_number}</p>
                  <p><span className="font-medium">Date:</span> {existingUserData.schedule_date}</p>
                  <p><span className="font-medium">Time:</span> {existingUserData.schedule_time}</p>
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowExistingModal(false);
                  navigate('/');
                }}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowExistingModal(false);
                  localStorage.setItem('viewing_student_data', JSON.stringify(existingUserData));
                  localStorage.setItem('viewing_student_id', 'existing_user');
                  localStorage.setItem('existing_user_token', 'temp_token');
                  navigate('/receipt');
                }}
                className="flex-1 bg-[#E1A500] hover:bg-[#C68C10] text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 border-2 border-[#C68C10]"
              >
                View Full Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
    <Routes>
      <Route path='/' element={<RegistrationForm
        registrationInputs={registrationInputs}
        handleChange={handleStudentInfoChange}
        selectedTime={selectedTime}
        setSelectedTime={setSelectedTime}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        handleUnselectDate={handleUnselectDate}
        handleUnselectTime={handleUnselectTime}
        onRegistrationSuccess={handleRegistrationSuccess}
      />} />

      <Route path='/schedule' element={
        <StudentRoute>
          <ScheduleSelection
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            registrationInputs={registrationInputs}
            handlingDataObjectsTest={handlingDataObjectsTest}
            setRegistrationInputs={setRegistrationInputs}
            handleLogout={handleLogout}
            handleUnselectDate={handleUnselectDate}
            handleUnselectTime={handleUnselectTime}
          />
        </StudentRoute>
      } />

      <Route path="/receipt" element={
        <StudentRoute>
          <ScheduleReceipt
            registrationInputs={registrationInputs}
            handleSubmit={handleSubmit}
            handleLogout={handleLogout}
            selectedTime={selectedTime}
            selectedDate={selectedDate}
          />
        </StudentRoute>
      } />

      <Route path='/admin' element={
        <AdminRoute>
              <AdminPage handleLogout={handleLogout} />
        </AdminRoute>
      } />
      <Route path="/register" element={<RegistrationForm handleChange={handleStudentInfoChange} registrationInputs={registrationInputs} />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
      </div>
    </>
  )
}