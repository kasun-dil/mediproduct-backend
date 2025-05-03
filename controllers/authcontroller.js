import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Register controller
export const register = async (req, res) => {
  const {
    firstName,
    lastName,
    phoneNumber,
    email,
    password,
    userType = 'user', // default role
  } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists. Please sign in.' });
    }

    // Create new user
    const newUser = await User.create({
      firstName,
      lastName,
      phoneNumber,
      email,
      password,
      userType,
    });

    // Success response
    res.status(201).json({
      message: 'User registered successfully',
      _id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      phoneNumber: newUser.phoneNumber,
      email: newUser.email,
      userType: newUser.userType,
      token: generateToken(newUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// Signin controller
export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({
      message: 'Login successful',
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      email: user.email,
      userType: user.userType,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

// Controller to get all users
export const getAllUsers = async (req, res) => {
    try {
      const users = await User.find().select('-password'); // Exclude password
  
      if (!users || users.length === 0) {
        return res.status(404).json({ message: 'No users found.' });
      }
  
      res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Failed to retrieve users', error: error.message });
    }
  };
  
// Controller to delete a user
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the user exists and delete the user
    const result = await User.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};

