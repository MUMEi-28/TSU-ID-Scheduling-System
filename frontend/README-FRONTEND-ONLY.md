# TSU ID Scheduling System - Frontend Only Development

This guide is for frontend developers who want to work on the TSU ID Scheduling System without needing the backend server running.

## 🚀 Quick Start

### Option 1: Use Mock Mode (Recommended)
```bash
# Start development server with mock API enabled
npm run dev:frontend-only
# or
npm run dev:mock
```

### Option 2: Toggle Between Real and Mock API
```bash
# Start normal development server
npm run dev

# Then use the API Mode Toggle in the bottom-right corner
# or press Ctrl+Shift+M to switch between modes
```

## 🔧 Mock API Features

The mock API system provides realistic data and responses for all backend endpoints:

### Available Mock Data
- **Students**: 3 sample students with different statuses (pending, done)
- **Admin User**: Login with `ADMIN-001` / `Admin User`
- **Slot Counts**: Realistic availability data for different dates and times
- **Time Slots**: 8 time slots from 8:00 AM to 5:00 PM

### Mock API Endpoints
- `POST /login.php` - Student and admin login
- `POST /register.php` - Student registration
- `GET /get_students.php` - Get all students (admin)
- `GET /get_student.php` - Get single student
- `PUT /index.php` - Update student (admin)
- `DELETE /index.php` - Delete student (admin)
- `POST /update_admin.php` - Update admin credentials
- `GET /get_slot_count.php` - Get slot availability
- `POST /booking.php` - Book appointment

## 🎯 Testing Scenarios

### Student Registration Flow
1. Fill out registration form with any name and student number
2. Select date and time
3. Submit registration
4. See success animation and receipt

### Admin Login
- **Credentials**: `ADMIN-001` / `Admin User`
- Navigate to `/admin` to see admin dashboard
- Manage students, update statuses, reschedule appointments

### Existing User Scenarios
- **Done Status**: Login with `Jane Smith` / `2021-0002` to see completed appointment
- **Pending Status**: Login with `John Doe` / `2021-0001` to see pending appointment

### Slot Availability Testing
- Some slots are pre-filled to test "full" scenarios
- December 15, 2024: 9:00 AM slot is full (12/12)
- December 16, 2024: Multiple slots are full
- Other dates have varying availability

## 🛠️ Development Tools

### API Mode Toggle
- **Location**: Bottom-right corner of the screen (development mode only)
- **Keyboard Shortcut**: `Ctrl+Shift+M`
- **Function**: Switch between mock and real API modes
- **Persistence**: Mode is saved in localStorage

### Console Logging
- All API calls are logged to console with mode indicator
- Format: `[API Service] Using MOCK/REAL API for [endpoint]`

## 📁 File Structure

```
frontend/src/
├── services/
│   ├── apiService.js      # Main API service layer
│   └── mockApi.js         # Mock API implementation
├── Components/
│   ├── DevTools/
│   │   └── ApiModeToggle.jsx  # Development toggle component
│   └── ...                # Other components
└── App.jsx                # Main app with API toggle
```

## 🔄 Switching Between Modes

### Environment Variables
```bash
# Enable mock mode via environment variable
VITE_USE_MOCK_API=true npm run dev
```

### Runtime Toggle
1. Use the API Mode Toggle component
2. Press `Ctrl+Shift+M`
3. Refresh the page to apply changes

### localStorage
```javascript
// Enable mock mode
localStorage.setItem('useMockApi', 'true');

// Disable mock mode
localStorage.setItem('useMockApi', 'false');

// Reload page to apply
window.location.reload();
```

## 🎨 Customizing Mock Data

### Adding New Students
Edit `frontend/src/services/mockApi.js`:

```javascript
let mockStudents = [
  // ... existing students
  {
    id: 4,
    fullname: "New Student",
    student_number: "2021-0004",
    schedule_date: "December 18, 2024",
    schedule_time: "10:00am-11:00am",
    status: "pending",
    created_at: "2024-12-10 14:30:00"
  }
];
```

### Modifying Slot Counts
```javascript
const mockSlotCounts = {
  "December 18, 2024": {
    "8:00am - 9:00am": 5,
    "9:00am -10:00am": 8,
    // ... other time slots
  }
};
```

## 🚨 Important Notes

### Data Persistence
- Mock data is stored in memory and resets on page refresh
- localStorage is used for user progress and API mode preference
- No data is sent to or received from the backend in mock mode

### Network Requests
- All API calls are intercepted and handled locally
- No actual HTTP requests are made to the backend
- Simulated delays are added for realistic user experience

### Error Handling
- Mock API includes error scenarios for testing
- Network errors are simulated for robust testing
- Error messages match real backend responses

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Manual Testing Checklist
- [ ] Student registration flow
- [ ] Admin login and dashboard
- [ ] Date and time selection
- [ ] Slot availability display
- [ ] Error handling scenarios
- [ ] API mode switching
- [ ] Responsive design
- [ ] Loading states and animations

## 🔗 Related Files

- `package.json` - Scripts for different modes
- `vite.config.mock.js` - Mock-specific Vite configuration
- `env.mock` - Environment variables for mock mode

## 📞 Support

For questions about the frontend-only setup:
1. Check the console for API service logs
2. Verify mock mode is enabled
3. Clear localStorage if needed
4. Check the API Mode Toggle component

---

**Happy coding! 🎉** 