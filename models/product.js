const mongoose = require('mongoose');

const SanphamSchema = new mongoose.Schema(
  {
    sanpham_id: { type: Number, required: true },
    sanpham_tieude: { type: String, required: true },
    sanpham_ma: { type: String, required: true },
    danhmuc_id: { type: Number, required: true },
    loaisanpham_id: { type: Number, required: true },
    color_id: { type: Number, required: true },
    sanpham_gia: { type: String, required: true },
    sanpham_chitiet: { type: String, required: true },
    sanpham_baoquan: { type: String, required: true },
    sanpham_anh: { type: String, required: true }
  },
  { collection: 'tbl_sanpham' }
);

SanphamSchema.plugin(require('../modules/auto-increment').getInstance().plugin, {
  model: 'tbl_sanpham',
  field: 'sanpham_id'
});

module.exports = mongoose.model('tbl_sanpham', SanphamSchema);
