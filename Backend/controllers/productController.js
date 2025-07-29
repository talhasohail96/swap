import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
//add product
const addProduct = async (req, res) => {
  try {
    console.log(req.body);
    const { name, description, price, quantity, category, subCategory, sizes, bestseller } = req.body;
    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];
    const images = [image1, image2, image3, image4].filter((item) => item !== undefined);
    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, { resource_type: "image" });
        return result.secure_url;
      })
    );

    const productData = {
      name,
      description,
      category,
      price: Number(price),
      quantity: Number(quantity) || 0,
      inStock: Number(quantity) > 0,
      subCategory,
      bestseller: bestseller === "true" ? true : false,
      sizes: sizes ? sizes.split(",").map((size) => size.trim()) : [],
      image: imagesUrl,
      date: Date.now(),
    };

    const product = new productModel(productData);
    await product.save();

    res.json({ success: true, message: "Product Added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//list product
const listProducts = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Product Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
//function for single product info
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await productModel.findById(productId);
    res.json({ success: true, product });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// update product quantity
const updateProductQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    if (!productId || quantity === undefined) {
      return res.json({ success: false, message: "Product ID and quantity are required" });
    }

    const numQuantity = Number(quantity);
    if (numQuantity < 0) {
      return res.json({ success: false, message: "Quantity cannot be negative" });
    }

    const updatedProduct = await productModel.findByIdAndUpdate(
      productId,
      { 
        quantity: numQuantity,
        inStock: numQuantity > 0
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.json({ success: false, message: "Product not found" });
    }

    console.log(`📦 Updated ${updatedProduct.name} quantity to ${numQuantity}`);
    
    res.json({ 
      success: true, 
      message: "Product quantity updated successfully",
      product: updatedProduct
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export default { addProduct, listProducts, removeProduct, singleProduct, updateProductQuantity };
