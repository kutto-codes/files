const API_BASE_URL = window.location.origin || 'http://localhost:3000';
const CART_STORAGE_KEY = 'velouraCart';
const loginModal = document.getElementById('loginModal');
const loginButtons = document.querySelectorAll('#openLogin, #openLoginSecondary');
const closeLoginButton = document.querySelector('.close-modal');
const backdrop = document.querySelector('.modal-backdrop');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const signupNameInput = document.getElementById('signupName');
const signupEmailInput = document.getElementById('signupEmail');
const signupPasswordInput = document.getElementById('signupPassword');
const yearLabel = document.getElementById('year');
const filterButtons = document.querySelectorAll('.filter-btn');
const productGrid = document.querySelector('.product-grid');
const productCards = document.querySelectorAll('.product-card');
const authTabs = document.querySelectorAll('.auth-tab');
const authForms = document.querySelectorAll('.auth-form');

function setLoggedInState(user) {
  const loggedInButtons = document.querySelectorAll('.ghost-button, .cart-button');
  loggedInButtons.forEach((button) => {
    if (button.textContent && button.textContent.toLowerCase().includes('login')) {
      button.textContent = `Hi, ${user.name}`;
      button.setAttribute('href', '#');
      button.style.pointerEvents = 'none';
    }
  });
}

function getCartItems() {
  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function saveCartItems(items) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

function syncCartButtonLabel() {
  const cartButtons = document.querySelectorAll('.cart-button');
  const itemCount = getCartItems().length;

  cartButtons.forEach((button) => {
    button.textContent = `Cart (${itemCount})`;
  });
}

function addToCart(product, size = 'M', color = 'Sand') {
  const cart = getCartItems();
  const item = {
    id: product.id,
    name: product.name,
    price: Number(product.price),
    category: product.category,
    image: product.image,
    size,
    color,
    quantity: 1
  };

  const existingItem = cart.find((entry) => entry.id === item.id && entry.size === item.size && entry.color === item.color);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push(item);
  }

  saveCartItems(cart);
  syncCartButtonLabel();
}

function renderCartPage() {
  const cartContainer = document.querySelector('.cart-items');
  const summaryBox = document.querySelector('.summary-box');

  if (!cartContainer || !summaryBox) return;

  const items = getCartItems();

  if (!items.length) {
    cartContainer.innerHTML = '<p class="empty-state">Your cart is empty. Start shopping to add your favourites.</p>';
    summaryBox.innerHTML = `
      <h2>Order summary</h2>
      <div class="summary-row"><span>Subtotal</span><strong>$0</strong></div>
      <div class="summary-row"><span>Shipping</span><strong>Free</strong></div>
      <div class="summary-row total"><span>Total</span><strong>$0</strong></div>
      <a class="primary-button wide" href="shop.html">Continue shopping</a>
    `;
    syncCartButtonLabel();
    return;
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartContainer.innerHTML = items.map((item) => `
    <article class="cart-item">
      <div class="cart-thumb" style="background-image: url('${item.image}')"></div>
      <div class="cart-details">
        <h2>${item.name}</h2>
        <p>${item.category} • Size ${item.size} • ${item.color}</p>
        <div class="cart-meta">
          <span>$${item.price * item.quantity}</span>
          <button type="button" data-remove-id="${item.id}" data-remove-size="${item.size}" data-remove-color="${item.color}">Remove</button>
        </div>
      </div>
    </article>
  `).join('');

  summaryBox.innerHTML = `
    <h2>Order summary</h2>
    <div class="summary-row"><span>Subtotal</span><strong>$${subtotal}</strong></div>
    <div class="summary-row"><span>Shipping</span><strong>Free</strong></div>
    <div class="summary-row total"><span>Total</span><strong>$${subtotal}</strong></div>
    <button class="primary-button wide" type="button">Checkout</button>
  `;

  summaryBox.querySelectorAll('[data-remove-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const remaining = getCartItems().filter((entry) => !(entry.id === Number(button.dataset.removeId) && entry.size === button.dataset.removeSize && entry.color === button.dataset.removeColor));
      saveCartItems(remaining);
      renderCartPage();
    });
  });
}

async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/api/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Login failed');
  }

  localStorage.setItem('velouraUser', JSON.stringify(result.user));
  setLoggedInState(result.user);
  return result;
}

