const express = require('express');
const router = express.Router();
const Sanpham = require('../models/product');
const SanphamAnh = require('../models/product_photo');
const path = require('path');
const multer = require('multer');
const fs = require('fs');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/'); 
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); 
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, 
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb); 
  }
}).single('sanpham_anh'); 

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

// GET danh sách ảnh sản phẩm với thông tin sản phẩm
router.get('/productphotolist', async (req, res) => {
  try {
    const products = await SanphamAnh.aggregate([
      {
        $lookup: {
          from: 'tbl_sanpham',
          localField: 'sanpham_id',
          foreignField: 'sanpham_id',
          as: 'sanpham_info'
        }
      }
    ]);
    res.render('admin/productphotolist', { products, user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi khi lấy danh sách ảnh sản phẩm');
  }
});

// GET danh sách ảnh sản phẩm với thông tin sản phẩm
router.get('/productphotolist/:sanphamId', async (req, res) => {
  try {
    const { sanphamId } = req.params;

    // Lấy danh sách ảnh sản phẩm theo sanpham_id
    const productPhotos = await SanphamAnh.aggregate([
      {
        $match: { sanpham_id: parseInt(sanphamId) } // Lọc theo sanpham_id
      },
      {
        $lookup: {
          from: 'tbl_sanpham',
          localField: 'sanpham_id',
          foreignField: 'sanpham_id',
          as: 'sanpham_info'
        }
      }
    ]);

    res.render('admin/productphotolist1', { productPhotos, user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi khi lấy danh sách ảnh sản phẩm');
  }
});

// GET form thêm ảnh sản phẩm
router.get('/productphotoadd', async (req, res) => {
  try {
    const products = await Sanpham.find(); // Lấy danh sách sản phẩm để hiển thị trong dropdown
    res.render('admin/productphotoadd', { products, user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi khi tải form thêm ảnh sản phẩm');
  }
});

// POST thêm ảnh sản phẩm
router.post('/productphotoadd', (req, res) => {
  upload(req, res, async (err) => {
    try {
      if (err instanceof multer.MulterError) {
        console.log(err);
        return res.status(500).send('Có lỗi xảy ra khi tải ảnh lên');
      } else if (err) {
        console.log(err);
        return res.status(400).send(err);
      }

      const { sanpham_id } = req.body;
      const sanpham = await Sanpham.findOne({ sanpham_id: sanpham_id }); // Tìm sản phẩm theo sanpham_id

      if (!sanpham) {
        return res.status(404).send('Sản phẩm không tồn tại');
      }

      // Lưu ảnh vào cơ sở dữ liệu
      const newPhoto = new SanphamAnh({
        sanpham_id: sanpham_id,
        sanpham_anh: '/uploads/' + req.file.filename // Đường dẫn lưu trữ ảnh trong thư mục uploads
      });

      await newPhoto.save(); // Lưu ảnh vào cơ sở dữ liệu

      res.redirect('/productphotolist'); // Chuyển hướng về danh sách ảnh sản phẩm sau khi thêm thành công
    } catch (err) {
      console.error(err);
      res.status(500).send('Lỗi khi thêm ảnh sản phẩm');
    }
  });
});

router.delete('/productphotodelete/:sanpham_anh_id', async (req, res) => {
  try {
      const { sanpham_anh_id } = req.params;

      // Find the photo to delete
      const photo = await SanphamAnh.findOne({ sanpham_anh_id });
      if (!photo) {
          return res.status(404).json({ message: 'Photo not found' });
      }
      // Delete the photo file from the server
      const filePath = path.join('public/uploads', path.basename(photo.sanpham_anh));
      fs.unlink(filePath, err => {
          if (err) console.error('Error deleting file:', err);
      });

      // Remove photo record from database
      await SanphamAnh.deleteOne({ sanpham_anh_id });
      res.json({ message: 'Photo deleted' });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error deleting photo' });
  }
});


module.exports = router;
