const mongoose = require('mongoose');

const LoaisanphamSchema = new mongoose.Schema(
  {
    loaisanpham_id: { type: Number, required: true },
    danhmuc_id: { type: Number , ref: 'tbl_danhmuc', required: true },
    loaisanpham_ten: { type: String, required: true }
  },
  { collection: 'tbl_loaisanpham' }
);
LoaisanphamSchema.plugin(require('../modules/auto-increment').getInstance().plugin, {
  model: 'tbl_loaisanpham',
  field: 'loaisanpham_id'
});

module.exports = mongoose.model('tbl_loaisanpham', LoaisanphamSchema);
