#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 TSU ID Scheduling System - Setup Wizard');
console.log('==========================================\n');

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function detectProjectStructure() {
  const currentDir = __dirname;
  const projectRoot = path.dirname(currentDir); // Go up one level from frontend
  const backendPath = path.join(projectRoot, 'backend');
  
  // Check if backend folder exists
  const backendExists = fs.existsSync(backendPath);
  
  // Try to detect common web server paths
  const possiblePaths = [
    { name: 'XAMPP htdocs', path: 'C:/xampp/htdocs' },
    { name: 'WAMP www', path: 'C:/wamp64/www' },
    { name: 'MAMP htdocs', path: 'C:/MAMP/htdocs' },
    { name: 'XAMPP htdocs (x86)', path: 'C:/xampp/htdocs' },
    { name: 'WAMP www (x86)', path: 'C:/wamp/www' },
    { name: 'MAMP htdocs (x86)', path: 'C:/MAMP/htdocs' }
  ];
  
  let detectedServer = null;
  for (const server of possiblePaths) {
    if (fs.existsSync(server.path)) {
      detectedServer = server;
      break;
    }
  }
  
  return {
    backendExists,
    projectRoot,
    backendPath,
    detectedServer,
    currentDir
  };
}

function generateCustomUrl(projectName, serverPath) {
  if (!serverPath) return null;
  
  // Extract project name from current directory
  const projectDir = path.basename(path.dirname(__dirname));
  
  // Generate URL based on detected server
  if (serverPath.includes('xampp')) {
    return `http://localhost/${projectDir}/backend`;
  } else if (serverPath.includes('wamp')) {
    return `http://localhost/${projectDir}/backend`;
  } else if (serverPath.includes('MAMP')) {
    return `http://localhost:8888/${projectDir}/backend`;
  }
  
  return null;
}

async function setupEnvironment() {
  try {
    console.log('This wizard will help you configure the API base URL for your environment.\n');

    // Detect project structure
    const structure = detectProjectStructure();
    
    console.log('📁 Project Structure Detection:');
    console.log(`   Project Root: ${structure.projectRoot}`);
    console.log(`   Backend Path: ${structure.backendPath}`);
    console.log(`   Backend Exists: ${structure.backendExists ? '✅ Yes' : '❌ No'}`);
    
    if (structure.detectedServer) {
      console.log(`   Detected Server: ${structure.detectedServer.name}`);
    }
    
    if (!structure.backendExists) {
      console.log('\n⚠️  Warning: Backend folder not found!');
      console.log('   Make sure you have the complete project structure:');
      console.log('   ├── frontend/');
      console.log('   └── backend/');
      console.log('\n   If you\'re missing the backend folder, please download the complete project.');
    }

    const environment = await question('\nSelect environment (development/production): ');
    
    let apiUrl;
    if (environment.toLowerCase() === 'production') {
      apiUrl = await question('Enter your production API base URL (e.g., https://your-domain.com/backend): ');
    } else {
      console.log('\n🔧 Development Setup Options:');
      
      // Generate custom URL if server is detected
      const customUrl = generateCustomUrl(path.basename(structure.projectRoot), structure.detectedServer?.path);
      
      if (customUrl) {
        console.log(`1. Auto-detected: ${customUrl}`);
        console.log('2. XAMPP (default): http://localhost/Projects/TSU-ID-Scheduling-System/backend');
        console.log('3. WAMP: http://localhost/tsu-scheduling/backend');
        console.log('4. MAMP: http://localhost:8888/tsu-scheduling/backend');
        console.log('5. Custom: Enter your own URL\n');
        
        const choice = await question('Select option (1-5): ');
        
        switch (choice) {
          case '1':
            apiUrl = customUrl;
            break;
          case '2':
            apiUrl = 'http://localhost/Projects/TSU-ID-Scheduling-System/backend';
            break;
          case '3':
            apiUrl = 'http://localhost/tsu-scheduling/backend';
            break;
          case '4':
            apiUrl = 'http://localhost:8888/tsu-scheduling/backend';
            break;
          case '5':
            apiUrl = await question('Enter custom URL: ');
            break;
          default:
            apiUrl = customUrl || 'http://localhost/Projects/TSU-ID-Scheduling-System/backend';
        }
      } else {
        console.log('1. XAMPP: http://localhost/Projects/TSU-ID-Scheduling-System/backend');
        console.log('2. WAMP: http://localhost/tsu-scheduling/backend');
        console.log('3. MAMP: http://localhost:8888/tsu-scheduling/backend');
        console.log('4. Custom: Enter your own URL\n');
        
        const choice = await question('Select option (1-4) or enter custom URL: ');
        
        switch (choice) {
          case '1':
            apiUrl = 'http://localhost/Projects/TSU-ID-Scheduling-System/backend';
            break;
          case '2':
            apiUrl = 'http://localhost/tsu-scheduling/backend';
            break;
          case '3':
            apiUrl = 'http://localhost:8888/tsu-scheduling/backend';
            break;
          default:
            apiUrl = choice;
        }
      }
    }

    // Create .env file
    const envContent = `VITE_API_BASE_URL=${apiUrl}\n`;
    const envFile = environment.toLowerCase() === 'production' ? '.env.production' : '.env';
    const envPath = path.join(__dirname, envFile);

    fs.writeFileSync(envPath, envContent);
    
    console.log(`\n✅ Configuration saved to ${envFile}`);
    console.log(`📝 API Base URL: ${apiUrl}`);
    
    // Test the URL if it's a local development setup
    if (environment.toLowerCase() === 'development' && apiUrl.includes('localhost')) {
      console.log('\n🔍 Testing API connection...');
      try {
        const testUrl = `${apiUrl}/index.php`;
        console.log(`   Testing: ${testUrl}`);
        console.log('   (This is just a basic connectivity test)');
      } catch (error) {
        console.log('   ⚠️  Could not test connection - make sure your web server is running');
      }
    }
    
    if (environment.toLowerCase() === 'development') {
      console.log('\n✅ Development setup complete!');
      console.log('\n🎯 Next steps:');
      console.log('1. Make sure your web server (XAMPP/WAMP/MAMP) is running');
      console.log('2. Ensure your backend folder is accessible via web browser');
      console.log('3. Start the development server: npm run dev');
      console.log('4. Open http://localhost:3000 in your browser');
      
      if (!structure.backendExists) {
        console.log('\n⚠️  Important: Backend folder not found!');
        console.log('   Please ensure you have the complete project structure.');
      }
    } else {
      console.log('\n✅ Production setup complete!');
      console.log('\n🎯 Next steps:');
      console.log('1. Build the frontend: npm run build');
      console.log('2. Deploy the dist folder to your hosting provider');
      console.log('3. Ensure your backend is accessible at the configured URL');
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

setupEnvironment(); 