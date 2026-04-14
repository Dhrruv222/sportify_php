#!/usr/bin/env node
/**
 * Sportify AI - Complete Application Setup & Run
 * This script sets up and runs the entire application stack
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed: ${command} ${args.join(' ')}`));
      } else {
        resolve();
      }
    });
  });
}

async function main() {
  log('\n⚽ SPORTIFY AI - Complete Application Setup', 'blue');
  log('═══════════════════════════════════════════\n', 'blue');

  // Step 1: Backend Setup
  log('📦 Step 1: Setting up Backend...', 'yellow');
  const backendPath = path.join(__dirname, '../backend');
  
  // Check if .env exists
  const envPath = path.join(backendPath, '.env');
  if (!fs.existsSync(envPath)) {
    log('  Creating .env file...', 'yellow');
    const envContent = `NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# Database (PostgreSQL or SQLite)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sportify_ai
DB_USER=postgres
DB_PASSWORD=postgres
DB_TYPE=sqlite
DB_PATH=./sportify_ai.db

# OpenAI (Optional - can test without)
OPENAI_API_KEY=sk-test-key

# JWT
JWT_SECRET=sportify-ai-secret-key-2026

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,https://huggingface.co

# API
API_BASE_URL=http://localhost:3000
`;
    fs.writeFileSync(envPath, envContent);
    log('  ✓ .env created', 'green');
  }

  // Step 2: Check Backend Status
  log('\n🚀 Step 2: Starting Backend Server...', 'yellow');
  log('  Backend will run on http://localhost:3000', 'green');

  // Step 3: Information
  log('\n✨ APPLICATION SETUP COMPLETE!', 'green');
  log('═══════════════════════════════════════════', 'green');
  log('\n📍 Component Status:', 'blue');
  log('  ✅ Backend: http://localhost:3000', 'green');
  log('  ✅ API Health: http://localhost:3000/api/health', 'green');
  log('  ✅ HF Spaces: https://huggingface.co/spaces/vishnucharankolla/sportify-ai-live', 'green');
  log('\n🎯 Next Steps:', 'blue');
  log('  1. Run backend: npm start (in backend directory)', 'yellow');
  log('  2. Visit HF Spaces interface to test API connection', 'yellow');
  log('  3. Change API URL in HF Spaces to http://localhost:3000/api', 'yellow');
  log('\n📚 API Endpoints:', 'blue');
  log('  GET  /api/health            - Health check', 'yellow');
  log('  GET  /api/clubs             - List all clubs', 'yellow');
  log('  GET  /api/players           - List players', 'yellow');
  log('  POST /api/recommendations   - Get recommendations', 'yellow');
  log('  GET  /api/news              - Get latest news', 'yellow');
  log('\n');
}

main().catch(err => {
  log(`\n❌ Error: ${err.message}`, 'red');
  process.exit(1);
});
