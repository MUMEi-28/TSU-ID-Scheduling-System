import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import CustomDropdown from './CustomDropdown';
import checkImg from '../public/check.png';
import kuruKuru from '../public/kurukuru-kururing.gif';

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

// Lazy load the Calendar component
const Calendar = React.lazy(() => import('../Student/ScheduleSelection/Calendar'));

const AdminPage = (props) =>
{
    const location = useLocation();
    const [showCalendar, setShowCalendar] = useState(false);
    const [showList, setShowList] = useState(false);
    const [currentScheduleDate, setCurrentScheduleDate] = useState("No Date Chosen");
    const [placeHolderDate, setPlaceHolderDate] = useState("No Date Chosen");
    const [selectedTime, setSelectedTime] = useState("No Time Chosen");
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
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [rescheduleStudent, setRescheduleStudent] = useState(null);
    const [rescheduleDate, setRescheduleDate] = useState('');
    const [rescheduleTime, setRescheduleTime] = useState('8:00am - 9:00am');
    const [showAllStudents, setShowAllStudents] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isFiltering, setIsFiltering] = useState(false);

    // Fetch students from backend on mount
    useEffect(() => {
        setIsLoading(true);
      const cacheKey = 'admin_students_cache';
      const cache = localStorage.getItem(cacheKey);
      let shouldFetch = true;
        
      if (cache) {
        const { data, timestamp } = JSON.parse(cache);
        if (Date.now() - timestamp < 30000) { // 30 seconds
          setStudents(data);
          shouldFetch = false;
                // Still show loading for 5 seconds even with cache
                setTimeout(() => setIsLoading(false), 5000);
            }
        }
        
      if (shouldFetch) {
        axios.get('http://localhost/Projects/TSU-ID-Scheduling-System/backend/get_students.php')
          .then(response => {
                setStudents(response.data);
            localStorage.setItem(cacheKey, JSON.stringify({ data: response.data, timestamp: Date.now() }));
                    // Show loading for 5 seconds
                    setTimeout(() => setIsLoading(false), 5000);
            })
          .catch(error => {
                console.error('Failed to fetch students:', error);
            setToast({ show: true, message: 'Failed to fetch students', type: 'error' });
                    setTimeout(() => setIsLoading(false), 5000);
            });
      }
    }, []);

    // Add loading when date/time changes
    useEffect(() => {
        if (!isLoading && currentScheduleDate !== "No Date Chosen") {
            setIsFiltering(true);
            // Simulate loading time for filtering
            setTimeout(() => setIsFiltering(false), 2000);
        }
    }, [currentScheduleDate, selectedTime, isLoading]);

    // Auto-dismiss toast after 3 seconds
    useEffect(() => {
      if (toast.show) {
        const timer = setTimeout(() => setToast({ ...toast, show: false }), 3000);
        return () => clearTimeout(timer);
      }
    }, [toast.show]);

    const HandleChangeDate = () => setShowCalendar(true);
    const HandleShowList = () => setShowList(true);

    const handleDownloadList = () => {
        setShowList(false);
        if (currentScheduleDate === "No Date Chosen") {
            // Generate all students data
            setToast({ show: true, message: 'Generating complete student list...', type: 'success' });
            // Here you can add logic to download all students data
            downloadAllStudentsData();
        } else {
            setToast({ show: true, message: `Generating list for ${currentScheduleDate}, ${selectedTime}`, type: 'success' });
            // Here you can add logic to download filtered students data
            downloadFilteredStudentsData();
        }
    };

    const downloadAllStudentsData = () => {
        // Filter out admin and create CSV data
        const allStudents = students.filter(student => student.id !== 1);
        const csvData = [
            ['Name', 'Student Number', 'Date', 'Time', 'Status'],
            ...allStudents.map(student => [
                student.fullname,
                student.student_number,
                student.schedule_date || 'Not scheduled',
                student.schedule_time || 'Not scheduled',
                student.status || 'pending'
            ])
        ];
        
        // Convert to CSV and download
        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `all_students_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const downloadFilteredStudentsData = () => {
        // Download filtered students data
        const filteredData = students.filter(student => 
            student.id !== 1 && 
            student.schedule_date === currentScheduleDate && 
            student.schedule_time === selectedTime
        );
        
        const csvData = [
            ['Name', 'Student Number', 'Date', 'Time', 'Status'],
            ...filteredData.map(student => [
                student.fullname,
                student.student_number,
                student.schedule_date,
                student.schedule_time,
                student.status || 'pending'
            ])
        ];
        
        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentScheduleDate}_${selectedTime}_students.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const HandleDateReplace = () => {
        setShowCalendar(false);
        if (!selectedCalendarDate) return;
        const realDate = new Date(selectedCalendarDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        setCurrentScheduleDate(realDate);
        // Show filtering loading
        setIsFiltering(true);
        setTimeout(() => setIsFiltering(false), 2000);
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
      // Exclude admin (id=1) from the table
      if (student.id === 1) return false;
      
      const matchesSearch =
        student.fullname.toLowerCase().includes(search.toLowerCase()) ||
        student.student_number.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === 'all' ? true : (student.status === filterStatus);
      
      // Show all students when no specific date is selected
      let matchesDate = true;
      
      // Only apply date/time filtering if a specific date is selected AND it's not "No Date Chosen"
      if (currentScheduleDate && currentScheduleDate !== "No Date Chosen") {
        // If time is "No Time Chosen", only filter by date
        if (selectedTime && selectedTime !== "No Time Chosen") {
          matchesDate = student.schedule_date === currentScheduleDate && student.schedule_time === selectedTime;
        } else {
          matchesDate = student.schedule_date === currentScheduleDate;
        }
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    });
    const totalPages = Math.ceil(filteredStudents.length / perPage);
    const paginatedStudents = filteredStudents.slice((page - 1) * perPage, page * perPage);

    // Add this for debugging
    useEffect(() => {
        console.log('Students loaded:', students.length);
        console.log('Current schedule date:', currentScheduleDate);
        console.log('Selected time:', selectedTime);
        console.log('Filtered students:', filteredStudents.length);
    }, [students, currentScheduleDate, selectedTime, filteredStudents]);

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
            setIsLoading(true);
            try {
              // Only send editable fields (name and student number)
              const updateData = {
                id: editData.id,
                fullname: editData.fullname,
                student_number: editData.student_number
              };
              
              await axios.put('http://localhost/Projects/TSU-ID-Scheduling-System/backend/index.php', updateData, {
                headers: { 'Content-Type': 'application/json' }
              });
              setEditRowId(null);
              setToast({ show: true, message: 'Student updated successfully!', type: 'success' });
              invalidateStudentCache();
              axios.get('http://localhost/Projects/TSU-ID-Scheduling-System/backend/get_students.php')
                .then(response => {
                  setStudents(response.data);
                  localStorage.setItem('admin_students_cache', JSON.stringify({ data: response.data, timestamp: Date.now() }));
                  setTimeout(() => setIsLoading(false), 2000); // 2 seconds for updates
                });
            } catch (err) {
              setToast({ show: true, message: 'Failed to update student', type: 'error' });
              setTimeout(() => setIsLoading(false), 2000);
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
            setIsLoading(true);
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
                  setTimeout(() => setIsLoading(false), 2000);
                });
            } catch (err) {
              setToast({ show: true, message: 'Failed to delete student', type: 'error' });
              setTimeout(() => setIsLoading(false), 2000);
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

    const handleMarkCancelled = async (student) => {
        setConfirmModal({
          show: true,
          action: async () => {
            try {
              await axios.put('http://localhost/Projects/TSU-ID-Scheduling-System/backend/index.php', { ...student, status: 'cancelled' }, {
                headers: { 'Content-Type': 'application/json' }
              });
              setToast({ show: true, message: 'Student marked as cancelled', type: 'success' });
              invalidateStudentCache();
              axios.get('http://localhost/Projects/TSU-ID-Scheduling-System/backend/get_students.php')
                .then(response => {
                  setStudents(response.data);
                  localStorage.setItem('admin_students_cache', JSON.stringify({ data: response.data, timestamp: Date.now() }));
                });
            } catch (err) {
              setToast({ show: true, message: 'Failed to mark student as cancelled', type: 'error' });
            }
          },
          payload: null,
          message: 'Are you sure you want to mark this student as cancelled?'
        });
    };

    const handleReschedule = (student) => {
        setRescheduleStudent(student);
        setRescheduleDate(student.schedule_date || '');
        setRescheduleTime(student.schedule_time || '8:00am - 9:00am');
        setShowRescheduleModal(true);
    };

    const handleRescheduleSave = async () => {
        if (!rescheduleDate || !rescheduleTime) {
            setToast({ show: true, message: 'Please select both date and time', type: 'error' });
            return;
        }

        try {
            await axios.put('http://localhost/Projects/TSU-ID-Scheduling-System/backend/index.php', {
                ...rescheduleStudent,
                schedule_date: rescheduleDate,
                schedule_time: rescheduleTime,
                status: 'pending'
            }, {
                headers: { 'Content-Type': 'application/json' }
            });
            
            setToast({ show: true, message: 'Student rescheduled successfully', type: 'success' });
            setShowRescheduleModal(false);
            setRescheduleStudent(null);
            setRescheduleDate('');
            setRescheduleTime('8:00am - 9:00am');
            
            invalidateStudentCache();
            axios.get('http://localhost/Projects/TSU-ID-Scheduling-System/backend/get_students.php')
                .then(response => {
                    setStudents(response.data);
                    localStorage.setItem('admin_students_cache', JSON.stringify({ data: response.data, timestamp: Date.now() }));
                });
        } catch (err) {
            setToast({ show: true, message: 'Failed to reschedule student', type: 'error' });
        }
    };

    const handleRescheduleCancel = () => {
        setShowRescheduleModal(false);
        setRescheduleStudent(null);
        setRescheduleDate('');
        setRescheduleTime('8:00am - 9:00am');
    };

    const handleDateChange = (e) => {
        // Convert HTML date input (YYYY-MM-DD) to database format (Month Day, Year)
        const date = new Date(e.target.value);
        const formattedDate = date.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        });
        setRescheduleDate(formattedDate);
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

    // Calculate pagination with sliding window
    const getPaginationRange = () => {
        const windowSize = 5; // Show 5 page numbers at a time
        const halfWindow = Math.floor(windowSize / 2);
        
        let startPage = Math.max(1, page - halfWindow);
        let endPage = Math.min(totalPages, startPage + windowSize - 1);
        
        // Adjust start if we're near the end
        if (endPage - startPage < windowSize - 1) {
            startPage = Math.max(1, endPage - windowSize + 1);
        }
        
        return { startPage, endPage };
    };

    const { startPage, endPage } = getPaginationRange();

    // Add loading when time changes
    const handleTimeChange = (newTime) => {
        setSelectedTime(newTime);
        // Only show loading if a specific date is selected and time is not "No Time Chosen"
        if (currentScheduleDate !== "No Date Chosen" && newTime !== "No Time Chosen") {
            setIsFiltering(true);
            setTimeout(() => setIsFiltering(false), 1500);
        }
    };

    return (
        <div className="w-screen h-screen flex">
            {/* Loading Overlay - Initial Load */}
            {isLoading && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-12 flex flex-col items-center shadow-xl">
                        <img src={kuruKuru} alt="Loading..." className="w-24 h-24 mb-6" />
                        <p className="text-2xl font-semibold text-gray-700 mb-2">Loading students...</p>
                        <p className="text-sm text-gray-500">Please wait while we fetch the data</p>
                    </div>
                </div>
            )}

            {/* Filtering Overlay - When changing date/time */}
            {isFiltering && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
                    <div className="bg-white rounded-lg p-10 flex flex-col items-center shadow-xl">
                        <img src={kuruKuru} alt="Filtering..." className="w-20 h-20 mb-4" />
                        <p className="text-xl font-semibold text-gray-700 mb-2">Filtering students...</p>
                        <p className="text-base text-gray-500">
                            {currentScheduleDate !== "No Date Chosen" 
                                ? `${currentScheduleDate}, ${selectedTime}` 
                                : 'Loading all students...'}
                        </p>
                    </div>
                </div>
            )}

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
            {/* Calendar Modal */}
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

                {/* Generate List Popup - Improved Design */}
                {showList && (
                    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-20">
                        <div className="bg-white p-8 rounded-lg shadow-xl w-96 flex flex-col justify-center items-center border-2 border-gray-200">
                            <h1 className="text-3xl font-bold mb-6 text-gray-800">Generate List</h1>
                            
                            {currentScheduleDate === "No Date Chosen" ? (
                                <div className="text-center mb-6">
                                    <p className="text-lg text-gray-600 mb-2">Generate complete student list</p>
                                    <p className="text-sm text-gray-500">All students will be included in the download</p>
                                </div>
                            ) : (
                                <div className="text-center mb-6">
                                    <p className="text-lg text-gray-600 mb-2">Generate filtered list</p>
                                    <div className="bg-gray-100 p-4 rounded-lg">
                                        <p className="text-sm font-semibold text-gray-700">Date: {currentScheduleDate}</p>
                                        <p className="text-sm font-semibold text-gray-700">Time: {selectedTime}</p>
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex gap-4">
                            <button
                                onClick={handleDownloadList}
                                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 transition-colors"
                                >
                                    Download CSV
                                </button>
                                <button
                                    onClick={() => setShowList(false)}
                                    className="px-6 py-3 bg-gray-400 text-white rounded-lg font-bold text-lg hover:bg-gray-500 transition-colors"
                                >
                                    Cancel
                            </button>
                            </div>
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

            {/* Reschedule Modal */}
            {showRescheduleModal && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-30">
                    <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center w-96 relative">
                        <h2 className="text-2xl font-bold mb-4">Reschedule Student</h2>
                        <div className="w-full mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                                <strong>Student:</strong> {rescheduleStudent?.fullname}
                            </p>
                            <p className="text-sm text-gray-600 mb-4">
                                <strong>Student Number:</strong> {rescheduleStudent?.student_number}
                            </p>
                        </div>
                        
                        <div className="w-full mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Date
                            </label>
                            <input
                                type="date"
                                onChange={handleDateChange}
                                className="border border-gray-400 rounded-lg px-4 py-2 w-full"
                                required
                            />
                            {rescheduleDate && (
                                <p className="text-sm text-gray-600 mt-1">
                                    Selected: {rescheduleDate}
                                </p>
                            )}
                        </div>

                        <div className="w-full mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Time
                            </label>
                            <select
                                value={rescheduleTime}
                                onChange={(e) => setRescheduleTime(e.target.value)}
                                className="border border-gray-400 rounded-lg px-4 py-2 w-full"
                                required
                            >
                                <option value="8:00am - 9:00am">8:00am - 9:00am</option>
                                <option value="9:00am - 10:00am">9:00am - 10:00am</option>
                                <option value="10:00am - 11:00am">10:00am - 11:00am</option>
                                <option value="11:00am - 12:00pm">11:00am - 12:00pm</option>
                                <option value="1:00pm - 2:00pm">1:00pm - 2:00pm</option>
                                <option value="2:00pm - 3:00pm">2:00pm - 3:00pm</option>
                                <option value="3:00pm - 4:00pm">3:00pm - 4:00pm</option>
                                <option value="4:00pm - 5:00pm">4:00pm - 5:00pm</option>
                            </select>
                        </div>

                        <div className="flex justify-center gap-4 w-full">
                            <button
                                onClick={handleRescheduleSave}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold text-lg hover:bg-green-800"
                            >
                                Reschedule
                            </button>
                            <button
                                onClick={handleRescheduleCancel}
                                className="bg-gray-400 text-white px-6 py-2 rounded-lg font-bold text-lg hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Sidebar */}
            <div className="w-3/12 h-screen relative flex flex-col justify-center items-center gap-5">
                <h1 className="absolute border-2 left-0 top-10 text-2xl px-14 py-1 bg-[#971212] text-white">Admin</h1>
                <h1 className="text-3xl ml-12 font-bold">Scheduled Time</h1>
                <CustomDropdown selectedTime={selectedTime} setSelectedTime={handleTimeChange} />

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

                {/* Show All Students Button */}
                <div className="flex flex-col items-center gap-2 mt-4 ml-12">
                    <button
                        onClick={() => {
                            setIsFiltering(true);
                            setCurrentScheduleDate("No Date Chosen");
                            setSelectedTime("No Time Chosen");
                            setTimeout(() => setIsFiltering(false), 2000);
                        }}
                        className="w-fit text-center duration-150 text-white rounded-md hover:border-2 border-2 hover:text-bold
                         hover:border-[#AC0000] hover:text-[#AC0000] hover:bg-[#f5f5f5] bg-[#AC0000] px-25 py-2 text-lg"
                    >
                        Show All Students
                    </button>
                </div>

                {/* Generate List Button - Consistent with other buttons */}
                <div className="flex flex-col items-center gap-2 mt-4 ml-12">
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

            {/* Main Content Area */}
            <div className="w-9/12 h-screen flex flex-col">
                {/* Table Container - Fixed height with scroll */}
                <div className="flex-1 flex flex-col p-6">
                    {/* Filter Status Indicator */}
                    <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                        <p className="text-sm text-gray-600">
                            <strong>Current Filter:</strong> 
                            {currentScheduleDate === "No Date Chosen" 
                                ? " Showing all students" 
                                : ` ${currentScheduleDate}${selectedTime !== "No Time Chosen" ? `, ${selectedTime}` : ''}`}
                            {filterStatus !== 'all' && ` | Status: ${filterStatus}`}
                            {search && ` | Search: "${search}"`}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Showing {filteredStudents.length} of {students.filter(s => s.id !== 1).length} students
                            {currentScheduleDate !== "No Date Chosen" && 
                                (selectedTime !== "No Time Chosen" ? ' for selected date/time' : ' for selected date')}
                        </p>
                    </div>

                    {/* Search and Filter Controls */}
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
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    {/* Table with fixed height and scroll */}
                    <div className="flex-1 overflow-hidden flex flex-col">
                        <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-center border border-gray-300">
                                <thead className="bg-[#971212] text-white text-lg sticky top-0">
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
                                    {paginatedStudents.length > 0 ? (
                                paginatedStudents.map((student, index) => (
                                    <tr key={index} className="hover:bg-gray-100">
                                        {editRowId === student.id ? (
                                            <>
                                                <td className="py-2 border"><input name="fullname" value={editData.fullname} onChange={handleEditChange} className="border p-1 rounded w-full" /></td>
                                                <td className="py-2 border"><input name="student_number" value={editData.student_number} onChange={handleEditChange} className="border p-1 rounded w-full" /></td>
                                                <td className="py-2 border">{editData.schedule_date}</td>
                                                <td className="py-2 border">{editData.schedule_time}</td>
                                                <td className="py-2 border">
                                                    <span className={
                                                        editData.status === 'done' ? 'bg-green-200 text-green-800 px-2 py-1 rounded' : 
                                                        editData.status === 'cancelled' ? 'bg-red-200 text-red-800 px-2 py-1 rounded' :
                                                        'bg-yellow-200 text-yellow-800 px-2 py-1 rounded'
                                                    }>
                                                    {editData.status || 'pending'}
                                                </span>
                                                </td>
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
                                                        <span className={
                                                            student.status === 'done' ? 'bg-green-200 text-green-800 px-2 py-1 rounded' : 
                                                            student.status === 'cancelled' ? 'bg-red-200 text-red-800 px-2 py-1 rounded' :
                                                            'bg-yellow-200 text-yellow-800 px-2 py-1 rounded'
                                                        }>
                                                        {student.status || 'pending'}
                                                    </span>
                                                </td>
                                                <td className="py-2 border flex gap-2 justify-center">
                                                    <button onClick={() => handleEditClick(student)} className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-800">Edit</button>
                                                    <button onClick={() => handleDelete(student.id)} className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-800">Delete</button>
                                                    <button onClick={() => handleToggleStatus(student)} className={student.status === 'done' ? 'bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-700' : 'bg-green-500 text-white px-2 py-1 rounded hover:bg-green-700'}>
                                                        {student.status === 'done' ? 'Mark Pending' : 'Mark Done'}
                                                    </button>
                                                        {student.status !== 'cancelled' && (
                                                            <button onClick={() => handleMarkCancelled(student)} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700">
                                                                Mark Cancelled
                                                            </button>
                                                        )}
                                                        {student.status === 'cancelled' && (
                                                            <button onClick={() => handleReschedule(student)} className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-700">
                                                                Reschedule
                                                            </button>
                                                        )}
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-4 text-gray-400">
                                                {currentScheduleDate === "No Date Chosen" 
                                                    ? "No students found matching your search criteria." 
                                                    : `No students found for ${currentScheduleDate}, ${selectedTime}.`}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                        </div>

                        {/* Pagination - Always at bottom */}
                    {totalPages > 1 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex flex-col items-center gap-2">
                                    {/* Page info */}
                                    <div className="text-sm text-gray-600">
                                        Page {page} of {totalPages} • Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, filteredStudents.length)} of {filteredStudents.length} students
                                    </div>
                                    
                                    {/* Pagination buttons */}
                                    <div className="flex justify-center items-center gap-2">
                                        {/* Previous button */}
                            <button
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                                            className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-bold disabled:opacity-50 hover:bg-gray-300"
                            >
                                &lt;
                            </button>
                                        
                                        {/* First page (if not in current window) */}
                                        {startPage > 1 && (
                                            <>
                                                <button
                                                    onClick={() => setPage(1)}
                                                    className="px-3 py-1 rounded bg-gray-100 text-gray-700 font-bold hover:bg-gray-200"
                                                >
                                                    1
                                                </button>
                                                {startPage > 2 && (
                                                    <span className="px-2 text-gray-500">...</span>
                                                )}
                                            </>
                                        )}
                                        
                                        {/* Page numbers in current window */}
                                        {Array.from({ length: endPage - startPage + 1 }, (_, i) => {
                                            const pageNum = startPage + i;
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setPage(pageNum)}
                                                    className={`px-3 py-1 rounded font-bold ${
                                                        page === pageNum 
                                                            ? 'bg-[#971212] text-white' 
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                        
                                        {/* Last page (if not in current window) */}
                                        {endPage < totalPages && (
                                            <>
                                                {endPage < totalPages - 1 && (
                                                    <span className="px-2 text-gray-500">...</span>
                                                )}
                                <button
                                                    onClick={() => setPage(totalPages)}
                                                    className="px-3 py-1 rounded bg-gray-100 text-gray-700 font-bold hover:bg-gray-200"
                                >
                                                    {totalPages}
                                </button>
                                            </>
                                        )}
                                        
                                        {/* Next button */}
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={page === totalPages}
                                            className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-bold disabled:opacity-50 hover:bg-gray-300"
                            >
                                &gt;
                            </button>
                                    </div>
                                </div>
                        </div>
                    )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
