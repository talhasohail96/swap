import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";

// add product to user cart
const addToCart = async (req, res) => {
  try {
    const { userId, itemId, size } = req.body;

    // Check product availability and stock
    const product = await productModel.findById(itemId);
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    if (!product.inStock || product.quantity <= 0) {
      return res.json({ success: false, message: "Product is out of stock" });
    }

    const userData = await userModel.findById(userId);
    let cartData = await userData.cartData || {};

    // Check current cart quantity for this item
    let currentCartQuantity = 0;
    if (cartData[itemId] && cartData[itemId][size]) {
      currentCartQuantity = cartData[itemId][size];
    }

    // Check if adding one more item would exceed available stock
    if (currentCartQuantity + 1 > product.quantity) {
      return res.json({ success: false, message: "Not enough stock available" });
    }

    // Add to cart
    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }

    // Update product quantity and stock status
    const newQuantity = product.quantity - 1;
    const updatedProduct = await productModel.findByIdAndUpdate(
      itemId, 
      { 
        quantity: newQuantity,
        inStock: newQuantity > 0
      },
      { new: true }
    );

    // Update user cart
    await userModel.findByIdAndUpdate(userId, { cartData });

    console.log(`📦 Product ${product.name} - Stock reduced from ${product.quantity} to ${newQuantity}`);

    res.json({ 
      success: true, 
      message: "Added To Cart",
      remainingStock: newQuantity
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// update  user cart
const updateCart = async (req, res) => {
  try {
    const { userId, itemId, size, quantity } = req.body;

    const userData = await userModel.findById(userId);
    let cartData = await userData.cartData || {};

    // Get current cart quantity for this item
    const currentCartQuantity = (cartData[itemId] && cartData[itemId][size]) ? cartData[itemId][size] : 0;
    
    // Get product info
    const product = await productModel.findById(itemId);
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    // Calculate the difference in quantity
    const quantityDifference = quantity - currentCartQuantity;

    if (quantityDifference > 0) {
      // User is increasing quantity - check if enough stock available
      const availableStock = product.quantity;
      if (quantityDifference > availableStock) {
        return res.json({ 
          success: false, 
          message: `Only ${availableStock} items available in stock` 
        });
      }

      // Reduce product stock
      const newProductQuantity = product.quantity - quantityDifference;
      await productModel.findByIdAndUpdate(itemId, { 
        quantity: newProductQuantity,
        inStock: newProductQuantity > 0
      });

      console.log(`📦 Product ${product.name} - Stock reduced by ${quantityDifference} to ${newProductQuantity}`);
    } else if (quantityDifference < 0) {
      // User is decreasing quantity - return stock to product
      const returnQuantity = Math.abs(quantityDifference);
      const newProductQuantity = product.quantity + returnQuantity;
      await productModel.findByIdAndUpdate(itemId, { 
        quantity: newProductQuantity,
        inStock: true // If we're returning stock, product is back in stock
      });

      console.log(`📦 Product ${product.name} - Stock increased by ${returnQuantity} to ${newProductQuantity}`);
    }

    // Check if itemId exists in cartData, if not create it
    if (!cartData[itemId]) {
      cartData[itemId] = {};
    }

    // Update the quantity
    cartData[itemId][size] = quantity;

    // Remove the item if quantity is 0 or less
    if (quantity <= 0) {
      delete cartData[itemId][size];
      // If no sizes left for this item, remove the entire item
      if (Object.keys(cartData[itemId]).length === 0) {
        delete cartData[itemId];
      }
    }

    await userModel.findByIdAndUpdate(userId, { cartData });
    res.json({ success: true, message: "Cart Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// get user cart data
const getUserCart = async (req, res) => {
  try {
    const { userId } = req.body;

    const userData = await userModel.findById(userId);
    let cartData = await userData.cartData || {};

    res.json({ success: true, cartData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// restore inventory from abandoned cart items (admin function)
const restoreAbandonedCartInventory = async (req, res) => {
  try {
    const users = await userModel.find({});
    let restoredItems = 0;
    
    for (const user of users) {
      if (user.cartData && Object.keys(user.cartData).length > 0) {
        for (const [itemId, sizes] of Object.entries(user.cartData)) {
          for (const [size, quantity] of Object.entries(sizes)) {
            if (quantity > 0) {
              // Restore inventory for this item
              const product = await productModel.findById(itemId);
              if (product) {
                const newQuantity = product.quantity + quantity;
                await productModel.findByIdAndUpdate(itemId, {
                  quantity: newQuantity,
                  inStock: true
                });
                restoredItems += quantity;
                console.log(`📦 Restored ${quantity} units of ${product.name} from abandoned cart`);
              }
            }
          }
        }
        
        // Clear the user's cart after restoring inventory
        await userModel.findByIdAndUpdate(user._id, { cartData: {} });
      }
    }
    
    res.json({ 
      success: true, 
      message: `Restored ${restoredItems} items from abandoned carts`,
      restoredItems 
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { addToCart, updateCart, getUserCart, restoreAbandonedCartInventory };
