let step = 'amount';
let amount = '';
let paymentMethod = '';

function selectAmount(selectedAmount) {
  amount = selectedAmount;
}

function continueToDetails() {
  const customAmount = document.getElementById('custom-amount').value;
  if (amount || customAmount) {
    amount = amount || customAmount;
    document.getElementById('amount-selection').classList.add('hidden');
    document.getElementById('payment-details').classList.remove('hidden');
  } else {
    document.getElementById('amount-message').textContent =
      'Please select or enter an amount.';
  }
}

function setPaymentMethod(method) {
  paymentMethod = method;
  document.getElementById('donation-form').classList.remove('hidden');
}

async function handleSubmit(event) {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const givenName = document.getElementById('given-name').value;
  const familyName = document.getElementById('family-name').value;
  const paymentMessage = document.getElementById('payment-message');

  if (!givenName || !email) {
    paymentMessage.textContent = 'Please enter both your name and email.';
    return;
  }

  const donationAmount = parseFloat(amount);
  if (isNaN(donationAmount) || donationAmount <= 0) {
    paymentMessage.textContent = 'Please enter a valid amount.';
    return;
  }

  try {
    if (paymentMethod === 'paypal') {
      const response = await createPayPalOrder(donationAmount.toFixed(2));

      if (response.links) {
        const approvalLink = response.links.find(
          link => link.rel === 'approve'
        )?.href;
        if (approvalLink) {
          window.location.href = approvalLink;
        } else {
          throw new Error('Approval link not found in PayPal response.');
        }
      } else {
        throw new Error('Invalid PayPal response format.');
      }
    } else if (paymentMethod === 'gocardless') {
      const billingRequestId = await createGoCardlessBillingRequest(
        email,
        givenName,
        familyName,
        donationAmount
      );
      const redirectUrl = await createGoCardlessBillingRequestFlow(
        billingRequestId
      );

      paymentMessage.innerHTML = `<div>
        <p>Click the link below to complete your donation of $${donationAmount}: <br>
        <a href="${redirectUrl}" target="_blank" rel="noopener noreferrer">Complete Donation</a></p>
      </div>`;
    } else {
      paymentMessage.textContent = 'Please select a payment method.';
    }
  } catch (error) {
    console.error('Error:', error.message || error);
    paymentMessage.textContent =
      'Error processing donation. Please try again later.';
  }
}

async function createPayPalOrder(amount) {
  // Placeholder function for creating a PayPal order.
  return { links: [{ rel: 'approve', href: 'https://paypal.com/approval' }] };
}

async function createGoCardlessBillingRequest(
  email,
  givenName,
  familyName,
  amount
) {
  // Placeholder function for creating a GoCardless billing request.
  return 'billingRequestId';
}

async function createGoCardlessBillingRequestFlow(billingRequestId) {
  // Placeholder function for creating a GoCardless billing request flow.
  return 'https://gocardless.com/redirect';
}
