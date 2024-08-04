import {
  createPayPalOrder,
  createGoCardlessBillingRequest,
  createGoCardlessBillingRequestFlow,
} from './api.js';

document.addEventListener('DOMContentLoaded', loadContent);

let scrollPosition = 0;
let previousContent = '';
let amount = '';
let paymentMethod = '';

async function loadContent() {
  try {
    const [donationData, modalData] = await Promise.all([
      fetch('./partials/donation.html').then(response => response.text()),
      fetch('./partials/modal.html').then(response => response.text()),
    ]);

    const contentElement = document.getElementById('content');
    if (contentElement) {
      previousContent = donationData;
      contentElement.innerHTML = donationData + modalData;
      initializeDonationPage();
    } else {
      console.error('Element with ID "content" not found.');
    }
  } catch (error) {
    console.error('Error loading content:', error);
  }
}

function initializeDonationPage() {
  window.selectAmount = selectAmount;
  window.continueToDetails = continueToDetails;
  window.setPaymentMethod = setPaymentMethod;
  window.handleSubmit = handleSubmit;
  window.openModal = openModal;
  window.closeModal = closeModal;

  const modal = document.getElementById('payment-modal');
  const closeBtn = document.querySelector('.close');

  if (modal && closeBtn) {
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', event => {
      if (event.target === modal) {
        closeModal();
      }
    });
  } else {
    console.error('Modal or close button element not found.');
  }
}

function selectAmount(selectedAmount) {
  amount = selectedAmount;
}

function continueToDetails() {
  const customAmount = document.getElementById('custom-amount').value;
  if (amount || customAmount) {
    amount = amount || customAmount;
    document.getElementById('amount-selection').classList.add('hidden');
    openModal();
  } else {
    document.getElementById('amount-message').textContent =
      'Please select or enter an amount.';
  }
}

function handleModalEvent(event) {
  if (
    event.key === 'Escape' ||
    event.target.matches('.payment-modal, .payment-modal .close')
  ) {
    closeModal();
  }
}

function openModal() {
  scrollPosition = window.pageYOffset;
  document.getElementById('payment-modal').style.display = 'block';
  document.getElementById('payment-details').classList.remove('hidden');
  document.addEventListener('keydown', handleModalEvent);
  window.addEventListener('click', handleModalEvent);
}

function closeModal() {
  document.getElementById('payment-modal').style.display = 'none';
  document.body.classList.remove('no-scroll');
  document.removeEventListener('keydown', handleModalEvent);
  window.removeEventListener('click', handleModalEvent);
  document.getElementById('content').innerHTML = previousContent;
  window.scrollTo(0, scrollPosition);
}

function setPaymentMethod(method) {
  paymentMethod = method;
  const paymentButtons = {
    paypal: document.getElementById('paypal'),
    gocardless: document.getElementById('gocardless'),
  };

  const form = document.getElementById('donation-form');
  const title = document.querySelector('#payment-details .title');

  function updateButtonVisibility(selectedMethod) {
    Object.keys(paymentButtons).forEach(key => {
      const btn = paymentButtons[key];
      btn.classList.toggle('active', key === selectedMethod);
      btn.classList.toggle('hidden', key !== selectedMethod);
    });
  }
  updateButtonVisibility(method);
  form.classList.remove('hidden');
  title.classList.add('hidden');
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
      const approvalLink = response.links?.find(
        link => link.rel === 'approve'
      )?.href;
      if (approvalLink) {
        window.location.href = approvalLink;
      } else {
        throw new Error('Approval link not found in PayPal response.');
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
      paymentMessage.innerHTML = `
        <div>
          <p>Click the link below to complete your donation of £${donationAmount}: <br>
          <a href="${redirectUrl}" target="_blank" rel="noopener noreferrer">Complete Donation</a></p>
        </div>
      `;
    } else {
      paymentMessage.textContent = 'Please select a payment method.';
    }
  } catch (error) {
    console.error('Error:', error.message || error);
    paymentMessage.textContent =
      'Error processing donation. Please try again later.';
  }
}
