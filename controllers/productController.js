import Product from '../models/Product.js';
import cloudinary from '../config/CloudinaryConfig.js';

// Add a new product 
export const addProduct = async (req, res) => {
  const { title, description, type, price, stock } = req.body;
  const file = req.file;

  try {
    if (!title || !description || !type || price === undefined || !file) {
      return res.status(400).json({ message: 'Please fill all required fields and upload an image.' });
    }

    // Image URL is already available because Multer uploads it to Cloudinary automatically
    const imageUrl = file.path;

    const product = new Product({
      title,
      description,
      imageUrl,
      type,
      price,
      stock: stock || 0,
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
export const updateProduct = async (req, res) => {
    const { title, description, type, price, stock } = req.body;
    const file = req.file; // Image from the request
  
    try {
      // Check if product ID is provided in the URL
      const product = await Product.findById(req.params.id);
  
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      // If there is a new image, upload it to Cloudinary
      let imageUrl = product.imageUrl; // Default to the current image if no new image is provided
  
      if (file) {
        // Delete the old image from Cloudinary (if any)
        const publicId = product.imageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
  
        // Upload new image to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(file.path);
        imageUrl = uploadResult.secure_url; // Get the new image URL
      }
  
      // Update product details
      product.title = title || product.title;
      product.description = description || product.description;
      product.type = type || product.type;
      product.price = price !== undefined ? price : product.price;
      product.stock = stock !== undefined ? stock : product.stock;
      product.imageUrl = imageUrl;
  
      // Save the updated product
      const updatedProduct = await product.save();
  
      res.status(200).json(updatedProduct); // Send back the updated product
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
// Delete product by ID
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
