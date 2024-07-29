const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Diachi = require('../models/address');
const Cart = require('../models/cart');
const User = require('../models/user');
const { ensureAuthenticated } = require('../modules/auth');

// Render the delivery page with cart items and list of provinces
router.get('/delivery', ensureAuthenticated, async (req, res) => {
    const session_idA = req.sessionID;
    const user_id = req.user.user_id;

    try {
        const show_cart = await Cart.find({ session_idA });
        
        // Calculate total amount (TT)
        let TT = 0;
        show_cart.forEach(cart => {
            TT += parseInt(cart.sanpham_gia) * parseInt(cart.quantitys);
        });

        // Get list of provinces
        const show_diachi = await Diachi.aggregate([
            { $group: { _id: { ma_tinh: "$ma_tinh", tinh_tp: "$tinh_tp" } } },
            { $sort: { "_id.tinh_tp": 1 } }
        ]).exec();

        // Lookup user and join with address data
        const userDetails = await User.aggregate([
            { $match: { user_id: user_id } },
            {
                $lookup: {
                    from: 'tbl_diachi',
                    localField: 'customer_tinh',
                    foreignField: 'ma_tinh',
                    as: 'tinh_tp_info'
                }
            },
            {
                $lookup: {
                    from: 'tbl_diachi',
                    localField: 'customer_huyen',
                    foreignField: 'ma_qh',
                    as: 'quan_huyen_info'
                }
            },
            {
                $lookup: {
                    from: 'tbl_diachi',
                    localField: 'customer_xa',
                    foreignField: 'ma_px',
                    as: 'phuong_xa_info'
                }
            }
        ]).exec();

        const user = userDetails.length > 0 ? userDetails[0] : null;
        const cartItems = await Cart.find({ user_id: user_id });
        // Render the delivery.ejs template with data
        res.render('site/delivery', {cartItems, user, show_cart, show_diachi, TT, userAddress: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/delivery', ensureAuthenticated, async (req, res) => {
    const { customer_name, customer_phone, customer_tinh, customer_huyen, customer_xa, customer_diachi, use_saved_address } = req.body;

    try {
        let addressInfo;

        if (use_saved_address === 'true') {
            // Use saved address information
            addressInfo = {
                customer_name: req.user.user_Name,
                customer_phone: req.user.user_phone,
                customer_tinh: req.user.customer_tinh || '',
                customer_huyen: req.user.customer_huyen || '',
                customer_xa: req.user.customer_xa || '',
                customer_diachi: req.user.customer_diachi || ''
            };
        } else {
            // New address entered
            addressInfo = {
                customer_name,
                customer_phone,
                customer_tinh,
                customer_huyen,
                customer_xa,
                customer_diachi
            };

            // Check if user already has an address
            const user = await User.findOne({ user_id: req.user.user_id });
            if (!user.customer_tinh || !user.customer_huyen || !user.customer_xa || !user.customer_diachi) {
                // Update user with new address information
                await User.updateOne(
                    { user_id: req.user.user_id },
                    { $set: { 
                        customer_tinh, 
                        customer_huyen, 
                        customer_xa, 
                        customer_diachi 
                    } 
                });
            }
        }

        // Create a new order with the address information
        const newOrder = new Order({
            user_id: req.user.user_id,
            session_idA: req.sessionID, // Ensure session_idA is included
            ...addressInfo,
            cart_items: req.session.cart_items || [], // Handle undefined cart_items
            total_amount: req.session.total_amount || 0 // Handle undefined total_amount
        });

        await newOrder.save();
        res.redirect('/payment'); // Redirect to payment page
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


// Endpoint to fetch districts/huyens based on selected province/tinh
router.get('/delivery/diachiqh', async (req, res) => {
    const { tinh_id } = req.query;
    try {
        const diachi_qh = await Diachi.aggregate([
            { $match: { ma_tinh: tinh_id } },
            { $group: { _id: { ma_qh: "$ma_qh", quan_huyen: "$quan_huyen" } } }
        ]).exec();
        res.json(diachi_qh);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint to fetch wards/xas based on selected district/quan_huyen
router.get('/delivery/diachipx', async (req, res) => {
    const { quan_huyen_id } = req.query;
    try {
        const diachi_px = await Diachi.aggregate([
            { $match: { ma_qh: quan_huyen_id } },
            { $group: { _id: { ma_px: "$ma_px", phuong_xa: "$phuong_xa" } } }
        ]).exec();
        res.json(diachi_px);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
