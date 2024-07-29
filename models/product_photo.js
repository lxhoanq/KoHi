const mongoose = require('mongoose');

const SanphamAnhSchema = new mongoose.Schema(
  {
    sanpham_anh_id: { type: Number, required: true },
    sanpham_id: { type: Number, required: true },
    sanpham_anh: { type: String, required: true }
  },
  { collection: 'tbl_sanpham_anh' }
);

SanphamAnhSchema.plugin(require('../modules/auto-increment').getInstance().plugin, {
  model: 'tbl_sanpham_anh',
  field: 'sanpham_anh_id'
});

module.exports = mongoose.model('tbl_sanpham_anh', SanphamAnhSchema);
