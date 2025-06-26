import RegistrationForm from "./Components/Student/Pages/RegistrationForm";
import ScheduleReceipt from "./Components/Student/Pages/ScheduleReceipt";
import ScheduleSelection from "./Components/Student/Pages/ScheduleSelection";
import AdminPage from "./Components/Admin/AdminPage";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import QueryPanel from "./Components/Student/NewScheduleSelection/QueryPanel";
import TimePicker from "./Components/Student/NewScheduleSelection/TimePicker";
import NotFound from "./Components/Error/NotFound";
import kuruKuru from './Components/public/kurukuru-kururing.gif';

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
  if (!token) {
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
    console.log(registrationInputs);
  }

  useEffect(() =>
  {
    localStorage.setItem('registrationInputs', JSON.stringify(registrationInputs));
    console.log(registrationInputs);
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

  function handleSubmit(event)
  {
    event.preventDefault();

    axios.post(`http://localhost/Projects/TSU-ID-Scheduling-System/backend/register.php`, registrationInputs)
      .then(() =>
      {
        console.log(registrationInputs);
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

  const debugData = {
    registrationInputs: registrationInputs,
    selectedTime: selectedTime,
    selectedDate: selectedDate,
    admin_token: localStorage.getItem('admin_token')
  };

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
      <div className="w-full bg-yellow-200 text-yellow-900 text-center py-2 font-bold fixed top-0 left-0 z-50 shadow-md" style={{fontSize: '0.95rem'}}>
        DEBUG: If you see this, please delete this debug bar if you're done debugging xD<br/>
        <span className="font-mono text-xs">{JSON.stringify(debugData, null, 2)}</span>
      </div>
      <div style={{ paddingTop: '72px' }}>
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
      <Route path="*" element={<NotFound />} />
    </Routes>
      </div>
    </>
  )
}