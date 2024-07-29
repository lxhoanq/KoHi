const mongoose = require('mongoose');

const SanphamSizeSchema = new mongoose.Schema(
  {
    sanpham_size_id: { type: Number, required: true },
    sanpham_id: { type: Number, required: true },
    sanpham_size: { type: String, required: true }
  },
  { collection: 'tbl_sanpham_size' }
);

SanphamSizeSchema.plugin(require('../modules/auto-increment').getInstance().plugin, {
  model: 'tbl_sanpham_size',
  field: 'sanpham_size_id'
});

module.exports = mongoose.model('tbl_sanpham_size', SanphamSizeSchema);
