# TSU ID Scheduling System - Deployment Guide

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Production Deployment](#production-deployment)
3. [Environment Configuration](#environment-configuration)
4. [Troubleshooting](#troubleshooting)

## Local Development Setup

### Prerequisites
- Node.js (v16 or higher)
- PHP (v7.4 or higher)
- Web server (Apache/Nginx) or XAMPP/WAMP
- Git

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment configuration:
   ```bash
   # Create .env file in frontend directory
   echo "VITE_API_BASE_URL=http://localhost/your-path-to-backend" > .env
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Place the `backend` folder in your web server directory (e.g., `htdocs` for XAMPP)
2. Configure your database in `backend/config.php`
3. Import the database schema from `backend/database/schema.sql`
4. Ensure PHP has proper permissions to read/write files

### Configuration Examples

#### For XAMPP (Windows):
```env
VITE_API_BASE_URL=http://localhost/Projects/TSU-ID-Scheduling-System/backend
```

#### For WAMP (Windows):
```env
VITE_API_BASE_URL=http://localhost/tsu-scheduling/backend
```

#### For MAMP (Mac):
```env
VITE_API_BASE_URL=http://localhost:8888/tsu-scheduling/backend
```

#### For Linux Apache:
```env
VITE_API_BASE_URL=http://localhost/tsu-scheduling/backend
```

## Production Deployment

### Frontend Deployment

#### Option 1: Static Hosting (Netlify, Vercel, GitHub Pages)
1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Create production environment file:
   ```bash
   # Create .env.production file
   echo "VITE_API_BASE_URL=https://your-domain.com/backend" > .env.production
   ```

3. Deploy the `dist` folder to your hosting provider

#### Option 2: Traditional Web Server
1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Upload the contents of the `dist` folder to your web server's public directory

### Backend Deployment

#### Shared Hosting
1. Upload the `backend` folder to your hosting provider
2. Update database configuration in `backend/config.php`
3. Import the database schema
4. Set proper file permissions (644 for files, 755 for directories)

#### VPS/Dedicated Server
1. Install LAMP/LEMP stack
2. Upload backend files to `/var/www/html/` or your preferred directory
3. Configure virtual host to point to the backend directory
4. Set up SSL certificate for HTTPS
5. Configure database and update `config.php`

### Production Environment Configuration

#### Frontend (.env.production)
```env
VITE_API_BASE_URL=https://your-domain.com/backend
```

#### Backend Configuration
Update `backend/config.php` with production database credentials:
```php
<?php
define('DB_HOST', 'your-production-db-host');
define('DB_NAME', 'your-production-db-name');
define('DB_USER', 'your-production-db-user');
define('DB_PASS', 'your-production-db-password');
?>
```

## Environment Configuration

### Development vs Production

The system automatically detects the environment:
- **Development**: Uses `VITE_API_BASE_URL` from `.env` file
- **Production**: Uses `VITE_API_BASE_URL` from `.env.production` file

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Base URL for API endpoints | `http://localhost/backend` |

### Configuration Priority
1. Environment variable `VITE_API_BASE_URL`
2. Default development URL
3. Default production URL

## Troubleshooting

### Common Issues

#### 1. Network Error in Frontend
**Problem**: Frontend can't connect to backend
**Solution**: 
- Check if backend URL is correct in `.env` file
- Ensure backend server is running
- Check CORS configuration in backend
- Verify network connectivity

#### 2. CORS Errors
**Problem**: Browser blocks requests due to CORS policy
**Solution**:
- Add CORS headers to backend PHP files
- Ensure frontend and backend are on same domain in production
- Use proxy configuration in development

#### 3. Database Connection Issues
**Problem**: Backend can't connect to database
**Solution**:
- Verify database credentials in `config.php`
- Check if database server is running
- Ensure database exists and schema is imported
- Check network connectivity to database

#### 4. File Permission Issues
**Problem**: PHP can't read/write files
**Solution**:
- Set proper file permissions (644 for files, 755 for directories)
- Ensure web server user has access to files
- Check SELinux settings (if applicable)

### Debug Mode

Enable debug mode by adding to your `.env` file:
```env
VITE_DEBUG=true
```

This will show more detailed error messages in the console.

### Logs

Check these locations for error logs:
- **Frontend**: Browser console (F12)
- **Backend**: Web server error logs
- **Database**: Database server logs

## Security Considerations

### Production Checklist
- [ ] Use HTTPS for all communications
- [ ] Set secure database credentials
- [ ] Enable CORS only for necessary domains
- [ ] Set proper file permissions
- [ ] Use environment variables for sensitive data
- [ ] Regularly update dependencies
- [ ] Implement rate limiting
- [ ] Set up monitoring and logging

### SSL Certificate
For production, ensure you have a valid SSL certificate:
- Let's Encrypt (free)
- Commercial certificates
- Self-signed (development only)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review error logs
3. Verify configuration files
4. Test with a simple API endpoint
5. Check network connectivity

For additional help, refer to the project documentation or create an issue in the repository. 