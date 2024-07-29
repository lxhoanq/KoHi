const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    order_id: { type: Number, required: true },
    session_idA: { type: String, required: true },
    customer_name: { type: String, required: true },
    customer_phone: { type: String, required: true },
    customer_tinh: { type: String, required: true },
    customer_huyen: { type: String, required: true },
    customer_xa: { type: String, required: true },
    customer_diachi: { type: String, required: true },
    user_id: { type: Number, required: true }
  },
  { collection: 'tbl_order' }
);

OrderSchema.plugin(require('../modules/auto-increment').getInstance().plugin, {
  model: 'tbl_order',
  field: 'order_id'
});

module.exports = mongoose.model('tbl_order', OrderSchema);
