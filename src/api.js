const BASE_URL = 'https://emily-charity-frontend.onrender.com/';
const TOKEN = 'Bearer sandbox_QbpEJylc3XRJ4iE8qe1axWfIGQ4k_H_bxfs3lkQt';

// General  API requests
const apiRequest = async (endpoint, method, body) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: TOKEN,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error with ${endpoint}:`, error);
    throw error;
  }
};

export const createPayPalOrder = amount =>
  apiRequest('create-paypal-order', 'POST', { amount });

export const createGoCardlessBillingRequest = (
  email,
  givenName,
  familyName,
  amount
) =>
  apiRequest('create-billing-request', 'POST', {
    email,
    given_name: givenName,
    family_name: familyName,
    amount,
  }).then(data => data.billing_requests.id);

export const createGoCardlessBillingRequestFlow = billingRequestId =>
  apiRequest('create-billing-request-flow', 'POST', { billingRequestId }).then(
    data => data.billing_request_flows.authorisation_url
  );