async function signupUser(name, email, password) {
  const response = await fetch(`${API_BASE_URL}/api/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, email, password })
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Signup failed');
  }

  localStorage.setItem('velouraUser', JSON.stringify(result.user));
  setLoggedInState(result.user);
  return result;
}

function populateLoggedInUser() {
  const storedUser = localStorage.getItem('velouraUser');
  if (!storedUser) return;

  const user = JSON.parse(storedUser);
  setLoggedInState(user);
}

if (loginModal && loginButtons.length) {
  function openLoginModal() {
    loginModal.classList.remove('hidden');
    loginModal.setAttribute('aria-hidden', 'false');
    if (emailInput) emailInput.focus();
  }

  function closeLoginModal() {
    loginModal.classList.add('hidden');
    loginModal.setAttribute('aria-hidden', 'true');
  }

  loginButtons.forEach((button) => {
    button.addEventListener('click', openLoginModal);
  });

  if (closeLoginButton) closeLoginButton.addEventListener('click', closeLoginModal);
  if (backdrop) backdrop.addEventListener('click', closeLoginModal);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !loginModal.classList.contains('hidden')) {
      closeLoginModal();
    }
  });

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const email = emailInput?.value.trim();
      const password = passwordInput?.value.trim();

      if (!email || !password) {
        return;
      }

      try {
        const result = await loginUser(email, password);

        loginButtons.forEach((button) => {
          button.textContent = `Hi, ${result.user.name}`;
          button.disabled = true;
          button.style.opacity = '0.9';
        });

        if (closeLoginButton) closeLoginModal();
        loginForm.reset();
      } catch (error) {
        alert(error.message);
      }
    });
  }
}

if (authTabs.length && authForms.length) {
  authTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.authTab;

      authTabs.forEach((item) => item.classList.toggle('active', item === tab));
      authForms.forEach((form) => {
        form.classList.toggle('active', form.dataset.authForm === target);
      });
    });
  });
}

if (signupForm) {
  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = signupNameInput?.value.trim();
    const email = signupEmailInput?.value.trim();
    const password = signupPasswordInput?.value.trim();

    if (!name || !email || !password) {
      alert('Please fill in your name, email, and password.');
      return;
    }

    try {
      const result = await signupUser(name, email, password);
      alert(result.message || 'Account created successfully');
      signupForm.reset();
      localStorage.setItem('velouraUser', JSON.stringify(result.user));
      window.location.href = 'shop.html';
    } catch (error) {
      alert(error.message);
    }
  });
}

if (yearLabel) {
  yearLabel.textContent = new Date().getFullYear();
}

async function loadProducts() {
  if (!productGrid) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/products`);
    const data = await response.json();
    const products = Array.isArray(data.products) ? data.products : [];

    if (!products.length) {
      productGrid.innerHTML = '<p class="empty-state">No products available right now.</p>';
      return;
    }

    productGrid.innerHTML = products.map((product) => `
      <article class="product-card" data-category="${product.category}">
        <div class="product-image" style="background-image: url('${product.image}')"></div>
        <div class="product-info">
          <span class="tag tag-new">${product.tag}</span>
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <div class="product-meta">
            <strong>$${product.price}</strong>
            <span>${product.category}</span>
          </div>
          <a class="product-link" href="product.html?id=${product.id}">View details</a>
        </div>
      </article>
    `).join('');

    const renderedCards = document.querySelectorAll('.product-card');
    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const selectedFilter = button.dataset.filter;

        filterButtons.forEach((item) => item.classList.toggle('active', item === button));

        renderedCards.forEach((card) => {
          const shouldShow = selectedFilter === 'all' || card.dataset.category === selectedFilter;
          card.style.display = shouldShow ? 'block' : 'none';
        });
      });
    });
  } catch (error) {
    productGrid.innerHTML = '<p class="empty-state">Could not load products. Please try again later.</p>';
  }
}

async function loadProductDetails() {
  const detailContainer = document.querySelector('.product-detail-copy');
  if (!detailContainer) return;

  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id') || '1';

  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);
    const data = await response.json();
    const product = data.product;

    if (!product) {
      detailContainer.innerHTML = '<p>Product not found.</p>';
      return;
    }

    window.currentProduct = product;

    const imagePanel = document.querySelector('.product-detail-image');
    if (imagePanel) {
      imagePanel.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.2)), url('${product.image}')`;
    }

    const detailTitle = document.querySelector('.product-detail-copy h1');
    const productTag = document.querySelector('.eyebrow.dark');
    const rating = document.querySelector('.rating-row');
    const priceRow = document.querySelector('.price-row');
    const description = document.querySelector('.product-detail-copy p');

    if (detailTitle) detailTitle.textContent = product.name;
    if (productTag) productTag.textContent = `${product.category} collection`;
    if (rating) rating.innerHTML = '<span>★★★★★</span><span>4.9 / 5</span>';
    if (priceRow) priceRow.innerHTML = `<strong>$${product.price}</strong><span>$${product.price + 31}</span>`;
    if (description) description.textContent = product.description;

    const infoList = document.querySelector('.info-block ul');
    if (infoList) {
      infoList.innerHTML = `
        <li>Breathable ${product.category === 'shoes' ? 'comfort' : 'linen'} blend</li>
        <li>Relaxed fit for all-day comfort</li>
        <li>Lightweight layering for warm weather</li>
        <li>Easy care and machine washable</li>
      `;
    }

    const addToCartButton = document.querySelector('.detail-actions .primary-button');
    if (addToCartButton) {
      addToCartButton.addEventListener('click', () => {
        addToCart(product, 'M', 'Sand');
        window.location.href = 'cart.html';
      });
    }
  } catch (error) {
    detailContainer.innerHTML = '<p>Unable to load product details.</p>';
  }
}

syncCartButtonLabel();
populateLoggedInUser();
loadProducts();
loadProductDetails();
renderCartPage();
