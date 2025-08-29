const express = require('express');
const Doubt = require('../models/Doubt');
const Room = require('../models/Room');
// Import new eCommerce models
const Product = require('../models/Product');
const Category = require('../models/Category');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const User = require('../models/User');

const router = express.Router();

// room create karne ke liye route
router.post('/rooms', async (req, res) => {
  const { roomId, hostId, hostEmail, topic } = req.body;
  
  console.log('Backend: Creating room with data', { roomId, hostId, hostEmail, topic });
  
  if (!roomId || !hostId || !hostEmail) {
    console.log('Backend: Missing required fields', { roomId: !!roomId, hostId: !!hostId, hostEmail: !!hostEmail });
    return res.status(400).send({ message: 'Room ID, host ID, and host email are required' });
  }
  
  try {
    const room = new Room({ roomId, hostId, hostEmail, topic });
    await room.save();
    console.log('Backend: Room created successfully', room);
    res.status(201).send({ message: 'Room created', room });
  } catch (error) {
    console.error('Backend: Failed to create room:', error);
    res.status(500).send({ message: 'Failed to create room', error: error.message });
  }
});

// doubt submit karne ke liye route
router.post('/doubts', async (req, res) => {
  const { roomId, text, user } = req.body;
  const doubt = new Doubt({ roomId, text, user, upvotes: 0, upvotedBy: [], answered: false });
  await doubt.save();
  res.status(201).send(doubt);
});

// room se doubts ko lane ke liye route
router.get('/rooms/:roomId/doubts', async (req, res) => {
  const { roomId } = req.params;
  const doubts = await Doubt.find({ roomId });
  res.status(200).send(doubts);
});

// Check if user is host of a room
router.get('/rooms/:roomId/host/:userId', async (req, res) => {
  const { roomId, userId } = req.params;
  
  console.log('Backend: Checking host status', { roomId, userId });
  
  try {
    const room = await Room.findOne({ roomId });
    console.log('Backend: Found room', room);
    
    if (!room) {
      console.log('Backend: Room not found');
      return res.status(404).send({ message: 'Room not found' });
    }
    
    const isHost = room.hostId === userId;
    console.log('Backend: Host comparison', { roomHostId: room.hostId, userId, isHost });
    
    res.status(200).send({ isHost, room });
  } catch (error) {
    console.error('Backend: Error checking host status:', error);
    res.status(500).send({ message: 'Failed to check host status', error: error.message });
  }
});

// room close karne ke liye route
router.delete('/rooms/:roomId', async (req, res) => {
  const { roomId } = req.params;
  await Doubt.deleteMany({ roomId });
  await Room.deleteOne({ roomId });
  res.status(200).send({ message: 'Room closed and doubts deleted' });
});

// fetch all doubts
router.get('/doubts', async (req, res) => {
  const doubts = await Doubt.find();
  res.status(200).send(doubts);
});

// Check if room exists
router.get('/rooms/:roomId', async (req, res) => {
  const { roomId } = req.params;
  try {
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).send({ exists: false });
    }
    res.status(200).send({ exists: true, room });
  } catch (e) {
    res.status(500).send({ message: 'Failed to fetch room', error: e.message });
  }
});

// ==================== ECOMMERCE ROUTES ====================

// CATEGORY ROUTES
// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .populate('parentCategory', 'name');
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
});

// Get category by ID
router.get('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate('parentCategory', 'name');
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch category', error: error.message });
  }
});

// Create category (admin)
router.post('/categories', async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json({ message: 'Category created', category });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create category', error: error.message });
  }
});

// PRODUCT ROUTES
// Get all products with filtering and pagination
router.get('/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    const filter = { isActive: true };
    
    // Category filter
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }
    
    // Search filter
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    
    const sortOptions = {};
    switch (req.query.sort) {
      case 'price_asc':
        sortOptions.price = 1;
        break;
      case 'price_desc':
        sortOptions.price = -1;
        break;
      case 'rating':
        sortOptions.rating = -1;
        break;
      case 'newest':
        sortOptions.createdAt = -1;
        break;
      default:
        sortOptions.name = 1;
    }
    
    const products = await Product.find(filter)
      .populate('category', 'name')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
      
    const total = await Product.countDocuments(filter);
    
    res.status(200).json({
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
});

