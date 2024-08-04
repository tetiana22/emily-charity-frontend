// api.js
import axios from 'axios';

// Constants
const BASE_URL = 'https://emily-charity.onrender.com';
const TOKEN = 'Bearer sandbox_QbpEJylc3XRJ4iE8qe1axWfIGQ4k_H_bxfs3lkQt';

// Function to create a PayPal order
export const createPayPalOrder = async amount => {
  try {
    const response = await axios.post(`${BASE_URL}/create-paypal-order`, {
      amount,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    throw error;
  }
};

// Function to create a GoCardless billing request
export const createGoCardlessBillingRequest = async (
  email,
  givenName,
  familyName,
  amount
) => {
  try {
    const response = await fetch(`${BASE_URL}/create-billing-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: TOKEN,
      },
      body: JSON.stringify({
        email,
        given_name: givenName,
        family_name: familyName,
        amount,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.billing_requests.id;
  } catch (error) {
    console.error('Error creating GoCardless billing request:', error);
    throw error;
  }
};

// Function to create a GoCardless billing request flow
export const createGoCardlessBillingRequestFlow = async billingRequestId => {
  try {
    const response = await fetch(`${BASE_URL}/create-billing-request-flow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: TOKEN,
      },
      body: JSON.stringify({ billingRequestId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.billing_request_flows.authorisation_url;
  } catch (error) {
    console.error('Error creating GoCardless billing request flow:', error);
    throw error;
  }
};
