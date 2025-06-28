// API Configuration for different environments
const config = {
  // Development environment (local)
  development: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost/Projects/TSU-ID-Scheduling-System/backend',
  },
  // Production environment (deployed)
  production: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://your-domain.com/backend',
  }
};

// Get current environment
const environment = import.meta.env.MODE || 'development';

// Export the appropriate configuration
export const apiConfig = config[environment] || config.development;

// Helper function to build full API URLs
export const buildApiUrl = (endpoint) => {
  const baseURL = apiConfig.baseURL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseURL}${cleanEndpoint}`;
};

// Common API endpoints
export const API_ENDPOINTS = {
  LOGIN: 'login.php',
  REGISTER: 'register.php',
  GET_STUDENTS: 'get_students.php',
  GET_STUDENT: 'get_student.php',
  GET_SLOT_COUNT: 'get_slot_count.php',
  BOOKING: 'booking.php',
  UPDATE_ADMIN: 'update_admin.php',
  INDEX: 'index.php',
  CONFIRM_SLOT: 'confirm_slot.php',
};

export default apiConfig; 