const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    user_Name: { type: String, required: true }, 
    user_Gender: { type: Number, required: true },
    user_birth: { type: Date, required: true, default: Date.now },
    user_Password: { type: String, required: true },
    user_Email: { type: String, required: true },
    user_phone: { type: String, required: true },
    user_Role: { type: Object, required: true },
    customer_diachi: { type: String, default: null },
    customer_tinh: { type: String, default: null },
    customer_huyen: { type: String, default: null },
    customer_xa: { type: String, default: null }
  },
  { collection: 'tbl_users' }
);

UserSchema.plugin(require('../modules/auto-increment').getInstance().plugin, {
  model: 'tbl_users',
  field: 'user_id'
});

module.exports = mongoose.model('tbl_users', UserSchema);
