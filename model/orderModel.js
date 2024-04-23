// models/orderModel.js

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  order_id: String,
  customer_id: String,
  order_date: Date,
  product_details: String,
  batch_no: String,
  quantity: Number,
  stock_availability: String,
  unavailable_quantity: Number,
  damaged_product: Boolean,
  eta_unavailable_stock: String,
  eta_damaged_stock: String,
  order_total: Number,
  payment_received: Boolean,
  order_status: String,
  sales_person: String,
  delivery_date: Date
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
