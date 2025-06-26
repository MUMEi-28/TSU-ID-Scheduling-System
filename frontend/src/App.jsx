import RegistrationForm from "./Components/Student/Pages/RegistrationForm";
import ScheduleReceipt from "./Components/Student/Pages/ScheduleReceipt";
import ScheduleSelection from "./Components/Student/Pages/ScheduleSelection";
import AdminPage from "./Components/Admin/AdminPage";
import { Routes, Route, useNavigate } from "react-router-dom";
import QueryPanel from "./Components/Student/NewScheduleSelection/QueryPanel";
import TimePicker from "./Components/Student/NewScheduleSelection/TimePicker";
import NewScheduleSelection from "./Components/Student/Pages/NewScheduleSelection";
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

export default function App()
{
  const navigate = useNavigate();


  // Submission 
  const [registrationInputs, setRegistrationInputs] = useState({});
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);


  function handleStudentInfoChange(event)
  {
    const name = event.target.name;
    const value = event.target.value;
    setRegistrationInputs(values => ({ ...values, [name]: value }));
    console.log(registrationInputs);

  }

  useEffect(() =>
  {
    console.log(registrationInputs);

  }, [registrationInputs])

  function handlingDataObjectsTest()
  {
    /*  console.log(registrationInputs); */
  }

  function handleSubmit(event)
  {
    event.preventDefault();

    axios.post(`http://localhost/GitHub/TSU-ID-Scheduling-System/backend/register.php`, registrationInputs)
      .then(() =>
      {
        console.log(registrationInputs);
      });
  }

  return (
    <Routes>
      <Route path='/' element={<RegistrationForm
        registrationInputs={registrationInputs}
        handleChange={handleStudentInfoChange}
      />} />


      <Route path='/schedule' element={<NewScheduleSelection
        selectedTime={selectedTime}
        setSelectedTime={setSelectedTime}

        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        registrationInputs={registrationInputs}


        handlingDataObjectsTest={handlingDataObjectsTest}
        setRegistrationInputs={setRegistrationInputs}
      />} />

      <Route path="/receipt" element={<ScheduleReceipt
        registrationInputs={registrationInputs}
        handleSubmit={handleSubmit}

      />} />

      <Route path='/admin' element={
        <AdminRoute>
          <AdminPage />
        </AdminRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}