const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Category = require('../models/category1');
const ProductType = require('../models/product_type');
const ProductSize = require('../models/product_size');
const Color = require('../models/color');
const multer = require('multer'); // Import multer to handle file uploads
const path = require('path');
const AutoIncrement = require('../modules/auto-increment1');

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/'); // Directory to store images
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Rename file on storage
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // File size limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb); // File type validation
  }
}).single('sanpham_anh'); // Single file input field name

// Check file type function
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Only JPEG, JPG, PNG, or GIF images are allowed');
  }
}

// Route to render the product list page
router.get('/productlist', async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $lookup: {
          from: 'tbl_danhmuc',
          localField: 'danhmuc_id',
          foreignField: 'danhmuc_id',
          as: 'danhmuc'
        }
      },
      {
        $lookup: {
          from: 'tbl_loaisanpham',
          localField: 'loaisanpham_id',
          foreignField: 'loaisanpham_id',
          as: 'loaisanpham'
        }
      },
      {
        $lookup: {
          from: 'tbl_color',
          localField: 'color_id',
          foreignField: 'color_id',
          as: 'color'
        }
      },
      {
        $addFields: {
          danhmuc: { $arrayElemAt: ['$danhmuc', 0] },
          loaisanpham: { $arrayElemAt: ['$loaisanpham', 0] },
          color: { $arrayElemAt: ['$color', 0] }
        }
      },
      {
        $project: {
          _id: 0, // Exclude _id field if needed
          sanpham_id: 1,
          sanpham_tieude: 1,
          sanpham_ma: 1,
          danhmuc_ten: '$danhmuc.danhmuc_ten',
          loaisanpham_ten: '$loaisanpham.loaisanpham_ten',
          color_ten: '$color.color_ten',
          sanpham_gia: 1,
          sanpham_chitiet: 1,
          sanpham_baoquan: 1,
          sanpham_anh: 1
        }
      }
    ]);

    res.render('admin/productlist', { products, user: req.user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/productadd', async (req, res) => {
  try {
    const categories = await Category.find();
    const productTypes = await ProductType.aggregate([
      {
        $lookup: {
          from: 'tbl_danhmuc',
          localField: 'danhmuc_id',
          foreignField: 'danhmuc_id',
          as: 'danhmuc'
        }
      },
      {
        $unwind: '$danhmuc'
      },
      {
        $project: {
          loaisanpham_id: 1,
          loaisanpham_ten: 1,
          danhmuc_id: 1,
          danhmuc_ten: '$danhmuc.danhmuc_ten'
        }
      }
    ]);
    const colors = await Color.find();

    res.render('admin/productadd', { categories, productTypes, colors, user: req.user });
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
});

router.get('/api/productTypes/:danhmucId', async (req, res) => {
  try {
    const loaiSanPham = await ProductType.aggregate([
      {
        $match: { danhmuc_id: parseInt(req.params.danhmucId) } 
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
        $unwind: '$danhmuc'
      },
      {
        $project: {
          loaisanpham_id: 1,
          loaisanpham_ten: 1,
          danhmuc_id: 1,
          danhmuc_ten: '$danhmuc.danhmuc_ten'
        }
      }
    ]);
    res.json(loaiSanPham);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route để thêm sản phẩm
router.post('/productadd', upload, async (req, res) => {
  try {
    const { sanpham_tieude, sanpham_ma, danhmuc_id, loaisanpham_id, color_id, sanpham_gia, sanpham_chitiet, sanpham_baoquan } = req.body;
    const sanpham_anh = req.file.filename;

    // Check if all required fields are present
    if (!sanpham_tieude || !sanpham_ma || !danhmuc_id || !loaisanpham_id || !color_id || !sanpham_gia || !sanpham_chitiet || !sanpham_baoquan || !sanpham_anh) {
      return res.status(400).render('admin/productadd', { error: 'All fields are required', user: req.user });
    }

    // Create new product instance
    const product = new Product({
      sanpham_tieude,
      sanpham_ma,
      danhmuc_id,
      loaisanpham_id,
      color_id,
      sanpham_gia,
      sanpham_chitiet,
      sanpham_baoquan,
      sanpham_anh
    });

    // Save product to database
    const newProduct = await product.save();

    // Get product id
    const sanpham_id = newProduct.sanpham_id;

    // Process product sizes
    if (req.body.sanpham_size) {
      const sizes = req.body.sanpham_size;
      const productSizes = sizes.map(size => ({
        sanpham_id,
        sanpham_size_id: AutoIncrement.getNextId('product_size_id'), // Assume using AutoIncrement to generate sanpham_size_id
        sanpham_size: size
      }));

      // Save product sizes to database
      await ProductSize.insertMany(productSizes);
    }

    res.redirect('/productlist'); // Redirect to product list after successful submission
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/productedit/:sanpham_id', async (req, res) => {
  try {
    const product = await Product.findOne({ sanpham_id: req.params.sanpham_id }).lean();
    const categories = await Category.find();
    const colors = await Color.find();
    const productTypes = await ProductType.aggregate([
      {
        $lookup: {
          from: 'tbl_danhmuc',
          localField: 'danhmuc_id',
          foreignField: 'danhmuc_id',
          as: 'danhmuc'
        }
      },
      {
        $unwind: '$danhmuc'
      },
      {
        $project: {
          loaisanpham_id: 1,
          loaisanpham_ten: 1,
          danhmuc_id: 1,
          danhmuc_ten: '$danhmuc.danhmuc_ten'
        }
      }
    ]);

    if (!product) {
      return res.status(404).send('Product not found');
    }
    res.render('admin/productedit', { product, categories, productTypes, colors, user: req.user });
  } catch (err) {
    res.status(500).send('Error fetching product');
  }
});


router.post('/productedit/:sanpham_id', upload, async (req, res) => {
  try {
    const { sanpham_tieude, sanpham_ma, danhmuc_id, loaisanpham_id, color_id, sanpham_gia, sanpham_chitiet, sanpham_baoquan } = req.body;
    const sanpham_anh = req.file ? req.file.filename : undefined;

    const product = await Product.findOne({ sanpham_id: req.params.sanpham_id });
    if (!product) {
      return res.status(404).send('Product not found');
    }

    product.sanpham_tieude = sanpham_tieude;
    product.sanpham_ma = sanpham_ma;
    product.danhmuc_id = danhmuc_id;
    product.loaisanpham_id = loaisanpham_id;
    product.color_id = color_id;
    product.sanpham_gia = sanpham_gia;
    product.sanpham_chitiet = sanpham_chitiet;
    product.sanpham_baoquan = sanpham_baoquan;
    if (sanpham_anh) product.sanpham_anh = sanpham_anh;

    await product.save();
    res.redirect('/productlist');
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
});


router.delete('/productdelete/:sanpham_id', async (req, res) => {
  try {
      const product = await Product.findOne({ sanpham_id: req.params.sanpham_id });
      if (!product) {
          return res.status(404).send('Product not found');
      }
      await product.remove();
      res.json({ message: 'Product deleted' });
  } catch (err) {
      res.status(500).send('Error deleting product');
  }
});



module.exports = router;
