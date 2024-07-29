const express = require('express');
const router = express.Router();
const Cart = require('../models/cart'); // Import the Cart model
const { ensureAuthenticated } = require('../modules/auth'); // Middleware to check if the user is authenticated

// Route to get cart items
router.get('/cart', ensureAuthenticated, async (req, res) => {
    try {
        const session_idA = req.sessionID; // Get current user's session_idA
        const user_id = req.user.user_id; // Get current user's user_id
        const cartItems = await Cart.find({ session_idA: session_idA, user_id: user_id }); // Find current user's cart

        let SL = 0;
        let TT = 0;
        cartItems.forEach(item => {
            SL += item.quantitys;
            TT += parseInt(item.sanpham_gia.replace(/\D/g, '')) * item.quantitys;
        });
        console.log(cartItems);
        res.render('site/cart', {
            user: req.user,
            cartItems,
            SL,
            TT,
            freeShipThreshold: 600000,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Route to delete item from cart
router.get('/cart/delete/:id', async (req, res) => {
    try {
        const cartId = req.params.id;
        // Delete product from user's cart
        await Cart.deleteOne({ cart_id: cartId, session_idA: req.sessionID, user_id: req.user.user_id });
        res.redirect('/cart');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Route to add item to cart
router.post('/cart', async (req, res) => {
    try {
        const { sanpham_id, sanpham_tieude, sanpham_anh, color_anh, sanpham_gia, quantitys, sanpham_size } = req.body;
        const session_idA = req.sessionID;
        const user_id = req.user.user_id;

        // Create a new cart item
        const newCartItem = new Cart({
            session_idA,
            user_id,
            sanpham_id,
            sanpham_tieude,
            sanpham_anh,
            color_anh,
            sanpham_gia,
            quantitys,
            sanpham_size
        });

        // Save the cart item to the database
        await newCartItem.save();

        res.status(200).send('Item added to cart successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Route to fetch mini cart items
router.get('/cart/mini', ensureAuthenticated, async (req, res) => {
    try {
        const session_idA = req.sessionID;
        const user_id = req.user.user_id;
        const cartItems = await Cart.find({ session_idA: session_idA, user_id: user_id });
 
        res.json(cartItems);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});


module.exports = router;
