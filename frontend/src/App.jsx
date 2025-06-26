import RegistrationForm from "./Components/Student/Pages/RegistrationForm";
import ScheduleReceipt from "./Components/Student/Pages/ScheduleReceipt";
import ScheduleSelection from "./Components/Student/Pages/ScheduleSelection";
import AdminPage from "./Components/Admin/AdminPage";
import { Routes, Route, useNavigate } from "react-router-dom";
import QueryPanel from "./Components/Student/NewScheduleSelection/QueryPanel";
import TimePicker from "./Components/Student/NewScheduleSelection/TimePicker";
import NotFound from "./Components/Error/NotFound";

import axios from "axios";
import { useEffect, useState } from "react";

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


  // Submission 
  const [registrationInputs, setRegistrationInputs] = useState(() => {
    const saved = localStorage.getItem('registrationInputs');
    return saved ? JSON.parse(saved) : {};
  });
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);


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
    setRegistrationInputs({});
    navigate('/');
  }

  return (
    <Routes>
      <Route path='/' element={<RegistrationForm
        registrationInputs={registrationInputs}
        handleChange={handleStudentInfoChange}
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
          />
        </StudentRoute>
      } />

      <Route path="/receipt" element={
        <StudentRoute>
          <ScheduleReceipt
            registrationInputs={registrationInputs}
            handleSubmit={handleSubmit}
            handleLogout={handleLogout}
          />
        </StudentRoute>
      } />

      <Route path='/admin' element={
        <AdminRoute>
          <AdminPage />
        </AdminRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}