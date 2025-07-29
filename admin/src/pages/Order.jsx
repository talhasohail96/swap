import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const Order = ({ token }) => {
  const [orders, setOrders] = useState([]);

  const fetchAllOrders = async () => {
    if (!token) return;
    try {
      const response = await axios.post(`${backendUrl}/api/order/list`, {}, {
        headers: { token },
      });
      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(`${backendUrl}/api/order/status`, {
        orderId,
        status: event.target.value,
      }, { headers: { token } });

      if (response.data.success) {
        await fetchAllOrders();
      }
    } catch (error) {
      toast.error("Failed to update order status.");
    }
  };

  const deleteOrderHandler = async (orderId, orderNumber) => {
    if (!window.confirm(`Are you sure you want to delete Order #${orderNumber}?\n\nThis action cannot be undone and will permanently remove:\n- Order details\n- Customer information\n- Payment records\n- All associated data`)) {
      return;
    }
    
    try {
      console.log(`🗑️ [ADMIN FRONTEND] Deleting order ${orderId}`);
      
      const response = await axios.post(`${backendUrl}/api/order/delete`, {
        orderId,
      }, { headers: { token } });

      if (response.data.success) {
        toast.success(`Order #${orderNumber} deleted successfully!`);
        await fetchAllOrders(); // Refresh the orders list
      } else {
        toast.error(response.data.message || "Failed to delete order");
      }
    } catch (error) {
      console.error(`❌ [ADMIN FRONTEND] Delete order error:`, error);
      if (error.response?.status === 404) {
        toast.error("Order not found. It may have been already deleted.");
      } else {
        toast.error("Failed to delete order: " + (error.response?.data?.message || error.message));
      }
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Orders Overview</h2>
      <p className="text-gray-600 mb-6">Total Orders: {orders.length} (Newest first)</p>

      {orders.length === 0 ? (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <p className="text-gray-500">No orders found</p>
        </div>
      ) : (
        orders.map((order, index) => (
        <div
          key={index}
          className="relative grid grid-cols-1 sm:grid-cols-[80px_3fr_1.5fr] lg:grid-cols-[80px_3fr_1.5fr_1fr_1fr] gap-4 border bg-white shadow-sm rounded-lg p-5 mb-6 text-sm text-gray-800"
        >
          {/* Delete Button */}
          <button
            onClick={() => deleteOrderHandler(order._id, order._id.slice(-6))}
            className="absolute bottom-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110 z-10"
            title="Delete this order"
          >
            ✕
          </button>

          {/* Main Product Image */}
          <div className="w-16 h-16 flex-shrink-0 relative">
            <img
              src={order.items && order.items.length > 0 && order.items[0].image && order.items[0].image.length > 0 
                ? order.items[0].image[0] 
                : assets.upload_area}
              alt={order.items && order.items.length > 0 ? order.items[0].name : "Order"}
              className="w-full h-full object-cover rounded-lg border-2 border-gray-200 shadow-sm"
              onError={(e) => {
                e.target.src = assets.upload_area;
              }}
            />
            {/* Item count badge */}
            {order.items && order.items.length > 1 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                +{order.items.length - 1}
              </div>
            )}
          </div>

          {/* Address & Items */}
          <div>
            <div className="mb-3">
              <h4 className="font-medium text-gray-800 mb-1">Order #{order._id.slice(-6)}</h4>
              <p className="text-xs text-gray-500 mb-2">Order Items:</p>
              {order.items.map((item, idx) => (
                <div key={idx} className="mb-1 p-2 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 font-medium text-sm">{item.name}</p>
                  <p className="text-gray-500 text-xs">
                    Qty: {item.quantity} • Size: {item.size}
                  </p>
                </div>
              ))}
            </div>
            <p className="font-medium">{order.address.firstname} {order.address.lastname}</p>
            <p className="text-gray-600">{order.address.street}, {order.address.city}</p>
            <p className="text-gray-600">{order.address.state}, {order.address.country}, {order.address.zipcode}</p>
            <p className="text-gray-600">📞 {order.address.phone}</p>
          </div>

          {/* Order Details */}
          <div>
            <p className="mb-1"><strong>Items:</strong> {order.items.length}</p>
            <p className="mb-1"><strong>Method:</strong> {order.paymentMethod}</p>
            <p className="mb-1">
              <strong>Payment:</strong>
              <span className={`ml-1 font-semibold ${order.payment ? 'text-green-600' : 'text-red-600'}`}>
                {order.payment ? 'Done' : 'Pending'}
              </span>
            </p>
            <p><strong>Date:</strong> {new Date(order.date).toLocaleDateString()}</p>
          </div>

          {/* Amount */}
          <div className="text-lg font-semibold text-blue-600">
            {currency.toUpperCase()} {order.amount}
          </div>

          {/* Status Select */}
          <div>
            <select
              value={order.status}
              onChange={(e) => statusHandler(e, order._id)}
              className="w-full px-3 py-2 border rounded-lg text-gray-700 font-medium bg-gray-100 hover:bg-white focus:outline-none"
            >
              <option value="Order Placed">Order Placed</option>
              <option value="Packing">Packing</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for delivery">Out for delivery</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        </div>
        ))
      )}
    </div>
  );
};

export default Order;
