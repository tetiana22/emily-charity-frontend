import {
  createPayPalOrder,
  createGoCardlessBillingRequest,
  createGoCardlessBillingRequestFlow,
} from './api.js';
import './css/styles.css';

let scrollPosition = 0;
let amount = '';
let paymentMethod = '';
let modalContentBackup = null;
window.openModal = openModal;

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
      if (event.target === modal) closeModal();
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
  buttons.forEach(btn =>
    btn.classList.toggle(
      'active',
      btn.textContent.includes(`£${selectedAmount}`)
    )
  );
}

export function continueToDetails() {
  const customAmount = document.getElementById('custom-amount').value;
  amount = customAmount || amount;
  if (amount) {
    document.getElementById('amount-selection').classList.add('hidden');
    openModal();
  } else {
    document.getElementById('amount-message').textContent =
      'Please select or enter an amount.';
  }
}

export function setPaymentMethod(method) {
  paymentMethod = method;
  const paymentButtons = document.querySelectorAll('#paypal, #gocardless');
  paymentButtons.forEach(btn => {
    btn.classList.toggle('active', btn.id === method);
    btn.classList.toggle('hidden', btn.id !== method);
  });

  const form = document.getElementById('donation-form');
  const title = document.querySelector('#payment-details .title');

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

  amount = customAmountInput || amount;

  if (!givenName || !email) {
    paymentMessage.textContent = 'Please enter both your name and email.';
    return;
  }

  const donationAmount = parseFloat(amount);
  if (isNaN(donationAmount) || donationAmount <= 0) {
    paymentMessage.textContent = 'Please enter a valid amount.';
    return;
  }

  if (!paymentMethod) {
    paymentMessage.textContent = 'Please select a payment method.';
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
          <a href="${redirectUrl}" target="_blank" rel="noopener noreferrer" style="color: blue;" onclick="closeModal()">Complete Donation</a></p>
        </div>`;
    }
  } catch (error) {
    console.error('Error:', error.message || error);
    paymentMessage.textContent =
      'Error processing donation. Please try again later.';
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

export function openModal() {
  const modal = document.getElementById('payment-modal');
  const paymentMessage = document.getElementById('payment-message');

  if (modal) {
    if (!modalContentBackup) {
      modalContentBackup = modal.cloneNode(true);
    }
    if (paymentMessage) {
      paymentMessage.textContent = '';
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

    const paymentButtons = document.querySelectorAll('#paypal, #gocardless');
    paymentButtons.forEach(btn => {
      btn.classList.remove('hidden', 'active');
    });

    const form = document.getElementById('donation-form');
    if (form) {
      form.reset();
      form.classList.add('hidden');
    }

    const title = document.querySelector('#payment-details .title');
    if (title) title.classList.remove('hidden');

    const amountSelection = document.getElementById('amount-selection');
    if (amountSelection) amountSelection.classList.remove('hidden'); // Показуємо знову вибір суми

    const paymentMessage = document.getElementById('payment-message');
    if (paymentMessage) paymentMessage.textContent = '';

    document.getElementById('custom-amount').value = '';
  } else {
    console.error('Modal element not found.');
  }
}

/*about-img*/
document.querySelectorAll('.about-img img').forEach(img => {
  img.addEventListener('click', function () {
    const fullscreenImg = document.createElement('img');
    fullscreenImg.src = this.src;
    fullscreenImg.classList.add('fullscreen-img');
    document.body.appendChild(fullscreenImg);

    fullscreenImg.addEventListener('click', function () {
      document.body.removeChild(fullscreenImg);
    });
  });
});
/*about-text*/
document.addEventListener('DOMContentLoaded', () => {
  const aboutText = document.querySelector('.about-text');
  const readMoreBtn = document.querySelector('.read-more');

  const showLessBtn = document.createElement('a');
  showLessBtn.href = '#';
  showLessBtn.className = 'read-less';
  showLessBtn.textContent = 'Read Less';
  showLessBtn.style.display = 'none';
  readMoreBtn.parentNode.insertBefore(showLessBtn, readMoreBtn.nextSibling);

  readMoreBtn.addEventListener('click', e => {
    e.preventDefault();
    aboutText.style.maxHeight = 'none';
    aboutText.style.display = 'block';
    readMoreBtn.style.display = 'none';
    showLessBtn.style.display = 'inline';
  });

  showLessBtn.addEventListener('click', e => {
    e.preventDefault();
    aboutText.style.maxHeight = '100px';
    readMoreBtn.style.display = 'inline';
    showLessBtn.style.display = 'none';
  });
});

/* Counter */
document.addEventListener('DOMContentLoaded', () => {
  const counters = document.querySelectorAll('.count');

  function animateCounter(counter, target) {
    let count = 0;
    const speed = 400;
    const isCurrency = counter
      .closest('.raised-info-each')
      .querySelector('span')
      .textContent.startsWith('£');

    const interval = setInterval(() => {
      count += Math.ceil(target / speed);
      if (count >= target) {
        count = target;
        clearInterval(interval);
      }
      counter.textContent = isCurrency
        ? `£ ${count.toLocaleString()}`
        : count.toLocaleString();
    }, 1);
  }

  function handleScroll() {
    const scrollPosition = window.innerHeight + window.scrollY;
    counters.forEach(counter => {
      const rect = counter.getBoundingClientRect();
      if (
        rect.top < scrollPosition &&
        !counter.classList.contains('animated')
      ) {
        const target = parseInt(
          counter.parentElement.getAttribute('data-target')
        );
        animateCounter(counter, target);
        counter.classList.add('animated');
      }
    });
  }

  window.addEventListener('scroll', handleScroll);
  handleScroll();
});

/* Lightbox */
document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelector('.slides');
  const images = slides.querySelectorAll('img');
  const prev = document.querySelector('.prev');
  const next = document.querySelector('.next');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.querySelector('.lightbox-content');
  const closeLightbox = document.querySelector('.lightbox .close');
  const indicators = document.querySelector('.indicators');
  let currentIndex = 0;
  let slideInterval;

  const lightboxPrev = document.createElement('div');
  const lightboxNext = document.createElement('div');

  lightboxPrev.classList.add('lightbox-prev');
  lightboxNext.classList.add('lightbox-next');

  lightboxPrev.innerHTML = '&#10094;';
  lightboxNext.innerHTML = '&#10095;';

  lightbox.appendChild(lightboxPrev);
  lightbox.appendChild(lightboxNext);

  images.forEach((img, index) => {
    const dot = document.createElement('span');
    dot.classList.add('dot');
    dot.addEventListener('click', () => goToSlide(index));
    indicators.appendChild(dot);
  });

  const dots = indicators.querySelectorAll('.dot');

  function updateSlidePosition() {
    slides.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach(dot =>
      dot.classList.toggle(
        'active',
        dot.classList.contains('dot') && dot === dots[currentIndex]
      )
    );
  }

  function goToPrevSlide() {
    currentIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    updateSlidePosition();
    resetSlideShow();
  }

  function goToNextSlide() {
    currentIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    updateSlidePosition();
    resetSlideShow();
  }

  function goToSlide(index) {
    currentIndex = index;
    updateSlidePosition();
    resetSlideShow();
  }

  function openLightbox(index) {
    currentIndex = index;
    lightbox.style.display = 'block';
    lightboxImg.src = images[currentIndex].src;
  }

  function showNextImage() {
    currentIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    lightboxImg.src = images[currentIndex].src;
  }

  function showPrevImage() {
    currentIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    lightboxImg.src = images[currentIndex].src;
  }

  function startSlideShow() {
    slideInterval = setInterval(goToNextSlide, 3000);
  }

  function resetSlideShow() {
    clearInterval(slideInterval);
    startSlideShow();
  }

  prev.addEventListener('touchstart', goToPrevSlide);
  next.addEventListener('touchstart', goToNextSlide);
  prev.addEventListener('click', goToPrevSlide);
  next.addEventListener('click', goToNextSlide);

  lightboxPrev.addEventListener('click', showPrevImage);
  lightboxNext.addEventListener('click', showNextImage);

  closeLightbox.addEventListener('click', () => {
    lightbox.style.display = 'none';
  });

  window.addEventListener('click', event => {
    if (event.target === lightbox) lightbox.style.display = 'none';
  });

  document.addEventListener('keydown', event => {
    if (lightbox.style.display === 'block') {
      if (event.key === 'ArrowRight') showNextImage();
      if (event.key === 'ArrowLeft') showPrevImage();
      if (event.key === 'Escape') lightbox.style.display = 'none';
    } else {
      if (event.key === 'ArrowLeft') goToPrevSlide();
      if (event.key === 'ArrowRight') goToNextSlide();
    }
  });

  images.forEach((img, index) => {
    img.addEventListener('click', () => openLightbox(index));
  });

  startSlideShow();
});

/* Lazy Loading */
document.addEventListener('DOMContentLoaded', () => {
  const lazyImages = document.querySelectorAll('img.lazy');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const image = entry.target;
          image.src = image.dataset.src;
          image.classList.remove('lazy');
          imageObserver.unobserve(image);
        }
      });
    });

    lazyImages.forEach(image => imageObserver.observe(image));
  } else {
    lazyImages.forEach(image => {
      image.src = image.dataset.src;
      image.classList.remove('lazy');
    });
  }
});
console.log('initializeDonationPage called');
console.log('openModal function:', window.openModal);
document.addEventListener('DOMContentLoaded', initializeDonationPage);