// Get product by ID
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch product', error: error.message });
  }
});

// Get related products
router.get('/products/:id/related', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const relatedProducts = await Product.find({
      _id: { $ne: req.params.id },
      category: product.category,
      isActive: true
    }).limit(8).populate('category', 'name');
    
    res.status(200).json(relatedProducts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch related products', error: error.message });
  }
});

// Create product (admin)
router.post('/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    await product.populate('category', 'name');
    res.status(201).json({ message: 'Product created', product });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
});

// Update product (admin)
router.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('category', 'name');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product updated', product });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
});

// CART ROUTES
// Get user's cart
router.get('/cart/:userId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId })
      .populate('items.product', 'name price images stock');
    
    if (!cart) {
      return res.status(200).json({ items: [], total: 0 });
    }
    
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch cart', error: error.message });
  }
});

// Add item to cart
router.post('/cart/:userId/items', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.params.userId;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }
    
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }
    
    const existingItemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId
    );
    
    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: product.price
      });
    }
    
    await cart.save();
    await cart.populate('items.product', 'name price images stock');
    
    res.status(200).json({ message: 'Item added to cart', cart });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add item to cart', error: error.message });
  }
});

// Update cart item quantity
router.put('/cart/:userId/items/:productId', async (req, res) => {
  try {
    const { quantity } = req.body;
    const { userId, productId } = req.params;
    
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const itemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }
    
    await cart.save();
    await cart.populate('items.product', 'name price images stock');
    
    res.status(200).json({ message: 'Cart updated', cart });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update cart', error: error.message });
  }
});

// Remove item from cart
router.delete('/cart/:userId/items/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();
    await cart.populate('items.product', 'name price images stock');
    
    res.status(200).json({ message: 'Item removed from cart', cart });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove item from cart', error: error.message });
  }
});

// Clear cart
router.delete('/cart/:userId', async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.params.userId });
    res.status(200).json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to clear cart', error: error.message });
  }
});

// ORDER ROUTES
// Get user's orders
router.get('/orders/:userId', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const orders = await Order.find({ userId: req.params.userId })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Order.countDocuments({ userId: req.params.userId });
    
    res.status(200).json({
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
});

// Get order by ID
router.get('/orders/:userId/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ 
      orderId: req.params.orderId,
      userId: req.params.userId 
    }).populate('items.product', 'name images');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order', error: error.message });
  }
});

// Create order
router.post('/orders', async (req, res) => {
  try {
    const { userId, items, paymentMethod, shippingAddress } = req.body;
    
    // Validate cart items and calculate totals
    let subtotal = 0;
    const orderItems = [];
    
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}` 
        });
      }
      
      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;
      
      orderItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        subtotal: itemSubtotal
      });
      
      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }
    
    // Generate order ID
    const orderId = `ORD${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    // Calculate shipping and tax (simple logic)
    const shipping = subtotal > 500 ? 0 : 50; // Free shipping above 500
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + shipping + tax;
    
    const order = new Order({
      orderId,
      userId,
      userEmail: req.body.userEmail,
      items: orderItems,
      paymentMethod,
      subtotal,
      shipping,
      tax,
      total,
      shippingAddress
    });
    
    await order.save();
    
    // Clear user's cart
    await Cart.findOneAndDelete({ userId });
    
    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
});

// USER ROUTES
// Get or create user profile
router.get('/users/:firebaseId', async (req, res) => {
  try {
    let user = await User.findOne({ firebaseId: req.params.firebaseId });
    
    if (!user) {
      // Create user if doesn't exist
      const { email, firstName, lastName, displayName, photoURL } = req.query;
      user = new User({
        firebaseId: req.params.firebaseId,
        email,
        firstName,
        lastName,
        displayName,
        photoURL
      });
      await user.save();
    } else {
      // Update last login
      user.lastLoginAt = new Date();
      await user.save();
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
});

// Update user profile
router.put('/users/:firebaseId', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { firebaseId: req.params.firebaseId },
      req.body,
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ message: 'User updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
});

module.exports = router;
