const mongoose = require('mongoose');

const CartaSchema = new mongoose.Schema(
  {
    cartA_id: { type: Number, required: true },
    sanpham_anh: { type: String, required: true },
    session_idA: { type: String, required: true },
    user_id: { type: String, required: true }, 
    sanpham_id: { type: Number, required: true },
    sanpham_tieude: { type: String, required: true },
    sanpham_gia: { type: String, required: true },
    color_anh: { type: String, required: true },
    quantitys: { type: String, required: true },
    sanpham_size: { type: String, required: true }
  },
  { collection: 'tbl_carta' }
);

CartaSchema.plugin(require('../modules/auto-increment').getInstance().plugin, {
  model: 'tbl_carta',
  field: 'cartA_id'
});

module.exports = mongoose.model('tbl_carta', CartaSchema);
