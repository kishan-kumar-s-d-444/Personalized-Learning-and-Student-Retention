const { google } = require('googleapis');
const { OAuth2 } = google.auth;

// Replace these with your actual credentials
const CLIENT_ID = '466122187830-vb9s8cnhc6iagva1bkbep4rs6jvsj113.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';
const REFRESH_TOKEN = 'YOUR_REFRESH_TOKEN';

const oauth2Client = new OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

module.exports = oauth2Client;
