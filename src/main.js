import {
  createPayPalOrder,
  createGoCardlessBillingRequest,
  createGoCardlessBillingRequestFlow,
} from './api.js';
import page from 'page';
import './css/styles.css';
import './css/donation.css';

let scrollPosition = 0;
let amount = '';
let paymentMethod = '';

export function initializeDonationPage() {
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
/*menu*/
document.addEventListener('DOMContentLoaded', () => {
  const burgerMenu = document.querySelector('.burger-menu');
  const mobileNav = document.querySelector('.mobile-nav');
  const overlay = document.querySelector('.overlay');

  if (burgerMenu && mobileNav && overlay) {
    burgerMenu.addEventListener('click', () => {
      mobileNav.classList.toggle('show');
      overlay.classList.toggle('show');
    });

    overlay.addEventListener('click', () => {
      mobileNav.classList.remove('show');
      overlay.classList.remove('show');
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 760) {
        mobileNav.classList.remove('show'); // Видаляє клас show для mobileNav
        overlay.classList.remove('show'); // Видаляє клас show для overlay
      }
    });
  }
});
export function selectAmount(selectedAmount) {
  // Зберігаємо вибрану суму і оновлюємо поле введення
  amount = selectedAmount;
  document.getElementById('custom-amount').value = amount;
  const buttons = document.querySelectorAll('#amount-selection .btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  const clickedButton = Array.from(buttons).find(btn =>
    btn.textContent.includes(`£${selectedAmount}`)
  );
  if (clickedButton) {
    clickedButton.classList.add('active');
  }
}

export function continueToDetails() {
  const customAmount = document.getElementById('custom-amount').value;
  if (customAmount) {
    amount = customAmount; // Оновлюємо amount на основі введеної суми
  }

  if (amount) {
    document.getElementById('amount-selection').classList.add('hidden');
    openModal();
  } else {
    document.getElementById('amount-message').textContent =
      'Please select or enter an amount.';
  }
}

export function handleModalEvent(event) {
  if (
    event.key === 'Escape' ||
    event.target.matches('.payment-modal, .payment-modal .close')
  ) {
    closeModal();
  }
}

let modalContentBackup = null;

export function openModal() {
  const modal = document.getElementById('payment-modal');
  if (modal) {
    if (!modalContentBackup) {
      modalContentBackup = modal.cloneNode(true);
    }
    scrollPosition = window.pageYOffset;
    modal.style.display = 'block';
    document.getElementById('payment-details').classList.remove('hidden');
    document.addEventListener('keydown', handleModalEvent);
    window.addEventListener('click', handleModalEvent);
  } else {
    console.error('Modal element not found.');
  }
}

export async function closeModal() {
  const modal = document.getElementById('payment-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.classList.remove('no-scroll');
    document.removeEventListener('keydown', handleModalEvent);
    window.removeEventListener('click', handleModalEvent);
    await loadDonationPage();
  } else {
    console.error('Modal element not found.');
  }
}

export function setPaymentMethod(method) {
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
  if (form) form.classList.remove('hidden');
  if (title) title.classList.add('hidden');
}

export async function handleSubmit(event) {
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
      paymentMessage.innerHTML = `<div>
          <p>Click the link below to complete your donation of £${donationAmount}: <br>
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

document.addEventListener('DOMContentLoaded', () => {
  initializeDonationPage();
});
page('/donation', async () => {
  await loadDonationPage();
});

page();

async function loadDonationPage() {
  try {
    const response = await fetch('/donation.html');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const content = await response.text();
    document.body.innerHTML = content;
    initializeDonationPage();
  } catch (error) {
    console.error('Error loading donation page:', error);
  }
}
