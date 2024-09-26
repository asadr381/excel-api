const fetch = require('node-fetch');
const express = require('express');
const app = express();

const CLIENT_ID = 'gA6mdvAvD2A7RgNLAWvxCviPX31GPSlh2FJ31dUEToDBXniS';
const CLIENT_SECRET = 'Hj3uIkWUkECfxOIUovhlfPO6JoSpueEJ57D08GxzcEgmRSGEWLZ9RJfm6spjOCUG';

// Function to get the OAuth token
async function getAuthToken() {
  const response = await fetch('https://onlinetools.ups.com/security/v1/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
    },
    body: new URLSearchParams({
      'grant_type': 'client_credentials'
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Failed to obtain access token:', errorData);
    throw new Error('Failed to obtain access token');
  }

  const data = await response.json();
  return data.access_token;
}

// Function to track a shipment and return JSON data
async function trackShipment(inquiryNumber) {
  const authToken = await getAuthToken();

  const query = new URLSearchParams({
    locale: 'en_US',
    returnSignature: 'false',
    returnMilestones: 'false',
    returnPOD: 'false'
  }).toString();

  const response = await fetch(
    `https://onlinetools.ups.com/api/track/v1/details/${inquiryNumber}?${query}`,
    {
      method: 'GET',
      headers: {
        'transId': 'string',
        'transactionSrc': 'testing',
        'Authorization': `Bearer ${authToken}`
      }
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error('API Error:', errorData);
    return errorData;
  }

  const data = await response.json();
  return data;
}

app.get('/track/:inquiryNumber', async (req, res) => {
  try {
    const trackingData = await trackShipment(req.params.inquiryNumber);
    res.json(trackingData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
