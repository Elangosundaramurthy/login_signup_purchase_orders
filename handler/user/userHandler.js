const { User } = require("../../model/usersModel");
const { Access } = require("../../model/accessLevel");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { Complaint } = require("../../model/complaintModel");

const salt_value = "$2b$10$xcYJV4cALm1cpoWEZy2Yfu";

exports.createUser = async (req_body) => {
  const { username, password, mobile, email } = req_body;

  const hashedPassword = await bcrypt.hash(password, salt_value);

  let existing = await User.findOne({username: username}, {email: email});
  if (existing) {
    return { data: { user: {} }, code: 401, error: "user present" };
  }
  const user = new User({
    username: username,
    mobile: mobile,
    password: hashedPassword,
    email: email,
  });

  const savedUser = await user.save();
  return { data: { admin: savedUser }, code: 200, error: "" };
};

exports.addComplaint = async (req_body) => {
  const {
    complaint_date,
    type_of_request,
    order_id,
    customer_id,
    order_date,
    product_details,
    batch_no,
    quantity,
    complaint,
    attending_person,
    complaint_status,
  } = req_body;

  const newComplaint = new Complaint({
    complaint_date: complaint_date,
    type_of_request: type_of_request,
    order_id: order_id,
    customer_id: customer_id,
    order_date: order_date,
    product_details: product_details,
    batch_no: batch_no,
    quantity: quantity,
    complaint: complaint,
    attending_person: attending_person,
    complaint_status: complaint_status,
  });

  const savedComplaint = await newComplaint.save();
  return { data: { complaint: savedComplaint }, code: 200, error: "" };
};

exports.authenticate = async (req_body) => {
    const { username, password  } = req_body;
    const hashedPassword = await bcrypt.hash(password, salt_value);


    let [users] = await User.find({ username: username, password: hashedPassword }).exec()
    if (!users) {
        return { error: "UnAuthorized access denied", code: 401, data: {} }
    }
    token = uuidv4().toString()

  const updatedUser = await User.findOneAndUpdate(
    { _id: users._id },
    { $set: { token: token } }, // Update operation
    { new: true } // Option to return the modified document
  );
  return { data: { user: updatedUser, token: token }, code: 200, error: "" };
};

exports.is_authorized = async (authorization_token, res) => {
  let [user] = await User.find({ token: authorization_token });
  authenticated = !user ? false : user;
  if (!user)
    return res.status(401).json({
      data: {},
      error: "UnAuthorized access denied",
    });
  return user;
};

exports.getUserAccesses = async (user_id) => {
  // const accesslevels = await Access.find({ user_id: user_id });

  const userAccessLevel = await User.aggregate([
    // { $addFields: { userId: { $toString: "$_id" } } },
    { 
      $match: {_id: user_id}
    },
    {
      $lookup: {
        from: "accesses",
        localField: "_id",
        foreignField: "user_id",
        as: "accesslevel",
      },
    },
  ])
  // console.log(accesslevels)
  return { data: { user: userAccessLevel }, code: 200, error: "" };
};

exports.listComplaints = async () => {
  try {
    const complaints = await Complaint.find();
    return complaints;
  } catch (error) {
    console.error("Error retrieving complaints:", error);
    return { code: 500, error: "Internal Server Error" };
  }
};

exports.listComplaintsBasedOnFilter = async (req_query) => {
  try {
    const { status, complaint_date, type_of_request, attending_person } =
      req_query;
    const complaints = await Complaint.find({
      status: status,
      complaint_date: complaint_date,
      type_of_request: type_of_request,
      attending_person: attending_person,
    });
    return { complaints, code: 200 };
  } catch (error) {
    console.error("Error retrieving complaints:", error);
  }
}





exports.editComplaint = async (complaintId, updatedFields) => {
  try {
    // const complaint = await Complaint.findById(complaintId);
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      complaintId,
      updatedFields,
      { new: true }
    );
    // console.log(complaintId), console.log(updatedFields);
    // console.log(updatedComplaint);

    if (!updatedComplaint) {
      return { data: {}, code: 404, error: "Complaint not found" };
    }

    return { data: updatedComplaint, code: 200, error: "" };
  } catch (err) {
    console.error("Error updating complaint:", err);
    return { code: 500, error: "Internal Server Error" };
  }
};
