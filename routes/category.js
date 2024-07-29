const express = require('express');
const router = express.Router();
const Danhmuc = require('../models/category1');
const Category = require('../models/category1');
const Product = require('../models/product');  
const ProductType = require('../models/product_type');      
const Cart = require('../models/cart');                                                 
// Route GET /danhmuc
router.get('/danhmuc', async (req, res) => {
  try {
    const danhmucs = await Danhmuc.find();
    res.json(danhmucs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/categorylist', async (req, res) => {
  try {
    const categories = await Category.find().lean(); 
    res.render('admin/cartegorylist', { categories, user: req.user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/category/loaisanpham', async (req, res) => {
  const { loaisanpham_id } = req.query;

  try {
    // Fetch product type details with category using lookup
    const productTypeAggregation = await ProductType.aggregate([
      {
        $match: {
          loaisanpham_id: parseInt(loaisanpham_id)
        }
      },
      {
        $lookup: {
          from: 'tbl_danhmuc',
          localField: 'danhmuc_id',
          foreignField: 'danhmuc_id',
          as: 'danhmuc'
        }
      },
      {
        $unwind: {
          path: '$danhmuc',
          preserveNullAndEmptyArrays: true
        }
      }
    ]);

    const productType = productTypeAggregation[0];

    if (!productType) {
      return res.status(404).send('Product type not found');
    }

    // Fetch all categories with their product types using lookup
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: 'tbl_loaisanpham',
          localField: 'danhmuc_id',
          foreignField: 'danhmuc_id',
          as: 'productTypes'
        }
      }
    ]);

    // Fetch products for the given product type
    const products = await Product.find({
      loaisanpham_id: parseInt(loaisanpham_id)
    });

    // Render the view with the fetched data
    res.render('site/category', {
      user: req.user,
      productType: productType,
      categories: categories,
      products: products,
      cartItems: req.user ? await getCartItems(req.user.user_id) : [] // Fetch cart items only if user is logged in
    });

  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).send('Error fetching data');
  }
});

// Example function to get cart items for a user
async function getCartItems(userId) {
  // Replace with actual implementation to fetch cart items based on userId
  return Cart.find({ user_id: userId });
}



router.get('/categoryadd', (req, res) => {
  res.render('admin/cartegoryadd', { user: req.user });
});

router.post('/categoryadd', async (req, res) => {
  const { cartegory_name } = req.body;

  if (!cartegory_name) {
    return res.status(400).render('admin/cartegoryadd', { error: 'Category name is required', user: req.user });
  }

  try {
    const newCategory = new Category({
      danhmuc_ten: cartegory_name
    });
    
    await newCategory.save();
    res.redirect('/categorylist');
  } catch (err) {
    console.error('Error saving category:', err);  // Debugging log
    res.status(500).render('admin/cartegoryadd', { error: err.message, user: req.user });
  }
});


// Route GET /danhmuc/:danhmuc_id
router.get('/danhmuc/:danhmuc_id', async (req, res) => {
  try {
    const danhmuc = await Danhmuc.findOne({ danhmuc_id: req.params.danhmuc_id });
    if (!danhmuc) {
      return res.status(404).json({ message: 'Danhmuc not found' });
    }
    res.json(danhmuc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route POST /danhmuc
router.post('/danhmuc', async (req, res) => {
  const danhmuc = new Danhmuc({
    danhmuc_ten: req.body.danhmuc_ten
  });

  try {
    const newDanhmuc = await danhmuc.save();
    res.status(201).json(newDanhmuc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Route PUT /danhmuc/:id
router.put('/danhmuc/:id', async (req, res) => {
  try {
    const danhmuc = await Danhmuc.findById(req.params.id);
    if (danhmuc == null) {
      return res.status(404).json({ message: 'Danhmuc not found' });
    }

    danhmuc.danhmuc_ten = req.body.danhmuc_ten;

    const updatedDanhmuc = await danhmuc.save();
    res.json(updatedDanhmuc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/editCategory/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).lean();
    if (!category) {
      return res.status(404).render('admin/cartegorylist', { error: 'Category not found', user: req.user });
    }
    res.render('admin/cartegoryedit', { category, user: req.user });
  } catch (err) {
    res.status(500).render('admin/cartegorylist', { error: err.message, user: req.user });
  }
});

router.post('/editCategory/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).render('admin/cartegorylist', { error: 'Category not found', user: req.user });
    }

    category.danhmuc_ten = req.body.danhmuc_ten;
    await category.save();

    res.redirect('/categorylist');
  } catch (err) {
    res.status(500).render('admin/cartegoryedit', { error: err.message, category: req.body, user: req.user });
  }
});

// DELETE /danhmuc/:id
router.delete('/danhmuc/:id', async (req, res) => {
  try {
    const danhmuc = await Danhmuc.findById(req.params.id);
    if (danhmuc == null) {
      return res.status(404).json({ message: 'Danhmuc not found' });
    }
    await danhmuc.remove();
    res.json({ message: 'Danhmuc deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
