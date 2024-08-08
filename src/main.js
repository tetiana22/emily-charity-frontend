import {
  createPayPalOrder,
  createGoCardlessBillingRequest,
  createGoCardlessBillingRequestFlow,
} from './api.js';
import './css/styles.css';

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

  setupMenu();
}

function setupMenu() {
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
        mobileNav.classList.remove('show');
        overlay.classList.remove('show');
      }
    });
  }
}

export function selectAmount(selectedAmount) {
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
    amount = customAmount;
  }

  if (amount) {
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

    const paymentButtons = {
      paypal: document.getElementById('paypal'),
      gocardless: document.getElementById('gocardless'),
    };

    Object.keys(paymentButtons).forEach(key => {
      const btn = paymentButtons[key];
      btn.classList.remove('hidden');
      btn.classList.remove('active');
    });

    const form = document.getElementById('donation-form');
    if (form) {
      form.reset();
      form.classList.add('hidden');
    }

    const title = document.querySelector('#payment-details .title');
    if (title) title.classList.remove('hidden');
    document.getElementById('custom-amount').value = '';
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
  const customAmountInput = document.getElementById('custom-amount').value;

  // Якщо користувач ввів значення вручну, оновлюємо amount
  if (customAmountInput) {
    amount = customAmountInput;
  }

  // Перевірка, чи введені ім'я та email
  if (!givenName || !email) {
    paymentMessage.textContent = 'Please enter both your name and email.';
    return;
  }

  // Перевірка суми пожертвування
  const donationAmount = parseFloat(amount);
  if (isNaN(donationAmount) || donationAmount <= 0) {
    paymentMessage.textContent = 'Please enter a valid amount.';
    return;
  }

  // Перевірка, чи вибрано спосіб оплати
  if (!paymentMethod) {
    paymentMessage.textContent = 'Please select a payment method.';
    return;
  }

  // Всі дані валідні, починаємо процес обробки платежу
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
          <a href="${redirectUrl}" target="_blank" rel="noopener noreferrer" style="color: blue;" onclick="closeModal()">Complete Donation</a></p>
        </div>`;
    }
  } catch (error) {
    console.error('Error:', error.message || error);
    paymentMessage.textContent =
      'Error processing donation. Please try again later.';
  }
}
/*counter*/
document.addEventListener('DOMContentLoaded', function () {
  const counters = document.querySelectorAll('.count');

  // Функція для анімації чисел
  function animateCounter(counter, target) {
    let count = 0;
    const speed = 200; // Швидкість анімації, чим менше значення, тим швидше анімація
    const isCurrency = counter
      .closest('.raised-info-each')
      .querySelector('span')
      .textContent.startsWith('£');

    // Оновлює значення чисел
    const interval = setInterval(() => {
      count += Math.ceil(target / speed); // Збільшуємо значення
      if (count >= target) {
        count = target;
        clearInterval(interval); // Зупиняємо анімацію, коли досягнуто кінцеве значення
      }
      counter.textContent = isCurrency
        ? `£ ${count.toLocaleString()}`
        : count.toLocaleString(); // Оновлюємо текст чисел з форматуванням
    }, 1);
  }

  // Функція для перевірки видимості елемента і запуску анімації
  function handleScroll() {
    const scrollPosition = window.innerHeight + window.scrollY; // Позиція скролу
    counters.forEach(counter => {
      const rect = counter.getBoundingClientRect();
      if (
        rect.top < scrollPosition &&
        !counter.classList.contains('animated')
      ) {
        const target = parseInt(
          counter.parentElement.getAttribute('data-target')
        ); // Отримання кінцевого значення
        animateCounter(counter, target);
        counter.classList.add('animated'); // Додаємо клас для позначення того, що анімація вже була запущена
      }
    });
  }

  // Додаємо подію прокручування для запуску анімації
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Запускаємо анімацію при завантаженні сторінки
});

document.addEventListener('DOMContentLoaded', () => {
  initializeDonationPage();
});
