const { Admin } = require("../../model/adminModel");
const bcrypt = require("bcrypt");
const { Access } = require("../../model/accessLevel");
const { User } = require("../../model/usersModel");

const { v4: uuidv4 } = require('uuid');

const salt_value = "$2b$10$xcYJV4cALm1cpoWEZy2Yfu";

exports.find_admin_doc = async (condition, projection) => {};

const hashPassword = async (password) => {
  try {
    // Generate a salt
    const salt = salt_value;
    // Hash the password using the salt
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error; // Handle the error appropriately
  }
};

exports.saveAdmin = async (req_body) => {
  const password = await hashPassword(req_body.password);
  const username = req_body.username;
  const mobile = req_body.mobile;

  const is_admin = true;

  const admin = new Admin({
    username: username,
    password: password,
    is_admin: is_admin,
    mobile: mobile,
  });

  const savedAdmin = await admin.save();
  return { data: { admin: savedAdmin }, code: 200, error: "" };
};

exports.updateUserAceess = async (req_body, user_id) => {
  const { access_data, product } = req_body;

  const { view, add, update, deletes } = access_data;

  const updatedAdmin = await Access.findOneAndUpdate(
    { user_id: user_id, access: product },
    { $set: { view: view, update: update, add: add, deletes: deletes } },
    { new: true }
  );
  return { data: { user: updatedAdmin }, code: 200, error: "" };
};

exports.fetchUsers = async (page, limits) => {
  const users = await User.aggregate([
    // { $addFields: { userId: { $toString: "$_id" } } },
    {
      $lookup: {
        from: "accesses",
        localField: "_id",
        foreignField: "user_id",
        as: "accesslevel",
      },
    },
  ])
    .skip((page - 1) * limits)
    .limit(parseInt(limits));
  return { data: { user: users }, code: 200, error: "" };
};

exports.deleteUser = async (user_id) => {
  const deletedUser = await User.findByIdAndDelete(user_id);
  if (!deletedUser) {
    return { error: "User not found", code: 404, data: {} };
  } else {
    return { data: { user: deletedUser }, code: 200, error: "User deleted successfully" };
  }
};


exports.authenticate = async (req_body) => {
  const password = req_body.password
  const hashedPassword = await bcrypt.hash(password, salt_value);

  let [admin_user] = await Admin.find({ username: req_body.username, password: hashedPassword }).exec()
  if (!admin_user) {
      return { error: "UnAuthorized access denied", code: 401, data: {}}
  }
  let token = uuidv4().toString()
  const updatedAdmin = await Admin.findOneAndUpdate(
      { _id: admin_user._id }, // Filter criteria (in this case, by user ID)
      { $set: { token: token } }, // Update operation
      { new: true } // Option to return the modified document
  );
  return { data: { user: updatedAdmin, token: token }, code: 200, error: ""}
}