// API Service Layer
// This service handles all API calls and can switch between real backend and mock data

import axios from 'axios';
import mockApi from './mockApi.js';

// Environment configuration
const isMockMode = import.meta.env.VITE_USE_MOCK_API === 'true' || 
                   localStorage.getItem('useMockApi') === 'true';

// Base URL for real backend
const BASE_URL = 'http://localhost/Projects/TSU-ID-Scheduling-System/backend';

// Real API functions
const realApi = {
  // Login endpoint
  async login(credentials) {
    const response = await axios.post(`${BASE_URL}/login.php`, credentials);
    return response.data;
  },

  // Registration endpoint
  async register(registrationData) {
    const response = await axios.post(`${BASE_URL}/register.php`, registrationData, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  // Get all students (admin endpoint)
  async getStudents() {
    const response = await axios.get(`${BASE_URL}/get_students.php`);
    return response.data;
  },

  // Get single student
  async getStudent(id) {
    const response = await axios.get(`${BASE_URL}/get_student.php?id=${id}`);
    return response.data;
  },

  // Update student (admin endpoint)
  async updateStudent(updateData) {
    const response = await axios.put(`${BASE_URL}/index.php`, updateData, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  // Delete student (admin endpoint)
  async deleteStudent(id) {
    const response = await axios.delete(`${BASE_URL}/index.php`, {
      data: { id },
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  // Update admin credentials
  async updateAdmin(adminData) {
    const response = await axios.post(`${BASE_URL}/update_admin.php`, adminData);
    return response.data;
  },

  // Get slot count
  async getSlotCount(date, time) {
    const response = await axios.get(`${BASE_URL}/get_slot_count.php`, {
      params: { schedule_date: date, schedule_time: time }
    });
    return response.data;
  },

  // Book appointment
  async bookAppointment(bookingData) {
    const response = await axios.post(`${BASE_URL}/booking.php`, bookingData, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  }
};

// API Service that switches between real and mock
export const apiService = {
  // Login endpoint
  async login(credentials) {
    console.log(`[API Service] Using ${isMockMode ? 'MOCK' : 'REAL'} API for login`);
    return isMockMode ? mockApi.login(credentials) : realApi.login(credentials);
  },

  // Registration endpoint
  async register(registrationData) {
    console.log(`[API Service] Using ${isMockMode ? 'MOCK' : 'REAL'} API for registration`);
    return isMockMode ? mockApi.register(registrationData) : realApi.register(registrationData);
  },

  // Get all students (admin endpoint)
  async getStudents() {
    console.log(`[API Service] Using ${isMockMode ? 'MOCK' : 'REAL'} API for getStudents`);
    return isMockMode ? mockApi.getStudents() : realApi.getStudents();
  },

  // Get single student
  async getStudent(id) {
    console.log(`[API Service] Using ${isMockMode ? 'MOCK' : 'REAL'} API for getStudent`);
    return isMockMode ? mockApi.getStudent(id) : realApi.getStudent(id);
  },

  // Update student (admin endpoint)
  async updateStudent(updateData) {
    console.log(`[API Service] Using ${isMockMode ? 'MOCK' : 'REAL'} API for updateStudent`);
    return isMockMode ? mockApi.updateStudent(updateData) : realApi.updateStudent(updateData);
  },

  // Delete student (admin endpoint)
  async deleteStudent(id) {
    console.log(`[API Service] Using ${isMockMode ? 'MOCK' : 'REAL'} API for deleteStudent`);
    return isMockMode ? mockApi.deleteStudent(id) : realApi.deleteStudent(id);
  },

  // Update admin credentials
  async updateAdmin(adminData) {
    console.log(`[API Service] Using ${isMockMode ? 'MOCK' : 'REAL'} API for updateAdmin`);
    return isMockMode ? mockApi.updateAdmin(adminData) : realApi.updateAdmin(adminData);
  },

  // Get slot count
  async getSlotCount(date, time) {
    console.log(`[API Service] Using ${isMockMode ? 'MOCK' : 'REAL'} API for getSlotCount`);
    return isMockMode ? mockApi.getSlotCount(date, time) : realApi.getSlotCount(date, time);
  },

  // Book appointment
  async bookAppointment(bookingData) {
    console.log(`[API Service] Using ${isMockMode ? 'MOCK' : 'REAL'} API for bookAppointment`);
    return isMockMode ? mockApi.bookAppointment(bookingData) : realApi.bookAppointment(bookingData);
  },

  // Reschedule student (admin endpoint)
  async rescheduleStudent(rescheduleData) {
    console.log(`[API Service] Using ${isMockMode ? 'MOCK' : 'REAL'} API for rescheduleStudent`);
    return isMockMode ? mockApi.updateStudent(rescheduleData) : realApi.updateStudent(rescheduleData);
  },

  // Utility function to toggle between mock and real API
  toggleMockMode() {
    const newMode = !isMockMode;
    localStorage.setItem('useMockApi', newMode.toString());
    window.location.reload(); // Reload to apply changes
  },

  // Get current mode
  getCurrentMode() {
    return isMockMode ? 'mock' : 'real';
  }
};

export default apiService; 