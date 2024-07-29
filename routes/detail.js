const express = require('express');
const router = express.Router();
const Carta = require('../models/carta');
const Order = require('../models/order');
const Payment = require('../models/payment');
const Diachi = require('../models/address');

// Middleware to ensure session exists
const ensureSession = (req, res, next) => {
  if (!req.sessionID) {
    return res.redirect('/');
  }
  next();
};

router.get('/detail', ensureSession, async (req, res) => {
  try {
    const sessionID = req.sessionID;
    const cartItems = await Carta.find({ session_idA: sessionID });
    const payment = await Payment.findOne({ session_idA: sessionID });

    // Fetch order details and enrich with address information
    const orderDetails = await Order.aggregate([
      { $match: { session_idA: sessionID } },
      {
        $lookup: {
          from: 'tbl_diachi',
          let: { tinh: "$customer_tinh", huyen: "$customer_huyen", xa: "$customer_xa" },
          pipeline: [
            { $match: { $expr: { $and: [
                { $eq: ["$ma_tinh", "$$tinh"] },
                { $eq: ["$ma_qh", "$$huyen"] },
                { $eq: ["$ma_px", "$$xa"] }
              ] } }
            },
            { $project: { tinh_tp: 1, quan_huyen: 1, phuong_xa: 1 } }
          ],
          as: 'address_info'
        }
      },
      {
        $unwind: {
          path: '$address_info',
          preserveNullAndEmptyArrays: true
        }
      }
    ]).exec();

    const order = orderDetails.length > 0 ? orderDetails[0] : null;

    res.render('site/detail', { cartItems, order, payment, sessionID, user: req.user });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
