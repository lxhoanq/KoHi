const mongoose = require('mongoose');

const UserAddressSchema = new mongoose.Schema({
  user_id: { type: Number, required: true },
  customer_diachi: { type: String, required: true },
  phuong_xa: { type: String, required: true },
  quan_huyen: { type: String, required: true },
  tinh_tp: { type: String, required: true }
}, { collection: 'tbl_user_address' });

module.exports = mongoose.model('tbl_user_address', UserAddressSchema);