// models/purchase.js
const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  productDetails: String,
  batchNo: String,
  quantity: Number,
  material: String,
  division: String,
  size: String,
  category: String,
  subCategory: String,
  brand: String,
  grade: String,
  warehouseStatus: String,
  vehicleNumber: String,
  Nature_of_Order:String,
  unloadingDate: Date,
  ETA: Date
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
