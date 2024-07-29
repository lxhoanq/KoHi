const express = require('express');
const router = express.Router();
const Carta = require('../models/carta');
const Order = require('../models/order');

// Middleware to ensure session exists
const ensureSession = (req, res, next) => {
  if (!req.sessionID) {
    return res.redirect('/');
  }
  next();
};

router.get('/success', ensureSession, async (req, res) => {
  try {
    const sessionID = req.sessionID;
    const user_id = req.user.user_id;
    const cartItems = await Carta.find({ session_idA: sessionID, user_id });
    res.render('site/success', { cartItems, sessionID, user: req.user });
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).send('Server Error');
  }
});

// Route to handle "Continue Shopping" button
router.get('/continue-shopping', async (req, res) => {
  try {
    // Store the user information
    const user = req.user;

    // Regenerate the session
    req.session.regenerate((err) => {
      if (err) {
        console.error('Error regenerating session:', err);
        return res.status(500).send('Server Error');
      }

      // Reassign user information to the new session
      req.session.user = user;
      req.user = user;

      // Save the session
      req.session.save((err) => {
        if (err) {
          console.error('Error saving session:', err);
          return res.status(500).send('Server Error');
        }

        // Redirect to the home page
        res.redirect('/');
      });
    });
  } catch (error) {
    console.error('Error during session regeneration:', error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
