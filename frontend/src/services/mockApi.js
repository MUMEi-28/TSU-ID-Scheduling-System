// Mock API Service for Frontend-Only Development
// This file simulates all backend API responses when working without the backend

// Mock data storage (simulates database)
let mockStudents = [
  {
    id: 1,
    fullname: "John Doe",
    student_number: "2021-0001",
    schedule_date: "December 15, 2024",
    schedule_time: "9:00am -10:00am",
    status: "pending",
    created_at: "2024-12-10 10:30:00"
  },
  {
    id: 2,
    fullname: "Jane Smith",
    student_number: "2021-0002",
    schedule_date: "December 16, 2024",
    schedule_time: "2:00pm - 3:00pm",
    status: "done",
    created_at: "2024-12-10 11:15:00"
  },
  {
    id: 3,
    fullname: "Admin User",
    student_number: "ADMIN-001",
    schedule_date: "December 17, 2024",
    schedule_time: "8:00am - 9:00am",
    status: "pending",
    created_at: "2024-12-10 12:00:00"
  }
];

// Mock slot counts for different dates and times
const mockSlotCounts = {
  "December 15, 2024": {
    "8:00am - 9:00am": 8,
    "9:00am -10:00am": 12, // Full
    "10:00am-11:00am": 5,
    "11:00am-12:00pm": 3,
    "1:00pm - 2:00pm": 7,
    "2:00pm - 3:00pm": 9,
    "3:00pm - 4:00pm": 4,
    "4:00pm - 5:00pm": 6
  },
  "December 16, 2024": {
    "8:00am - 9:00am": 10,
    "9:00am -10:00am": 6,
    "10:00am-11:00am": 12, // Full
    "11:00am-12:00pm": 8,
    "1:00pm - 2:00pm": 12, // Full
    "2:00pm - 3:00pm": 12, // Full
    "3:00pm - 4:00pm": 7,
    "4:00pm - 5:00pm": 5
  },
  "December 17, 2024": {
    "8:00am - 9:00am": 3,
    "9:00am -10:00am": 7,
    "10:00am-11:00am": 9,
    "11:00am-12:00pm": 4,
    "1:00pm - 2:00pm": 8,
    "2:00pm - 3:00pm": 6,
    "3:00pm - 4:00pm": 11,
    "4:00pm - 5:00pm": 2
  }
};

// Helper function to simulate API delay
const simulateDelay = (ms = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Helper function to generate unique ID
const generateId = () => {
  return Math.max(...mockStudents.map(s => s.id), 0) + 1;
};

// Mock API functions
export const mockApi = {
  // Login endpoint
  async login(credentials) {
    await simulateDelay(1000);
    
    // Check if it's admin login
    if (credentials.student_number === "ADMIN-001" && credentials.fullname === "Admin User") {
      return {
        status: 1,
        admin_token: "mock_admin_token_12345",
        is_admin: true,
        message: "Admin login successful"
      };
    }
    
    // Check if user exists
    const existingStudent = mockStudents.find(
      s => s.student_number === credentials.student_number && 
           s.fullname.toLowerCase() === credentials.fullname.toLowerCase()
    );
    
    if (existingStudent) {
      if (existingStudent.status === "done") {
        return {
          status: 2,
          student_data: existingStudent,
          message: "Student has completed their appointment"
        };
      } else if (existingStudent.status === "pending") {
        return {
          status: 1,
          student_token: "mock_student_token_12345",
          student_id: existingStudent.id,
          message: "Login successful"
        };
      }
    }
    
    // New user
    return {
      status: 1,
      student_token: "mock_student_token_12345",
      message: "New user login successful"
    };
  },

  // Registration endpoint
  async register(registrationData) {
    await simulateDelay(1500);
    
    // Check if user already exists
    const existingStudent = mockStudents.find(
      s => s.student_number === registrationData.student_number
    );
    
    if (existingStudent) {
      return {
        status: 0,
        message: "Student already have an account with this student number"
      };
    }
    
    // Create new student
    const newStudent = {
      id: generateId(),
      fullname: registrationData.fullname,
      student_number: registrationData.student_number,
      schedule_date: registrationData.schedule_date,
      schedule_time: registrationData.schedule_time,
      status: "pending",
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    
    mockStudents.push(newStudent);
    
    return {
      status: 1,
      student_id: newStudent.id,
      message: "Registration successful"
    };
  },

  // Get all students (admin endpoint)
  async getStudents() {
    await simulateDelay(800);
    return mockStudents;
  },

  // Get single student
  async getStudent(id) {
    await simulateDelay(500);
    const student = mockStudents.find(s => s.id === parseInt(id));
    
    if (student) {
      return {
        status: 1,
        data: student
      };
    } else {
      return {
        status: 0,
        message: "Student not found"
      };
    }
  },

  // Update student (admin endpoint)
  async updateStudent(updateData) {
    await simulateDelay(1000);
    
    const index = mockStudents.findIndex(s => s.id === updateData.id);
    if (index === -1) {
      throw new Error("Student not found");
    }
    
    mockStudents[index] = {
      ...mockStudents[index],
      fullname: updateData.fullname,
      student_number: updateData.student_number,
      ...(updateData.status && { status: updateData.status }),
      ...(updateData.schedule_date && { schedule_date: updateData.schedule_date }),
      ...(updateData.schedule_time && { schedule_time: updateData.schedule_time })
    };
    
    return {
      status: 1,
      message: "Student updated successfully"
    };
  },

  // Delete student (admin endpoint)
  async deleteStudent(id) {
    await simulateDelay(800);
    
    const index = mockStudents.findIndex(s => s.id === parseInt(id));
    if (index === -1) {
      throw new Error("Student not found");
    }
    
    mockStudents.splice(index, 1);
    
    return {
      status: 1,
      message: "Student deleted successfully"
    };
  },

  // Update admin credentials
  async updateAdmin(adminData) {
    await simulateDelay(1000);
    
    const adminIndex = mockStudents.findIndex(s => s.student_number === "ADMIN-001");
    if (adminIndex !== -1) {
      mockStudents[adminIndex] = {
        ...mockStudents[adminIndex],
        fullname: adminData.fullname,
        student_number: adminData.student_number
      };
    }
    
    return {
      status: 1,
      message: "Admin credentials updated"
    };
  },

  // Get slot count
  async getSlotCount(date, time) {
    await simulateDelay(300);
    
    const dateKey = date;
    const timeKey = time;
    
    if (mockSlotCounts[dateKey] && mockSlotCounts[dateKey][timeKey] !== undefined) {
      return {
        count: mockSlotCounts[dateKey][timeKey]
      };
    }
    
    // Return random count for new dates
    return {
      count: Math.floor(Math.random() * 8)
    };
  },

  // Book appointment
  async bookAppointment(bookingData) {
    await simulateDelay(1200);
    
    // Check if slot is available
    const dateKey = bookingData.schedule_date;
    const timeKey = bookingData.schedule_time;
    
    if (mockSlotCounts[dateKey] && mockSlotCounts[dateKey][timeKey] >= 12) {
      return {
        status: 0,
        message: "Selected time slot is full"
      };
    }
    
    // Update slot count
    if (!mockSlotCounts[dateKey]) {
      mockSlotCounts[dateKey] = {};
    }
    mockSlotCounts[dateKey][timeKey] = (mockSlotCounts[dateKey][timeKey] || 0) + 1;
    
    return {
      status: 1,
      message: "Appointment booked successfully"
    };
  }
};

// Export for use in components
export default mockApi; 