const express = require('express');
const router = express.Router();

router.get('/index_admin.html', (req, res) => {
  if (req.isAuthenticated() && req.user.user_Role.role === 'ADMIN') {
    return res.render('admin/index');
  }
  res.redirect('/dang-nhap.html');
});

module.exports = router;
