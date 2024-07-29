const express = require('express');
const router = express.Router();
const Payment = require('../models/payment'); // Import Payment model
const Cart = require('../models/cart'); // Import Cart model
const Carta = require('../models/carta');
const Session = require('express-session'); // Import express-session
const { ensureAuthenticated } = require('../modules/auth'); // Middleware to check if the user is authenticated

router.get('/payment', ensureAuthenticated, async (req, res) => {
    try {
        const session_idA = req.sessionID;
        const user_id = req.user.user_id;
        const cartItems = await Cart.find({ session_idA, user_id });
        const show_cart = await Cart.find({ session_idA, user_id });
        
        // Calculate total amount (TT)
        let TT = 0;
        show_cart.forEach(cart => {
            TT += parseInt(cart.sanpham_gia) * parseInt(cart.quantitys);
        });

        res.render('site/payment', {user: req.user, cartItems, show_cart, TT }); 
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Route to handle POST request for payment submission
router.post('/payment', ensureAuthenticated, async (req, res) => {
    try {
        const session_idA = req.sessionID;
        const user_id = req.user.user_id; // Assuming user_id is available in req.user
        const today = new Date().toLocaleDateString('en-GB');
        const deliver_method = req.body['deliver-method'];
        const method_payment = req.body['method-payment'];

        // Insert payment information into MongoDB
        const newPayment = new Payment({
            session_idA,
            user_id,
            giaohang: deliver_method,
            thanhtoan: method_payment,
            order_date: today,
            statusA: "0"
        });
        await newPayment.save();

        // Move cart items to tbl_carta
        const cartItems = await Cart.find({ session_idA, user_id });
        if (cartItems && cartItems.length > 0) {
            const movedItems = await Promise.all(cartItems.map(async (item) => {
                const newCartItem = new Carta({
                    sanpham_anh: item.sanpham_anh,
                    session_idA: item.session_idA,
                    user_id: item.user_id,
                    sanpham_id: item.sanpham_id,
                    sanpham_tieude: item.sanpham_tieude,
                    sanpham_gia: item.sanpham_gia,
                    color_anh: item.color_anh,
                    quantitys: item.quantitys,
                    sanpham_size: item.sanpham_size
                });
                await newCartItem.save();
                await Cart.deleteOne({ _id: item._id }); // Delete item from Cart collection
            }));
        }

        // Clear session or do necessary actions
        req.session.SL = null; // Assuming you want to clear session data

        res.redirect('/success'); // Redirect to success page
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
