const express = require('express');
const router = express.Router();
const Color = require('../models/color');
const multer = require('multer'); // Import multer để xử lý upload file
const path = require('path');

// Thiết lập multer để lưu trữ ảnh
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/'); // Thư mục lưu trữ file ảnh
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Đổi tên file khi lưu trữ
  }
});

// Thiết lập middleware upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // Giới hạn kích thước file
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb); // Kiểm tra loại file
  }
}).single('color_anh'); // Tên của trường file input

// Kiểm tra loại file
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Chỉ được phép tải lên ảnh định dạng JPEG, JPG, PNG hoặc GIF');
  }
}

// Route to render the color list page
router.get('/colorlist', async (req, res) => {
  try {
    const colors = await Color.find().lean();
    res.render('admin/colorlist', { colors, user: req.user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route to render the add color page
router.get('/coloradd', (req, res) => {
  res.render('admin/coloradd', { user: req.user });
});

// Route to handle adding a new color
router.post('/coloradd', (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).render('admin/coloradd', { error: err, user: req.user });
    }

    const { color_ten } = req.body;
    if (!color_ten) {
      return res.status(400).render('admin/coloradd', { error: 'Tên màu sắc là bắt buộc', user: req.user });
    }

    if (!req.file) {
      return res.status(400).render('admin/coloradd', { error: 'Ảnh đại diện là bắt buộc', user: req.user });
    }

    const color_anh = req.file.filename;

    try {
      const newColor = new Color({
        color_ten,
        color_anh
      });

      await newColor.save();
      res.redirect('/colorlist');
    } catch (err) {
      res.status(500).render('admin/coloradd', { error: err.message, user: req.user });
    }
  });
});

// Route to render the edit color page
router.get('/coloredit/:id', async (req, res) => {
  try {
    const color = await Color.findById(req.params.id).lean();
    if (!color) {
      return res.status(404).send('Color not found');
    }
    res.render('admin/coloredit', { color, user: req.user });
  } catch (err) {
    res.status(500).send('Error fetching color');
  }
});


// Route to handle updating a color
router.post('/coloredit/:id', (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).render('admin/coloredit', { error: err, user: req.user });
    }

    const { color_ten } = req.body;
    const color_anh = req.file ? req.file.filename : undefined;

    try {
      const color = await Color.findById(req.params.id);
      if (!color) {
        return res.status(404).send('Color not found');
      }

      color.color_ten = color_ten;
      if (color_anh) color.color_anh = color_anh;

      await color.save();
      res.redirect('/colorlist');
    } catch (err) {
      res.status(500).render('admin/coloredit', { error: err.message, user: req.user });
    }
  });
});

// Route to handle deleting a color
router.delete('/color/:id', async (req, res) => {
  try {
    const color = await Color.findById(req.params.id);
    if (!color) {
      return res.status(404).send('Color not found');
    }

    await color.remove();
    res.json({ message: 'Color deleted' });
  } catch (err) {
    res.status(500).send('Error deleting color');
  }
});



module.exports = router;
