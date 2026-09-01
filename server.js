const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const users = [{
  email: 'maria@example.com',
  password: 'secret123',
  name: 'Maria'
}];

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  return next();
});
app.use(express.static(__dirname));

const products = [
  {
    id: 1,
    name: 'Summer Linen Set',
    price: 89,
    category: 'women',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
    description: 'Lightweight feminine layering for office days and warm evenings.',
    tag: 'New'
  },
  {
    id: 2,
    name: 'Classic Cotton Shirt',
    price: 65,
    category: 'men',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80',
    description: 'Smart everyday wear designed for comfort and polished style.',
    tag: 'Hot'
  },
  {
    id: 3,
    name: 'Urban Runner',
    price: 92,
    category: 'shoes',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    description: 'Flexible cushioning and casual style for work, travel, and weekends.',
    tag: 'Sale'
  },
  {
    id: 4,
    name: 'Playtime Set',
    price: 46,
    category: 'kids',
    image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=900&q=80',
    description: 'Soft fabrics and cheerful colours made for active little explorers.',
    tag: 'New'
  },
  {
    id: 5,
    name: 'Evening Wrap Dress',
    price: 110,
    category: 'women',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80',
    description: 'Comfortable elegance with a flattering silhouette for memorable nights.',
    tag: 'Popular'
  },
  {
    id: 6,
    name: 'Relaxed Trousers',
    price: 72,
    category: 'men',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
    description: 'Tailored fit with breathable cotton for daily comfort and movement.',
    tag: 'Clearance'
  },
  {
    id: 7,
    name: 'Leather Smart Loafers',
    price: 130,
    category: 'shoes',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=80',
    description: 'Refined style for formal events, office wear, and smart casual outfits.',
    tag: 'Fresh'
  },
  {
    id: 8,
    name: 'School Essentials Pack',
    price: 58,
    category: 'kids',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
    description: 'Durable basics for long school days with all-day softness and ease.',
    tag: 'Best seller'
  }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Veloura Fashion API is running' });
});

app.get('/api/products', (req, res) => {
  res.json({ products });
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find((item) => item.id === Number(req.params.id));

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  return res.json({ product });
});

app.post('/api/signup', (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existingUser = users.find((user) => user.email.toLowerCase() === normalizedEmail);

  if (existingUser) {
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }

  const newUser = {
    name: String(name).trim(),
    email: normalizedEmail,
    password: String(password).trim()
  };

  users.push(newUser);

  return res.status(201).json({
    success: true,
    message: 'Account created successfully',
    user: {
      email: newUser.email,
      name: newUser.name
    }
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = users.find((entry) => entry.email.toLowerCase() === normalizedEmail && entry.password === String(password).trim());

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  return res.json({
    success: true,
    message: 'Login successful',
    user: {
      email: user.email,
      name: user.name
    }
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Veloura Fashion API running on http://localhost:${PORT}`);
});
