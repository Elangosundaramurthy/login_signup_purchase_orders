// controller/authOrderController.js
const Purchase = require('../model/purchase');
const Order = require('../model/orderModel');
class AuthOrderController {
  async signup(req, res) {
    try {
      const { firstName, lastName, email, password, confirmPassword } = req.body;
      if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
      }
      const customer_id = generateCustomerId();
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }
      const newUser = new User({ customer_id, firstName, lastName, email, password });
      await newUser.save();
      res.status(201).json({ message: 'User created successfully', customer_id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const orders = await Order.aggregate([
        {
          $match: {
            customer_id: user.customer_id
          }
        },
        {
          $project: {
            order_status: 1
          }
        }
      ]);
      if (orders.length === 0) {
        return res.status(200).json({ message: 'Login successful' });
      }
      res.status(200).json({ message: 'Login successful with orders', customer_id: user.customer_id, order_status: orders[0].order_status });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }


  async createOrder(req, res) {
    try {
      const order = await Order.create(req.body);
      res.status(201).json({
        status: 'success',
        data: {
          order
        }
      });
    } catch (err) {
      res.status(400).json({
        status: 'fail',
        message: err.message
      });
    }
  }
  async getAllOrders(req,res) {
    try {
      const orders = await Order.find();
      res.status(200).json({
        status: 'success',
        results: orders.length,
        data: {
          orders
        }
      });
    } catch (err) {
      res.status(400).json({
        status: 'fail',
        message: err.message
      });
    }
  }
//-----------------------------------------------------
async purchase_list(req, res) {
  try {
    const orders = await Purchase.find();
    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: {
        orders
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
}
//---------------------------------------------------

  async getOrderStatus(req, res) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const order = await Order.findOne({ customer_id: user.customer_id });
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.status(200).json({ order_status: order.order_status });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  async update(req, res) {
    const customerId = req.params.customerId;
    const updatedOrder = req.body;
    try {
        const foundOrder = await Order.findOne({ customer_id: customerId });
        if (!foundOrder) {
            return res.status(404).json({ error: "Customer ID not found" });
        }
        foundOrder.order_id = updatedOrder.order_id || foundOrder.order_id;
        foundOrder.order_date = updatedOrder.order_date || foundOrder.order_date;
        foundOrder.product_details = updatedOrder.product_details || foundOrder.product_details;
        foundOrder.batch_no= updatedOrder.batch_no || foundOrder.batch_no;

        const savedOrder = await foundOrder.save();
        res.json(savedOrder);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to update order" });
    }
}
async delete(req, res) {
  const customerId = req.params.customerId;

  try {
      const deletionResult = await Order.deleteMany({ customer_id: customerId });
      if (deletionResult.deletedCount === 0) {
          return res.status(404).json({ error: "No orders found for the given customer ID" });
      }
      res.json({ message: "Orders deleted successfully" });
  } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to delete orders" });
  }
}
async purchase(req, res) {
  try {
    const purchaseData = req.body;
    const purchase = await Purchase.create(purchaseData);
    res.status(201).json({
      status: 'success',
      data: {
        purchase
      }
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
}

async headercount(req, res) {
  try {
      const totalCount = await Purchase.countDocuments();
      const outOfStockCount = await Purchase.countDocuments({ Nature_of_Order: 'out of stock' });
      const deliveredCount = await Purchase.countDocuments({ Nature_of_Order: 'Deliverd'});
      const Nature_of_Ordercount = await Purchase.countDocuments({ Nature_of_Order: 'Stock filling' });
      res.status(200).json({
          totalCount,
          outOfStockCount,
          deliveredCount,
          Nature_of_Ordercount
      });
  } catch (error) {
      console.error('Error retrieving purchase stats:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
}


async purchasefiltering(req, res) {
  try {
    const { productDetails, batchNo, quantity, material, division, size, category, subCategory, brand, grade, warehouseStatus, vehicleNumber, Nature_of_Order, unloadingDate, ETA } = req.body;
    const filter = {};
    if (productDetails) filter.productDetails = productDetails;
    if (batchNo) filter.batchNo = batchNo;
    if (quantity) filter.quantity = quantity; 
    if (material) filter.material = material;
    if (division) filter.division = division;
    if (size) filter.size = size;
    if (batchNo) filter.batchNo = batchNo;
    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    if (brand) filter.brand = brand;
    if (grade) filter.grade = grade;
    if (warehouseStatus) filter.warehouseStatus = warehouseStatus;
    if (vehicleNumber) filter.vehicleNumber = vehicleNumber;
    if (unloadingDate) filter.unloadingDate = unloadingDate;
    if (ETA) filter.ETA = ETA;
    if (Nature_of_Order) filter.Nature_of_Order = Nature_of_Order;
    const filteredOrders = await Purchase.find(filter);
    res.status(200).json({ filteredOrders });
  } catch (error) {
    console.error('Error retrieving filtered orders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }}

async orderheadercount(req, res){
  try{
    const Ordercount =await Order.countDocuments();
    const deliverd_status = await Order.countDocuments({order_status:'Deliverd'});
    const ready_for_deliverd = await Order.countDocuments({order_status:'Ready for Delivery'});
    const out_for_deliver = await Order.countDocuments({order_status:'Out for Delivery'});
    const pendingforstock = await Order.countDocuments({stock_availability:'pending for stock'});
    const damaged = await Order.countDocuments({order_status:'Damaged product'}); 
    res.status(200).json({
      Ordercount,
      deliverd_status,
      ready_for_deliverd,
      out_for_deliver,
      pendingforstock,damaged
    });
  }catch (error) {
    console.error('Error retrieving order stats:', error);
    res.status(500).json({ error: 'Internal Server Error' });
}
}

async orderfiltering(req, res) {
  try {
    const { order_id, customer_id, order_date, product_details, batch_no, quantity, stock_availability, unavailable_quantity, damaged_product, eta_unavailable_stock, eta_damaged_stock, order_total, payment_received,order_status,sales_person, delivery_date}= req.body;
    const filter = {};
    if (order_id) filter.order_id = order_id;
    if (customer_id) filter.customer_id = customer_id;
    if (order_date) filter.order_date =order_date;
    if (product_details) filter.product_details = product_details;
    if (batch_no) filter.batch_no = batch_no;
    if (quantity) filter.quantity = quantity;
    if (stock_availability) filter.stock_availability = stock_availability;
    if (unavailable_quantity) filter.unavailable_quantity = unavailable_quantity;
    if (damaged_product) filter.damaged_product = damaged_product;
    if (eta_unavailable_stock) filter.eta_unavailable_stock = eta_unavailable_stock;
    if ( eta_damaged_stock) filter. eta_damaged_stock =  eta_damaged_stock;
    if (order_total) filter.order_total =order_total;
    if (payment_received) filter.payment_received = payment_received;
    if (order_status) filter.order_status = order_status;
    if (sales_person) filter.sales_person = sales_person;
    if (delivery_date) filter.delivery_date = delivery_date;

    const filteredOrders = await Order.find(filter);
    res.status(200).json({ filteredOrders });
  } catch (error) {
    console.error('Error retrieving filtered orders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}



}
function generateCustomerId() {
  const customer_id = 'DNSPCUST' + Math.random(0, 400);
  return customer_id;
}
module.exports = new AuthOrderController();