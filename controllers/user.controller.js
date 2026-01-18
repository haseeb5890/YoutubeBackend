import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
  // Registration logic here
  // get user data from req.body
  console.log("req.body:", req.body);

  const { email, password } = req.body;
  console.log(email);

  // Send a test response
  //   res.status(200).json({ message: "Test successful", email, password });

  //validate data, eg email, password not empty,check avatar and cover images
  // check if user already exists in DB
  // create a user object
  // remove password from user object before sending response
  // hash password
  // return response with success message
  //save in db
});

export default registerUser;
