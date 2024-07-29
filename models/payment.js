const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    payment_id: { type: Number, required: true },
    session_idA: { type: String, required: true },
    giaohang: { type: String, required: true },
    thanhtoan: { type: String, required: true },
    order_date: { type: String, required: true },
    statusA: { type: String, required: true },
    user_id: { type: Number, required: true }
  },
  { collection: 'tbl_payment' }
);

PaymentSchema.plugin(require('../modules/auto-increment').getInstance().plugin, {
  model: 'tbl_payment',
  field: 'payment_id'
});

module.exports = mongoose.model('tbl_payment', PaymentSchema);
