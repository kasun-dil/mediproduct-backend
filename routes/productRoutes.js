import express from 'express';
import {
  addProduct,
  getAllProducts,
  getProductById,
  deleteProduct,
  updateProduct
} from '../controllers/productController.js';
import upload from '../config/MulterConfig.js';

const router = express.Router();

router.post('/add', upload.single('image'), addProduct);// Add product
router.get('/', getAllProducts); // Get all products
router.put('/:id', upload.single('image'), updateProduct); // Update product
router.get('/:id', getProductById); // Get product by ID
router.delete('/:id', deleteProduct); // Delete product by ID

export default router;
