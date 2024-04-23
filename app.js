const express = require("express");
const mongoose =  require("mongoose");
const bodyParser =  require("body-parser");
const adminRoutes = require("./routers/adminRoutes");
const userRoutes = require("./routers/userRoutes");
const leadRoutes = require("./routers/leadRoutes");



const app = express();
const cors = require("cors");
const MONGODB_URI = process.env.MONGOURL;
const PORT = process.env.PORT || 3000;


mongoose.connect('mongodb://analyticsdb:a2f918c5306c40caa119401c54379f11@3.110.147.84:27017/analytics-dev?authSource=admin');
const corsOptions = {
    origin: '*', // Specify the allowed origin(s)
    methods: 'GET,POST', // Specify the allowed HTTP methods
    optionsSuccessStatus: 204 // Set the status code for successful preflight requests
};


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('db CONNECTED');
})

app.use(bodyParser.json());
app.use(cors(corsOptions));

app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/order-purchase',authRoutes);


// Mount routes here

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message });
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
