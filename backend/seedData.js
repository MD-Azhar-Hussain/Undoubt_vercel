const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});

    // Create categories
    const electronics = await Category.create({
      name: 'Electronics',
      description: 'Latest gadgets and electronic devices',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500',
      sortOrder: 1,
    });

    const clothing = await Category.create({
      name: 'Clothing',
      description: 'Fashion and apparel for everyone',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500',
      sortOrder: 2,
    });

    const books = await Category.create({
      name: 'Books',
      description: 'Educational and entertaining books',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
      sortOrder: 3,
    });

    const home = await Category.create({
      name: 'Home & Garden',
      description: 'Everything for your home and garden',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
      sortOrder: 4,
    });

    // Create sample products
    const products = [
      // Electronics
      {
        name: 'Smartphone Pro Max',
        description: 'Latest flagship smartphone with advanced camera system and lightning-fast performance.',
        price: 799.99,
        images: [
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
          'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500',
        ],
        category: electronics._id,
        stock: 50,
        rating: 4.8,
        reviewCount: 245,
        tags: ['smartphone', 'mobile', 'camera', 'technology'],
      },
      {
        name: 'Wireless Headphones',
        description: 'Premium noise-cancelling wireless headphones with 30-hour battery life.',
        price: 299.99,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
          'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500',
        ],
        category: electronics._id,
        stock: 75,
        rating: 4.6,
        reviewCount: 189,
        tags: ['headphones', 'wireless', 'audio', 'music'],
      },
      {
        name: 'Laptop Gaming Beast',
        description: 'High-performance gaming laptop with RTX graphics and RGB keyboard.',
        price: 1299.99,
        images: [
          'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
          'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500',
        ],
        category: electronics._id,
        stock: 25,
        rating: 4.9,
        reviewCount: 156,
        tags: ['laptop', 'gaming', 'computer', 'performance'],
      },

      // Clothing
      {
        name: 'Classic Cotton T-Shirt',
        description: 'Comfortable 100% cotton t-shirt in various colors and sizes.',
        price: 24.99,
        images: [
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
          'https://images.unsplash.com/photo-1503341338985-b8ebe30e5451?w=500',
        ],
        category: clothing._id,
        stock: 200,
        rating: 4.4,
        reviewCount: 412,
        tags: ['t-shirt', 'cotton', 'casual', 'basic'],
      },
      {
        name: 'Designer Jeans',
        description: 'Premium denim jeans with perfect fit and modern styling.',
        price: 89.99,
        images: [
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
          'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500',
        ],
        category: clothing._id,
        stock: 120,
        rating: 4.7,
        reviewCount: 298,
        tags: ['jeans', 'denim', 'fashion', 'designer'],
      },
      {
        name: 'Winter Jacket',
        description: 'Warm and stylish winter jacket with water-resistant coating.',
        price: 149.99,
        images: [
          'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
          'https://images.unsplash.com/photo-1594633311875-ee9bf30ba6c3?w=500',
        ],
        category: clothing._id,
        stock: 80,
        rating: 4.5,
        reviewCount: 167,
        tags: ['jacket', 'winter', 'warm', 'outdoor'],
      },

      // Books
      {
        name: 'The Complete Guide to Web Development',
        description: 'Comprehensive guide to modern web development technologies and best practices.',
        price: 49.99,
        images: [
          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500',
          'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500',
        ],
        category: books._id,
        stock: 150,
        rating: 4.8,
        reviewCount: 324,
        tags: ['programming', 'web development', 'technology', 'education'],
      },
      {
        name: 'Fiction Bestseller Novel',
        description: 'Award-winning novel that captivated readers worldwide.',
        price: 16.99,
        images: [
          'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500',
          'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500',
        ],
        category: books._id,
        stock: 300,
        rating: 4.6,
        reviewCount: 892,
        tags: ['fiction', 'novel', 'bestseller', 'reading'],
      },

      // Home & Garden
      {
        name: 'Smart Home Hub',
        description: 'Central hub to control all your smart home devices with voice commands.',
        price: 179.99,
        images: [
          'https://images.unsplash.com/photo-1558002038-1055907df827?w=500',
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=500',
        ],
        category: home._id,
        stock: 60,
        rating: 4.5,
        reviewCount: 203,
        tags: ['smart home', 'automation', 'voice control', 'technology'],
      },
      {
        name: 'Indoor Plant Collection',
        description: 'Beautiful set of indoor plants to purify air and brighten your space.',
        price: 39.99,
        images: [
          'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500',
          'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500',
        ],
        category: home._id,
        stock: 90,
        rating: 4.3,
        reviewCount: 145,
        tags: ['plants', 'indoor', 'decoration', 'air purifying'],
      },
    ];

    await Product.insertMany(products);

    console.log('Sample data seeded successfully!');
    console.log(`Created ${products.length} products in 4 categories`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seeding script
if (require.main === module) {
  seedData();
}

module.exports = seedData;