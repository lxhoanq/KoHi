const express = require('express');
const router = express.Router();
const SanphamSize = require('../models/product_size');
const Sanpham = require('../models/product');

// Route để hiển thị danh sách sản phẩm size
router.get('/productsizelist', async (req, res) => {
  try {
    const sanphamSizes = await SanphamSize.aggregate([
      {
        $lookup: {
          from: 'tbl_sanpham',
          localField: 'sanpham_id',
          foreignField: 'sanpham_id',
          as: 'sanpham'
        }
      },
      {
        $unwind: '$sanpham' // Giải nén mảng kết quả
      }
    ]);

    res.render('admin/productsizelist', { sanphamSizes, user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving product sizes');
  }
});

router.get('/productsizelist/:sanphamId', async (req, res) => {
    try {
        const { sanphamId } = req.params;
      const sanphamSizes1 = await SanphamSize.aggregate([
        {
            $match: { sanpham_id: parseInt(sanphamId) } // Lọc theo sanpham_id
        },
        {
          $lookup: {
            from: 'tbl_sanpham',
            localField: 'sanpham_id',
            foreignField: 'sanpham_id',
            as: 'sanpham'
          }
        }
      ]);
  
      res.render('admin/productsizelist1', { sanphamSizes1, user: req.user });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error retrieving product sizes');
    }
  });

// Route để hiển thị trang thêm size sản phẩm
router.get('/productsizeadd', async (req, res) => {
  try {
    const products = await Sanpham.find({});
    res.render('admin/productsizeadd', { products, user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving products');
  }
});

// Route để xử lý việc thêm size sản phẩm
router.post('/productsizeadd', async (req, res) => {
  const { sanpham_id, sanpham_size } = req.body;

  try {
    const newSize = new SanphamSize({
      sanpham_id: parseInt(sanpham_id),
      sanpham_size
    });

    await newSize.save();
    res.redirect('/productsizelist');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding product size');
  }
});

module.exports = router;
