const BcryptJs = require('bcryptjs');
const Passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const UserModel = require('../models/user');
const UserRole = require('../constants/user-role');

Passport.use(
  new LocalStrategy(
    {
      usernameField: 'user_Email', 
      passwordField: 'user_Password' 
    }, 
    async (username, password, done) => {
      try {
        const user = await UserModel.findOne({ user_Email: username }).lean();
        
        if (!user) {
          return done(null, false, { message: 'Tên đăng nhập không đúng' });
        }

        const passwordMatch = await BcryptJs.compare(password, user.user_Password);
        
        if (!passwordMatch) {
          return done(null, false, { message: 'Mật khẩu không đúng' });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

Passport.serializeUser((user, done) => {
  done(null, user._id); // Sử dụng _id của user để serialize
});

Passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findById(id).lean();
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports.auth = () => {
  return Passport.authenticate(
    'local', {
      failureRedirect: '/dang-nhap.html',
      failureFlash: true
    }
  );
};

module.exports.requireAuth = async (req, res, next, checkAdmin = true) => {
  let bIsValid = false;

  if (req.isAuthenticated()) {
    const user = await UserModel.findById(req.session.passport.user).lean();
    if (user) {
      if (!checkAdmin) {
        bIsValid = true;
      } else {
        const userRoles = user.user_Role.role;

        if (userRoles === UserRole.admin) {
          bIsValid = true;
        } else if (userRoles === UserRole.stocker && req.baseUrl.toLowerCase().startsWith('/admin/user')) {
          bIsValid = false;
        } else if (userRoles === UserRole.customer && req.baseUrl.toLowerCase().startsWith('/admin')) {
          bIsValid = false;
        } else {
          bIsValid = true;
        }
      }
    }
  }

  if (bIsValid) {
    return next();
  } else {
    return res.redirect(`/dang-nhap.html?returnUrl=${encodeURI(req.originalUrl)}`);
  }
};
