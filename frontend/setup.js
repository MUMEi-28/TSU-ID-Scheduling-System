#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

async function setupEnvironment() {
  try {
    console.log('This wizard will help you configure the API base URL for your environment.\n');

    const environment = await question('Select environment (development/production): ');
    
    let apiUrl;
    if (environment.toLowerCase() === 'production') {
      apiUrl = await question('Enter your production API base URL (e.g., https://your-domain.com/backend): ');
    } else {
      console.log('\nCommon local development URLs:');
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

    // Create .env file
    const envContent = `VITE_API_BASE_URL=${apiUrl}\n`;
    const envFile = environment.toLowerCase() === 'production' ? '.env.production' : '.env';
    const envPath = path.join(__dirname, envFile);

    fs.writeFileSync(envPath, envContent);
    
    console.log(`\n✅ Configuration saved to ${envFile}`);
    console.log(`📝 API Base URL: ${apiUrl}`);
    
    if (environment.toLowerCase() === 'development') {
      console.log('\n🎯 Next steps:');
      console.log('1. Make sure your backend is running');
      console.log('2. Start the development server: npm run dev');
      console.log('3. Open http://localhost:3000 in your browser');
    } else {
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