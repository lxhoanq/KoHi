const mongoose = require('mongoose');

const DanhmucSchema = new mongoose.Schema(
  {
    danhmuc_id: { type: Number, required: true },
    danhmuc_ten: { type: String, required: true }
  },
  { collection: 'tbl_danhmuc' }
);

DanhmucSchema.plugin(require('../modules/auto-increment').getInstance().plugin, {
  model: 'tbl_danhmuc',
  field: 'danhmuc_id'
});

module.exports = mongoose.model('tbl_danhmuc', DanhmucSchema);
