const express = require('express');
const router = express.Router();
const Loaisanpham = require('../models/product_type');
const Danhmuc = require('../models/category1');

// Route GET /loaisanpham
router.get('/loaisanpham', async (req, res) => {
  try {
    const loaisanphams = await Loaisanpham.find();
    res.json(loaisanphams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route GET /loaisanpham/:id
router.get('/loaisanpham/:id', async (req, res) => {
  try {
    const loaisanpham = await Loaisanpham.findById(req.params.id);
    if (loaisanpham == null) {
      return res.status(404).json({ message: 'Loaisanpham not found' });
    }
    res.json(loaisanpham);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route GET /loaisanpham/danhmuc/:danhmuc_id
router.get('/loaisanpham/danhmuc/:danhmuc_id', async (req, res) => {
  try {
    const loaisanphams = await Loaisanpham.find({ danhmuc_id: req.params.danhmuc_id });
    res.json(loaisanphams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route GET /producttypelist
router.get('/producttypelist', async (req, res) => {
  try {
    const producttypelist = await Loaisanpham.aggregate([
      {
        $lookup: {
          from: 'tbl_danhmuc',
          localField: 'danhmuc_id',
          foreignField: 'danhmuc_id',
          as: 'category'
        }
      },
      {
        $project: {
          loaisanpham_id: 1,
          danhmuc_id: 1,
          danhmuc_ten: { $arrayElemAt: ['$category.danhmuc_ten', 0] },
          loaisanpham_ten: 1
        }
      }
    ]);
    res.render('admin/producttypelist', { producttypelist, user: req.user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Route GET để hiển thị form thêm loại sản phẩm
router.get('/producttypeadd', async (req, res) => {
  try {
    const categories = await Danhmuc.find().lean(); 
    res.render('admin/producttypeadd', { categories, user: req.user }); 
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route POST /producttypeadd
router.post('/producttypeadd', async (req, res) => {
  const { danhmuc_id, loaisanpham_name } = req.body;

  try {
    // Kiểm tra danh mục tồn tại trong cơ sở dữ liệu
    const danhMuc = await Danhmuc.findOne({ danhmuc_id: parseInt(danhmuc_id) });

    if (!danhMuc) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }

    // Tạo một bản ghi mới trong bảng Loaisanpham với danh mục và tên loại sản phẩm
    const newProductType = new Loaisanpham({
      danhmuc_id: danhMuc.danhmuc_id,
      loaisanpham_ten: loaisanpham_name
    });

    // Lưu vào cơ sở dữ liệu
    await newProductType.save();

    // Điều hướng người dùng về trang danh sách loại sản phẩm
    res.redirect('/producttypelist');
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route GET /editProductType/:id
router.get('/editProductType/:id', async (req, res) => {
  try {
    const productType = await Loaisanpham.findOne({ loaisanpham_id: req.params.id }).lean();
    if (!productType) {
      return res.status(404).send('Product type not found');
    }
    const categories = await Danhmuc.find().lean();
    res.render('admin/producttypeedit', { productType, categories, user: req.user });
  } catch (err) {
    res.status(500).send('Error fetching product type');
  }
});

// Route POST /editProductType/:id
router.post('/editProductType/:id', async (req, res) => {
  const { danhmuc_id, loaisanpham_ten } = req.body;

  try {
    const productType = await Loaisanpham.findOne({ loaisanpham_id: req.params.id });
    if (!productType) {
      return res.status(404).send('Product type not found');
    }

    productType.danhmuc_id = danhmuc_id;
    productType.loaisanpham_ten = loaisanpham_ten;

    await productType.save();
    res.redirect('/producttypelist');
  } catch (err) {
    res.status(500).send('Error updating product type');
  }
});


router.delete('/deleteProductType/:id', async (req, res) => {
  try {
    const productType = await Loaisanpham.findOne({ loaisanpham_id: req.params.id });
    if (!productType) {
      return res.status(404).send('Product type not found');
    }

    await productType.remove();
    res.json({ message: 'Product type deleted' });
  } catch (err) {
    res.status(500).send('Error deleting product type');
  }
});

module.exports = router;
