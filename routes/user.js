const router = require('express').Router();
const BcryptJs = require('bcryptjs');
const Passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Order = require('../models/order');
const UserModel = require('../models/user');
const UserRole = require('../constants/user-role');
const Cart = require('../models/cart');
const Carta = require('../models/carta');
router.get('/dang-nhap.html', (req, res) => {
  const model = {
    callbackUrl: '/dang-nhap.html',
    user: req.user // Pass the user object to the template
  };

  if (req.query.returnUrl && req.query.returnUrl.length > 0) {
    model.callbackUrl = `${model.callbackUrl}?returnUrl=${req.query.returnUrl}`;
  }

  res.render('site/login', model);
});

router.get('/index_admin.html', (req, res) => {
  if (req.isAuthenticated() && req.user.user_Role.role === 'ADMIN') {
    return res.render('admin/index', { user: req.user });
  }
  res.redirect('/dang-nhap.html');
});


router.post('/dang-nhap.html', (req, res, next) => {
  Passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      let error = 'Tài khoản hoặc mật khẩu không đúng';
      if (info && info.message === 'User not registered') {
        error = 'Tài khoản chưa được đăng ký';
      }
      return res.render('site/login', { error, callbackUrl: req.originalUrl });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      if (user.user_Role.role === "ADMIN") {
        return res.redirect('/index_admin.html');
      }
      return res.redirect('/');
    });
  })(req, res, next);
});

router.get('/dang-xuat.html', (req, res) => {
  req.logout();
  res.redirect('/dang-nhap.html');
});

router.get('/dang-ky.html', (req, res) => {
  res.render('site/register', {
      errors: null
  });
});

router.post('/dang-ky.html', async (req, res) => {
  const respData = {
      isSucceed: false,
      errors: null,
      message: 'Failure'
  };

  try {
      req.checkBody('user_Name', 'Họ tên không được để trống').notEmpty();
      req.checkBody('user_Gender', 'Giới tính không được để trống').notEmpty();
      req.checkBody('user_phone', 'Phone không được để trống').notEmpty();
      req.checkBody('user_Password', 'Mật khẩu không được để trống').notEmpty();
      req.checkBody('user_Email', 'Email không được để trống').notEmpty().isEmail();
      req.checkBody('confirm_Password', 'Xác nhận mật khẩu không được để trống').notEmpty();
      req.checkBody('confirm_Password', 'Xác nhận mật khẩu không khớp').equals(req.body.user_Password);

      respData.errors = req.validationErrors();

      if (respData.errors) {
          return res.json(respData);
      }

      const { user_Name, user_Gender, user_phone, user_Password, user_Email } = req.body;

      const existingUser = await UserModel.findOne({ user_Email: user_Email }).lean();

      if (existingUser) {
          respData.errors = [{ msg: 'Email đã tồn tại' }];
          return res.json(respData);
      }

      const salt = await BcryptJs.genSalt(10);
      const hashedPassword = await BcryptJs.hash(user_Password, salt);

      const newUser = await UserModel.create({
          user_Name,
          user_Gender,
          user_phone,
          user_Password: hashedPassword,
          user_Email,
          user_Role: { role: 'CUSTOMER' } 
      });

      respData.isSucceed = true;
      respData.message = 'Đăng ký thành công';

      console.log('New user registered:', newUser); 

      return res.json(respData);
  } catch (error) {
      console.error('Error registering user:', error);
      respData.errors = [{ msg: 'Lỗi khi đăng ký người dùng' }];
      return res.json(respData);
  }
});
router.get('/order-history', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/dang-nhap.html');
  }

  try {
    const customerId = req.user.user_id 
    console.log('Customer ID:', customerId);
    const user_id = req.user.user_id;
    // Retrieve order history
    const orderHistory = await Order.aggregate([
      {
        $match: {
          user_id: customerId 
        }
      },
      {
        $lookup: {
          from: 'tbl_payment',
          localField: 'session_idA',
          foreignField: 'session_idA',
          as: 'payment_details'
        }
      },
      {
        $lookup: {
          from: 'tbl_diachi',
          localField: 'customer_tinh',
          foreignField: 'ma_tinh',
          as: 'address_details'
        }
      },
      {
        $lookup: {
          from: 'tbl_diachi',
          localField: 'customer_huyen',
          foreignField: 'ma_qh',
          as: 'address_details1'
        }
      },
      {
        $lookup: {
          from: 'tbl_diachi',
          localField: 'customer_xa',
          foreignField: 'ma_px',
          as: 'address_details2'
        }
      },
      {
        $lookup: {
          from: 'tbl_carta',
          localField: 'session_idA',
          foreignField: 'session_idA',
          as: 'cartA'
        }
      },
      {
        $project: {
          order_id: 1,
          user_id:1,
          session_idA: 1,
          loaikhach: 1,
          customer_name: 1,
          customer_phone: 1,
          customer_diachi: 1,
          phuong_xa: { $arrayElemAt: ['$address_details2.phuong_xa', 0] },
          quan_huyen: { $arrayElemAt: ['$address_details1.quan_huyen', 0] },
          tinh_tp: { $arrayElemAt: ['$address_details.tinh_tp', 0] },
          order_date: { $arrayElemAt: ['$payment_details.order_date', 0] },
          giaohang: { $arrayElemAt: ['$payment_details.giaohang', 0] },
          thanhtoan: { $arrayElemAt: ['$payment_details.thanhtoan', 0] },
          statusA: { $arrayElemAt: ['$payment_details.statusA', 0] }.$arrayElemAt,
          sanpham_tieude: { $arrayElemAt: ['$cartA.sanpham_tieude', 0] },
          sanpham_gia: { $arrayElemAt: ['$cartA.sanpham_gia', 0] },
          quantitys: { $arrayElemAt: ['$cartA.quantitys', 0] },
        }
      }
    ]);

    console.log('Order History:', orderHistory);
    const cartItems = await Cart.find({ user_id: user_id });
    // Render order history page
    res.render('site/history', { orders: orderHistory,cartItems, user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


module.exports = router;
