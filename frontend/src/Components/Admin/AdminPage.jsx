import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import CustomDropdown from './CustomDropdown';
import checkImg from '../public/check.png';

// Toast component
function Toast({ message, type, onClose }) {
  return (
    <div className={`fixed top-8 right-8 z-[9999] px-6 py-4 rounded-lg shadow-lg text-lg font-bold transition-all duration-300 ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-600 text-white'}`}
      style={{ minWidth: '220px', maxWidth: '90vw' }}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-2xl font-bold text-white/80 hover:text-white">&times;</button>
    </div>
  );
}

const Calendar = React.lazy(() => import('../Student/ScheduleSelection/Calendar'));

const AdminPage = (props) =>
{
    const location = useLocation();
    const [showCalendar, setShowCalendar] = useState(false);
    const [showList, setShowList] = useState(false);
    const [currentScheduleDate, setCurrentScheduleDate] = useState("No Date Chosen");
    const [placeHolderDate, setPlaceHolderDate] = useState("No Date Chosen");
    const [selectedTime, setSelectedTime] = useState("8:00am - 9:00am");
    const [students, setStudents] = useState([]); // 📌 This will hold the fetched data
    const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
    const [showChangeCredentials, setShowChangeCredentials] = useState(false);
    const [adminFullname, setAdminFullname] = useState("");
    const [adminStudentNumber, setAdminStudentNumber] = useState("");
    const [changeStatus, setChangeStatus] = useState("");
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [editRowId, setEditRowId] = useState(null);
    const [editData, setEditData] = useState({});
    // Toast state
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    // Confirmation modal state
    const [confirmModal, setConfirmModal] = useState({ show: false, action: null, payload: null, message: '' });
    // Search/filter/pagination state
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [page, setPage] = useState(1);
    const perPage = 10;

    // Fetch students from backend on mount
    useEffect(() => {
      const cacheKey = 'admin_students_cache';
      const cache = localStorage.getItem(cacheKey);
      let shouldFetch = true;
      if (cache) {
        const { data, timestamp } = JSON.parse(cache);
        if (Date.now() - timestamp < 30000) { // 30 seconds
          setStudents(data);
          shouldFetch = false;
        }
      }
      if (shouldFetch) {
        axios.get('http://localhost/Projects/TSU-ID-Scheduling-System/backend/get_students.php')
          .then(response => {
                setStudents(response.data);
            localStorage.setItem(cacheKey, JSON.stringify({ data: response.data, timestamp: Date.now() }));
            })
          .catch(error => {
                console.error('Failed to fetch students:', error);
            setToast({ show: true, message: 'Failed to fetch students', type: 'error' });
            });
      }
    }, []);

    // Auto-dismiss toast after 3 seconds
    useEffect(() => {
      if (toast.show) {
        const timer = setTimeout(() => setToast({ ...toast, show: false }), 3000);
        return () => clearTimeout(timer);
      }
    }, [toast.show]);

    const HandleChangeDate = () => setShowCalendar(true);
    const HandleShowList = () => setShowList(true);

    const handleDownloadList = () =>
    {
        setShowList(false);
        if (currentScheduleDate === "No Date Chosen")
        {
            setToast({ show: true, message: 'No date selected', type: 'error' });
        } else
        {
            setToast({ show: true, message: `Downloading list for ${currentScheduleDate}, ${selectedTime}`, type: 'success' });
        }
    };

    const HandleDateReplace = () =>
    {
        setShowCalendar(false);
        if (!selectedCalendarDate) return;
        const realDate = new Date(selectedCalendarDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        setCurrentScheduleDate(realDate);
    };

    useEffect(() =>
    {
        const urlSegments = location.pathname.split('/');
        const dateNumerical = urlSegments[urlSegments.length - 1];
        const dateObject = new Date(dateNumerical);
        const realDate = dateObject.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        setPlaceHolderDate(realDate);
    }, [location.pathname]);

    // Search, filter, and paginate students
    const filteredStudents = students.filter(student => {
      const matchesSearch =
        student.fullname.toLowerCase().includes(search.toLowerCase()) ||
        student.student_number.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === 'all' ? true : (student.status === filterStatus);
      const matchesDate = student.schedule_date === currentScheduleDate && student.schedule_time === selectedTime;
      return matchesSearch && matchesStatus && matchesDate;
    });
    const totalPages = Math.ceil(filteredStudents.length / perPage);
    const paginatedStudents = filteredStudents.slice((page - 1) * perPage, page * perPage);

    const handleOpenChangeCredentials = () => {
        setShowChangeCredentials(true);
        setChangeStatus("");
    };
    const handleCloseChangeCredentials = () => {
        setShowChangeCredentials(false);
        setAdminFullname("");
        setAdminStudentNumber("");
        setChangeStatus("");
    };
    const handleChangeCredentials = async (e) => {
        e.preventDefault();
        setChangeStatus("");
        try {
            const response = await axios.post('http://localhost/Projects/TSU-ID-Scheduling-System/backend/update_admin.php', {
                fullname: adminFullname,
                student_number: adminStudentNumber
            });
            if (response.data.status === 1) {
                setChangeStatus("Credentials updated successfully!");
                setShowSuccessPopup(true);
                setTimeout(() => {
                    setShowSuccessPopup(false);
                    handleCloseChangeCredentials();
                }, 2000);
                setToast({ show: true, message: 'Admin credentials updated!', type: 'success' });
            } else {
                setChangeStatus(response.data.message || "Failed to update credentials.");
                setToast({ show: true, message: response.data.message || 'Failed to update credentials', type: 'error' });
            }
        } catch (err) {
            setChangeStatus("Error updating credentials.");
            setToast({ show: true, message: 'Error updating credentials', type: 'error' });
        }
    };
    const handleLogoutClick = () => {
        setConfirmModal({
          show: true,
          action: () => {
            setToast({ show: true, message: 'You have been logged out.', type: 'success' });
            if (props.handleLogout) props.handleLogout();
          },
          payload: null,
          message: 'Are you sure you want to log out?'
        });
    };

    // CRUD handlers
    const handleEditClick = (student) => {
        setEditRowId(student.id);
        setEditData({ ...student });
    };
    const handleEditChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };
    const handleEditSave = async () => {
        setConfirmModal({
          show: true,
          action: async () => {
            try {
              await axios.put('http://localhost/Projects/TSU-ID-Scheduling-System/backend/index.php', editData, {
                headers: { 'Content-Type': 'application/json' }
              });
              setEditRowId(null);
              setToast({ show: true, message: 'Student updated successfully!', type: 'success' });
              invalidateStudentCache();
              axios.get('http://localhost/Projects/TSU-ID-Scheduling-System/backend/get_students.php')
                .then(response => {
                  setStudents(response.data);
                  localStorage.setItem('admin_students_cache', JSON.stringify({ data: response.data, timestamp: Date.now() }));
                });
            } catch (err) {
              setToast({ show: true, message: 'Failed to update student', type: 'error' });
            }
          },
          payload: null,
          message: 'Are you sure you want to save these changes?'
        });
    };
    const handleEditCancel = () => {
        setEditRowId(null);
        setEditData({});
    };
    const handleDelete = (id) => {
        setConfirmModal({
          show: true,
          action: async () => {
            try {
              await axios.delete('http://localhost/Projects/TSU-ID-Scheduling-System/backend/index.php', {
                data: { id },
                headers: { 'Content-Type': 'application/json' }
              });
              setToast({ show: true, message: 'Student deleted successfully!', type: 'success' });
              invalidateStudentCache();
              axios.get('http://localhost/Projects/TSU-ID-Scheduling-System/backend/get_students.php')
                .then(response => {
                  setStudents(response.data);
                  localStorage.setItem('admin_students_cache', JSON.stringify({ data: response.data, timestamp: Date.now() }));
                });
            } catch (err) {
              setToast({ show: true, message: 'Failed to delete student', type: 'error' });
            }
          },
          payload: null,
          message: 'Are you sure you want to delete this student? This action cannot be undone.'
        });
    };
    const handleToggleStatus = async (student) => {
        const newStatus = student.status === 'done' ? 'pending' : 'done';
        await axios.put('http://localhost/Projects/TSU-ID-Scheduling-System/backend/index.php', { ...student, status: newStatus }, {
            headers: { 'Content-Type': 'application/json' }
        });
        invalidateStudentCache();
        axios.get('http://localhost/Projects/TSU-ID-Scheduling-System/backend/get_students.php')
            .then(response => {
              setStudents(response.data);
              localStorage.setItem('admin_students_cache', JSON.stringify({ data: response.data, timestamp: Date.now() }));
            });
        setToast({ show: true, message: `Student marked as ${newStatus}`, type: 'success' });
    };

    // Invalidate cache on student edit, delete, or status change
    const invalidateStudentCache = () => {
      localStorage.removeItem('admin_students_cache');
    };

    // Confirmation Modal
    const ConfirmModal = ({ show, message, onConfirm, onCancel }) => show ? (
      <div className="fixed inset-0 z-[9998] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.15)' }}>
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4 text-center">Confirmation</h2>
          <p className="mb-6 text-center text-lg">{message}</p>
          <div className="flex gap-6 justify-center">
            <button onClick={onConfirm} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold text-lg hover:bg-green-800">Yes</button>
            <button onClick={onCancel} className="bg-gray-400 text-white px-6 py-2 rounded-lg font-bold text-lg hover:bg-gray-600">No</button>
          </div>
        </div>
      </div>
    ) : null;

    return (
        <div className="w-screen h-screen flex">
            {/* Toast Notification */}
            {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
            {/* Confirmation Modal */}
            <ConfirmModal
              show={confirmModal.show}
              message={confirmModal.message}
              onConfirm={async () => {
                setConfirmModal({ ...confirmModal, show: false });
                if (typeof confirmModal.action === 'function') await confirmModal.action();
              }}
              onCancel={() => setConfirmModal({ ...confirmModal, show: false })}
            />
            {/* Sidebar */}
            <div className="w-3/12 h-screen relative flex flex-col justify-center items-center gap-5">
                <h1 className="absolute border-2 left-0 top-10 text-2xl px-14 py-1 bg-[#971212] text-white">Admin</h1>
                <h1 className="text-3xl ml-12 font-bold">Scheduled Time</h1>
                <CustomDropdown selectedTime={selectedTime} setSelectedTime={setSelectedTime} />

                {/* Change Date Button */}
                <div className="flex flex-col items-center gap-2 mt-45 ml-12">
                    <p className="text-xl">Change Date</p>
                    <button
                        onClick={HandleChangeDate}
                        className="w-fit text-center duration-150 border-2 text-white bg-[#AC0000] hover:border-[#AC0000] hover:text-[#AC0000] hover:bg-[#f5f5f5] 
                        px-25 py-2 text-lg rounded-md"
                    >
                        {currentScheduleDate}
                    </button>
                </div>

                {/* Generate List Button */}
                <div className="flex flex-col items-center gap-2 mt-0 ml-12">
                    <button
                        onClick={HandleShowList}
                        className="w-fit text-center duration-150 text-white rounded-md hover:border-2 border-2 hover:text-bold
                         hover:border-[#AC0000] hover:text-[#AC0000] hover:bg-[#f5f5f5] bg-[#AC0000] px-25 py-2 text-lg"
                    >
                        Generate List
                    </button>
                </div>

                {/* Change Admin Credentials Button */}
                <div className="flex flex-col items-center gap-2 mt-0 ml-12">
                    <button
                        onClick={handleOpenChangeCredentials}
                        className="w-fit text-center duration-150 text-white rounded-md hover:border-2 border-2 hover:text-bold
                         hover:border-[#AC0000] hover:text-[#AC0000] hover:bg-[#f5f5f5] bg-[#AC0000] px-25 py-2 text-lg"
                    >
                        Change Admin Credentials
                    </button>
                </div>

                {/* Logout Button */}
                <div className="flex flex-col items-center gap-2 mt-0 ml-12">
                    <button
                        onClick={handleLogoutClick}
                        className="w-fit text-center duration-150 text-white rounded-md hover:border-2 border-2 hover:text-bold
                         hover:border-[#AC0000] hover:text-[#AC0000] hover:bg-[#f5f5f5] bg-[#AC0000] px-25 py-2 text-lg"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-9/12 h-screen flex justify-center items-center relative">

                {/* Calendar Popup */}
                {showCalendar && (
                    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-20">
                        <div className="bg-white p-6 opacity-100 rounded-lg shadow-xl h-fit flex flex-col justify-center items-center text-2xl">
                            <Suspense fallback={<div className='text-xl font-bold text-gray-600'>Loading calendar...</div>}>
                              <Calendar onDateSelect={setSelectedCalendarDate} onClose={() => setShowCalendar(false)} />
                            </Suspense>
                            <hr />
                            <button
                                onClick={HandleDateReplace}
                                className="w-full p-5 text-2xl bg-red-500 text-white rounded-md hover:bg-red-600"
                            >
                                Change Date to: {selectedCalendarDate ? new Date(selectedCalendarDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'No Date Selected'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Generate List Popup */}
                {showList && (
                    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-20">
                        <div className="bg-white p-6 opacity-100 shadow-xl w-3/12 h-5/12 flex flex-col justify-evenly items-center border-4">
                            <h1 className="text-5xl mb-1">Generate List</h1>
                            <hr className="w-full" />
                            <h1 className="text-black text-4xl">Date</h1>
                            <h1 className="text-black text-4xl">{currentScheduleDate}</h1>
                            <h1 className="text-black text-3xl">Time</h1>
                            <h1 className="text-black text-3xl">{selectedTime}</h1>
                            <button
                                onClick={handleDownloadList}
                                className="w-fit p-5 text-2xl border-2 text-black rounded-md hover:bg-gray-600"
                            >
                                Download
                            </button>
                        </div>
                    </div>
                )}

                {/* Change Credentials Modal */}
                {showChangeCredentials && (
                    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-30">
                        <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center w-96 relative">
                            {showSuccessPopup && (
                                <div className="fixed inset-0 flex items-center justify-center z-50">
                                    <div className="flex flex-col items-center bg-green-600 text-white px-8 py-8 rounded-lg shadow-2xl text-lg font-bold">
                                        <img src={checkImg} alt="check" className="w-16 h-16 mb-4" />
                                        Credentials successfully updated!
                                    </div>
                                </div>
                            )}
                            <h2 className="text-2xl font-bold mb-4">Change Admin Credentials</h2>
                            <form onSubmit={handleChangeCredentials} className="flex flex-col gap-4 w-full">
                                <input
                                    type="text"
                                    placeholder="Full Name (Username)"
                                    value={adminFullname}
                                    onChange={e => setAdminFullname(e.target.value)}
                                    className="border p-2 rounded w-full"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Student Number (Password)"
                                    value={adminStudentNumber}
                                    onChange={e => setAdminStudentNumber(e.target.value)}
                                    className="border p-2 rounded w-full"
                                    required
                                />
                                <div className="flex justify-center gap-4 mt-2">
                                    <button
                                        type="submit"
                                        className="w-fit text-center duration-150 text-white rounded-md hover:border-2 border-2 hover:text-bold hover:border-[#AC0000] hover:text-[#AC0000] hover:bg-[#f5f5f5] bg-[#AC0000] px-8 py-2 text-lg"
                                    >
                                        Update
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCloseChangeCredentials}
                                        className="w-fit text-center duration-150 rounded-md border-2 border-gray-400 bg-gray-200 text-gray-800 hover:bg-gray-300 hover:text-black px-8 py-2 text-lg"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                            {changeStatus && !showSuccessPopup && <div className="mt-4 text-center text-lg font-semibold">{changeStatus}</div>}
                        </div>
                    </div>
                )}

                {/* 📌 Table */}
                <div className="w-10/12 h-[80%] overflow-y-auto bg-white rounded-lg shadow-lg p-5">
                    {/* Search, Filter, Pagination Controls */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
                        <input
                            type="text"
                            placeholder="Search by name or student number..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="border border-gray-400 rounded-lg px-4 py-2 w-full md:w-1/3"
                        />
                        <select
                            value={filterStatus}
                            onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
                            className="border border-gray-400 rounded-lg px-4 py-2 w-full md:w-1/5"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="done">Done</option>
                        </select>
                    </div>
                    <table className="w-full text-center border border-gray-300">
                        <thead className="bg-[#971212] text-white text-lg">
                            <tr>
                                <th className="py-3 border">Name</th>
                                <th className="py-3 border">Student Number</th>
                                <th className="py-3 border">Date</th>
                                <th className="py-3 border">Time</th>
                                <th className="py-3 border">Status</th>
                                <th className="py-3 border">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(currentScheduleDate !== "No Date Chosen" && paginatedStudents.length > 0) ? (
                                paginatedStudents.map((student, index) => (
                                    <tr key={index} className="hover:bg-gray-100">
                                        {editRowId === student.id ? (
                                            <>
                                                <td className="py-2 border"><input name="fullname" value={editData.fullname} onChange={handleEditChange} className="border p-1 rounded w-full" /></td>
                                                <td className="py-2 border"><input name="student_number" value={editData.student_number} onChange={handleEditChange} className="border p-1 rounded w-full" /></td>
                                                <td className="py-2 border"><input name="schedule_date" value={editData.schedule_date} onChange={handleEditChange} className="border p-1 rounded w-full" /></td>
                                                <td className="py-2 border"><input name="schedule_time" value={editData.schedule_time} onChange={handleEditChange} className="border p-1 rounded w-full" /></td>
                                                <td className="py-2 border">{editData.status}</td>
                                                <td className="py-2 border flex gap-2 justify-center">
                                                    <button onClick={handleEditSave} className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-800">Save</button>
                                                    <button onClick={handleEditCancel} className="bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-600">Cancel</button>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                        <td className="py-2 border">{student.fullname}</td>
                                        <td className="py-2 border">{student.student_number}</td>
                                        <td className="py-2 border">{student.schedule_date}</td>
                                        <td className="py-2 border">{student.schedule_time}</td>
                                                <td className="py-2 border">
                                                    <span className={student.status === 'done' ? 'bg-green-200 text-green-800 px-2 py-1 rounded' : 'bg-yellow-200 text-yellow-800 px-2 py-1 rounded'}>
                                                        {student.status || 'pending'}
                                                    </span>
                                                </td>
                                                <td className="py-2 border flex gap-2 justify-center">
                                                    <button onClick={() => handleEditClick(student)} className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-800">Edit</button>
                                                    <button onClick={() => handleDelete(student.id)} className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-800">Delete</button>
                                                    <button onClick={() => handleToggleStatus(student)} className={student.status === 'done' ? 'bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-700' : 'bg-green-500 text-white px-2 py-1 rounded hover:bg-green-700'}>
                                                        {student.status === 'done' ? 'Mark Pending' : 'Mark Done'}
                                                    </button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-4 text-gray-400">
                                        No data found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-4">
                            <button
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                                className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-bold disabled:opacity-50"
                            >
                                &lt;
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`px-3 py-1 rounded font-bold ${page === i + 1 ? 'bg-[#971212] text-white' : 'bg-gray-100 text-gray-700'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={page === totalPages}
                                className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-bold disabled:opacity-50"
                            >
                                &gt;
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
