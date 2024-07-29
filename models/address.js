const mongoose = require('mongoose');

const DiachiSchema = new mongoose.Schema(
  {
    tinh_tp: { type: String, default: null },
    ma_tinh: { type: String, default: null },
    quan_huyen: { type: String, default: null },
    ma_qh: { type: String, default: null },
    phuong_xa: { type: String, default: null },
    ma_px: { type: String, default: null }
  },
  { collection: 'tbl_diachi' }
);

DiachiSchema.plugin(require('../modules/auto-increment').getInstance().plugin, {
  model: 'tbl_diachi',
  field: 'id'
});

module.exports = mongoose.model('tbl_diachi', DiachiSchema);
