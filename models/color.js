const mongoose = require('mongoose');

const ColorSchema = new mongoose.Schema(
  {
    color_id: { type: Number, required: true },
    color_ten: { type: String, required: true },
    color_anh: { type: String, required: true }
  },
  { collection: 'tbl_color' }
);

ColorSchema.plugin(require('../modules/auto-increment').getInstance().plugin, {
  model: 'tbl_color',
  field: 'color_id'
});

module.exports = mongoose.model('tbl_color', ColorSchema);
