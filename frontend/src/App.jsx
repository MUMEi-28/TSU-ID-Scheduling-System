import RegistrationForm from "./Components/Student/Pages/RegistrationForm";
import ScheduleReceipt from "./Components/Student/Pages/ScheduleReceipt";
import ScheduleSelection from "./Components/Student/Pages/ScheduleSelection";
import AdminPage from "./Components/Admin/AdminPage";
import { Routes, Route } from "react-router-dom";
<<<<<<< Updated upstream
=======
import QueryPanel from "./Components/Student/NewScheduleSelection/QueryPanel";
import TimePicker from "./Components/Student/NewScheduleSelection/TimePicker";
import NewScheduleSelection from "./Components/Student/Pages/NewScheduleSelection";
>>>>>>> Stashed changes

export default function App()
{
  return (
<<<<<<< Updated upstream
    <Routes>
      <Route path='/' element={<RegistrationForm />} />
      <Route path='/schedule/' element={<ScheduleSelection />} />
      <Route path='/schedule/:date' element={<ScheduleSelection />} />
      <Route path='/schedule/:date/:timePeriod' element={<ScheduleSelection />} />
      <Route path="/receipt" element={<ScheduleReceipt />} />
    </Routes>
=======
    // <Routes>
    //   <Route path='/' element={<RegistrationForm />} />
    //   <Route path='/schedule/' element={<ScheduleSelection />} />
    //   <Route path='/schedule/:date' element={<ScheduleSelection />} />
    //   <Route path='/schedule/:date/:timePeriod' element={<ScheduleSelection />} />
    //   <Route path="/receipt" element={<ScheduleReceipt />} />
    // </Routes>
    <NewScheduleSelection/>
>>>>>>> Stashed changes
  )
}
