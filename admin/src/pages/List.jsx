import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { currency, backendUrl } from '../App';

const List = () => {
  const [list, setList] = useState([]);
  const [editingQuantity, setEditingQuantity] = useState({});
  const token = localStorage.getItem('token');

  const fetchList = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to fetch product list');
    }
  };

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/product/remove`,
        { id },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to remove product');
    }
  };

  const updateProductQuantity = async (productId, newQuantity) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/product/update-quantity`,
        { productId, quantity: newQuantity },
        { headers: { token } }
      );
      
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList(); // Refresh the list to show updated quantities
        setEditingQuantity(prev => ({ ...prev, [productId]: false })); // Stop editing this item
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to update quantity');
    }
  };

  const handleQuantityEdit = (productId, isEditing) => {
    setEditingQuantity(prev => ({ ...prev, [productId]: isEditing }));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    // Update the local state to show immediate feedback
    setList(prevList => 
      prevList.map(item => 
        item._id === productId 
          ? { ...item, quantity: parseInt(newQuantity) || 0 }
          : item
      )
    );
  };

  useEffect(() => {
    fetchList();
  }, []);

  // Calculate inventory statistics
  const inventoryStats = {
    totalProducts: list.length,
    inStock: list.filter(item => item.inStock && (item.quantity || 0) > 0).length,
    outOfStock: list.filter(item => !item.inStock || (item.quantity || 0) === 0).length,
    lowStock: list.filter(item => item.inStock && (item.quantity || 0) > 0 && (item.quantity || 0) <= 5).length,
    totalInventory: list.reduce((sum, item) => sum + (item.quantity || 0), 0)
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Product Inventory Management</h2>
      
      {/* Inventory Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-blue-600 text-xs font-medium">Total Products</div>
          <div className="text-blue-800 text-lg font-bold">{inventoryStats.totalProducts}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-green-600 text-xs font-medium">In Stock</div>
          <div className="text-green-800 text-lg font-bold">{inventoryStats.inStock}</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="text-red-600 text-xs font-medium">Out of Stock</div>
          <div className="text-red-800 text-lg font-bold">{inventoryStats.outOfStock}</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="text-orange-600 text-xs font-medium">Low Stock (≤5)</div>
          <div className="text-orange-800 text-lg font-bold">{inventoryStats.lowStock}</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <div className="text-purple-600 text-xs font-medium">Total Units</div>
          <div className="text-purple-800 text-lg font-bold">{inventoryStats.totalInventory}</div>
        </div>
      </div>

      {/* Table Header */}
      <div className="hidden md:grid grid-cols-[60px_2fr_1fr_1fr_1fr_120px] bg-gray-100 text-gray-700 font-semibold px-4 py-2 rounded-t-md border">
        <span>Image</span>
        <span>Name</span>
        <span>Category</span>
        <span>Price</span>
        <span className="text-center">Stock</span>
        <span className="text-center">Actions</span>
      </div>

      {/* Product List */}
      {list.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-600 text-lg">No products found</p>
          <p className="text-gray-500 text-sm mt-2">Add your first product to get started with inventory management</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {list.map((item, index) => (
          <div
            key={item._id || index}
            className="grid grid-cols-[60px_2fr] md:grid-cols-[60px_2fr_1fr_1fr_1fr_120px] items-center gap-3 px-4 py-3 bg-white border rounded-md shadow-sm text-sm"
          >
            <img
              src={item.image?.[0] || '/default.png'}
              alt={item.name}
              className="w-12 h-12 object-cover rounded-md border"
            />
            <div>
              <p className="text-gray-800 font-medium">{item.name}</p>
              <div className="md:hidden mt-1 text-xs text-gray-500">
                <span className="mr-3">{item.category}</span>
                <span className="mr-3 font-medium text-green-700">{item.price} {currency.toUpperCase()}</span>
                <span className={`px-2 py-1 rounded text-xs ${item.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {item.quantity || 0} in stock
                </span>
              </div>
            </div>
            <p className="hidden md:block text-gray-600">{item.category}</p>
            <p className="hidden md:block font-medium text-green-700">
              {item.price} {currency.toUpperCase()}
            </p>
            
            {/* Stock Quantity Column */}
            <div className="hidden md:flex items-center justify-center">
              {editingQuantity[item._id] ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    value={item.quantity || 0}
                    onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => updateProductQuantity(item._id, item.quantity)}
                    className="text-green-600 hover:text-green-800 text-xs px-1"
                    title="Save"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => {
                      handleQuantityEdit(item._id, false);
                      fetchList(); // Reset to original value
                    }}
                    className="text-gray-600 hover:text-gray-800 text-xs px-1"
                    title="Cancel"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span 
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      item.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.quantity || 0}
                  </span>
                  <button
                    onClick={() => handleQuantityEdit(item._id, true)}
                    className="text-blue-600 hover:text-blue-800 text-xs"
                    title="Edit Quantity"
                  >
                    ✏️
                  </button>
                </div>
              )}
            </div>

            {/* Actions Column */}
            <div className="flex items-center justify-center gap-2">
              <div className="md:hidden">
                {editingQuantity[item._id] ? (
                  <div className="flex items-center gap-1 mb-2">
                    <input
                      type="number"
                      min="0"
                      value={item.quantity || 0}
                      onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                      className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                      placeholder="Stock"
                    />
                    <button
                      onClick={() => updateProductQuantity(item._id, item.quantity)}
                      className="text-green-600 hover:text-green-800 text-xs px-1"
                      title="Save"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => {
                        handleQuantityEdit(item._id, false);
                        fetchList();
                      }}
                      className="text-gray-600 hover:text-gray-800 text-xs px-1"
                      title="Cancel"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleQuantityEdit(item._id, true)}
                    className="text-blue-600 hover:text-blue-800 text-xs mb-2 px-2 py-1 border border-blue-300 rounded"
                    title="Edit Stock"
                  >
                    Edit Stock
                  </button>
                )}
              </div>
              <button
                onClick={() => removeProduct(item._id)}
                className="text-red-600 font-bold text-lg hover:scale-110 transition transform duration-150"
                title="Delete Product"
              >
                ✖
              </button>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
};

export default List;
