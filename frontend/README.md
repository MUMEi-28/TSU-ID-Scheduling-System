# TSU ID Scheduling System - Frontend

This is the frontend application for the TSU ID Scheduling System, built with React and Vite.

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure your environment:
   ```bash
   npm run setup
   ```
   
   This will guide you through setting up the API base URL for your environment.

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

### Environment Variables

The application uses environment variables to configure the API base URL:

- **Development**: Create a `.env` file in the frontend directory
- **Production**: Create a `.env.production` file in the frontend directory

Example `.env` file:
```env
VITE_API_BASE_URL=http://localhost/Projects/TSU-ID-Scheduling-System/backend
```

### Common Configuration Examples

#### XAMPP (Windows)
```env
VITE_API_BASE_URL=http://localhost/Projects/TSU-ID-Scheduling-System/backend
```

#### WAMP (Windows)
```env
VITE_API_BASE_URL=http://localhost/tsu-scheduling/backend
```

#### MAMP (Mac)
```env
VITE_API_BASE_URL=http://localhost:8888/tsu-scheduling/backend
```

#### Production
```env
VITE_API_BASE_URL=https://your-domain.com/backend
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run setup` - Configure environment

## Project Structure

```
src/
├── Components/          # React components
│   ├── Admin/          # Admin-related components
│   ├── Student/        # Student-related components
│   └── Error/          # Error pages
├── config/             # Configuration files
│   └── api.js          # API configuration
├── App.jsx             # Main application component
└── main.jsx            # Application entry point
```

## API Configuration

The application uses a centralized API configuration system located in `src/config/api.js`. This system:

- Automatically detects the environment (development/production)
- Uses environment variables for configuration
- Provides helper functions for building API URLs
- Maintains a list of all API endpoints

### Usage

```javascript
import { buildApiUrl, API_ENDPOINTS } from './config/api';

// Make API calls
const response = await axios.post(buildApiUrl(API_ENDPOINTS.LOGIN), data);
```

## Troubleshooting

### Network Errors
If you encounter network errors:

1. Check your `.env` file configuration
2. Ensure the backend server is running
3. Verify the API base URL is correct
4. Check CORS configuration in the backend

### Common Issues

1. **"Cannot connect to backend"**
   - Verify the backend URL in your `.env` file
   - Ensure the backend server is running
   - Check if the backend is accessible from your browser

2. **CORS errors**
   - Ensure frontend and backend are on the same domain in production
   - Check CORS headers in backend PHP files

3. **Environment not detected**
   - Make sure you have the correct `.env` file
   - Restart the development server after changing environment variables

## Deployment

For deployment instructions, see the main [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) in the project root.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the TSU ID Scheduling System.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Frontend Testing

This project uses Jest and React Testing Library for unit/component tests.

### How to Run Tests

1. Install dependencies (if not already):
   npm install

2. Run all tests:
   npm test

Test files are located alongside components, e.g. `src/Components/Admin/AdminPage.test.jsx`.
