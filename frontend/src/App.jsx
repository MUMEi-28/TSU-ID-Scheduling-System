import RegistrationForm from "./Components/Student/Pages/RegistrationForm";
import ScheduleReceipt from "./Components/Student/Pages/ScheduleReceipt";
import ScheduleSelection from "./Components/Student/Pages/ScheduleSelection";
import AdminPage from "./Components/Admin/AdminPage";
import DatePicker from "./Components/Student/NewScheduleSelection/DatePicker"
import { Routes, Route } from "react-router-dom";
import QueryPanel from "./Components/Student/NewScheduleSelection/QueryPanel";

export default function App()
{
  return (
    // <Routes>
    //   <Route path='/' element={<RegistrationForm />} />
    //   <Route path='/schedule/' element={<ScheduleSelection />} />
    //   <Route path='/schedule/:date' element={<ScheduleSelection />} />
    //   <Route path='/schedule/:date/:timePeriod' element={<ScheduleSelection />} />
    //   <Route path="/receipt" element={<ScheduleReceipt />} />
    // </Routes>

    <QueryPanel/>
  )
}
