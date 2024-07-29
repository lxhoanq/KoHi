const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Payment = require('../models/payment');
const Address = require('../models/address');
const Product = require('../models/product');
const mongoose = require('mongoose');
router.get('/orderlist', async (req, res) => {
  try {
    const unfinishedOrders = await Order.aggregate([
      {
        $lookup: {
          from: 'tbl_payment', // collection to join with
          localField: 'session_idA', // field from the orders collection
          foreignField: 'session_idA', // field from the payment collection
          as: 'payment_details' // output array field
        }
      },
      {
        $lookup: {
          from: 'tbl_diachi', // collection to join with
          localField: 'customer_tinh', // field from the orders collection
          foreignField: 'ma_tinh', // field from the address collection
          as: 'address_details' // output array field
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
        $match: {
          'payment_details.statusA': "0"
        }
      },
      {
        $project: {
          customer_diachi: 1,
          quan_huyen: { $arrayElemAt: ['$address_details1.quan_huyen', 0] },
          customer_name: 1,
          customer_phone: 1,
          tinh_tp: { $arrayElemAt: ['$address_details.tinh_tp', 0] },
          phuong_xa: { $arrayElemAt: ['$address_details2.phuong_xa', 0] },
          loaikhach: 1,
          order_id: 1,
          session_idA: 1,
          giaohang: { $arrayElemAt: ['$payment_details.giaohang', 0] },
          order_date: { $arrayElemAt: ['$payment_details.order_date', 0] },
          thanhtoan: { $arrayElemAt: ['$payment_details.thanhtoan', 0] },
          statusA: { $arrayElemAt: ['$payment_details.statusA', 0] }
        }
      }
    ]);

    console.log(unfinishedOrders);
    res.render('admin/orderlist', { orders: unfinishedOrders, user: req.user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get('/orderlistall', async (req, res) => {
  try {
    const allOrders = await Order.aggregate([
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
          localField: 'customer_tinh', // field from the orders collection
          foreignField: 'ma_tinh', // field from the address collection
          as: 'address_details' // output array field
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
        $project: {
          order_id: 1,
          session_idA: 1,
          loaikhach: 1,
          customer_name: 1,
          customer_phone: 1,
          phuong_xa: { $arrayElemAt: ['$address_details2.phuong_xa', 0] },
          quan_huyen: { $arrayElemAt: ['$address_details1.quan_huyen', 0] },
          tinh_tp : { $arrayElemAt: ['$address_details.tinh_tp', 0] },
          customer_diachi: 1,
          order_date: { $arrayElemAt: ['$payment_details.order_date', 0] },
          giaohang: { $arrayElemAt: ['$payment_details.giaohang', 0] },
          thanhtoan: { $arrayElemAt: ['$payment_details.thanhtoan', 0] },
          statusA: { $arrayElemAt: ['$payment_details.statusA', 0] }
        }
      }
    ]);

    console.log(allOrders); 
    res.render('admin/orderlistall', { orders: allOrders, user: req.user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get('/orderlistdone', async (req, res) => {
  try {
    const completedOrders = await Order.aggregate([
      {
        $lookup: {
          from: 'tbl_payment', // collection to join with
          localField: 'session_idA', // field from the orders collection
          foreignField: 'session_idA', // field from the payment collection
          as: 'payment_details' // output array field
        }
      },
      {
        $unwind: '$payment_details' 
      },
      {
        $match: {
          'payment_details.statusA': '1' 
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
        $project: {
          order_id: 1,
          session_idA: 1,
          loaikhach: 1,
          customer_name: 1,
          customer_phone: 1,
          phuong_xa: { $arrayElemAt: ['$address_details2.phuong_xa', 0] },
          quan_huyen: { $arrayElemAt: ['$address_details1.quan_huyen', 0] },
          tinh_tp: { $arrayElemAt: ['$address_details.tinh_tp', 0] },
          customer_diachi: 1,
          order_date: '$payment_details.order_date',
          giaohang: '$payment_details.giaohang',
          thanhtoan: '$payment_details.thanhtoan',
          statusA: '$payment_details.statusA'
        }
      }
    ]);

    console.log(completedOrders);
    res.render('admin/orderlistdone', { orders: completedOrders, user: req.user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get('/index_admin.html', (req, res) => {
  if (req.isAuthenticated() && req.user.user_Role.role === 'ADMIN') {
    return res.render('admin/index', { user: req.user });
  }
  res.redirect('/dang-nhap.html');
});

router.get('/order/:id', async (req, res) => {
  try {
      const orderId = req.params.id;

      // Fetch the order details and associated products
      const orderDetails = await Order.aggregate([
          { $match: { _id: mongoose.Types.ObjectId(orderId) } },
          {
              $lookup: {
                  from: 'tbl_carta',
                  localField: 'session_idA',
                  foreignField: 'session_idA',
                  as: 'products'
              }
          }
      ]);

      if (!orderDetails || orderDetails.length === 0) {
          return res.status(404).send('Order not found');
      }

      // Render the order details page
      res.render('admin/orderdetail', { order: orderDetails[0] });
  } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
  }
});
router.get('/completeOrder/:id', async (req, res) => {
  try {
    const orderId = req.params.id;


    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).send('Order not found');
    }

    // Update the corresponding payment status
    const updatedPayment = await Payment.findOneAndUpdate(
      { session_idA: order.session_idA },
      { statusA: '1' }, 
      { new: true }
    );

    if (!updatedPayment) {
      return res.status(404).send('Payment not found');
    }

    res.redirect('/orderlist'); 
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});
router.get('/deleteOrder/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    
    const order = await Order.findByIdAndRemove(orderId);
    
    if (!order) {
      return res.status(404).send('Order not found');
    }

    // Optionally, remove related payment records if needed
    // await Payment.deleteMany({ session_idA: order.session_idA });

    res.redirect('/orderlist'); 
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
