import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Sentiment from "sentiment";

const sentimentAnalyzer = new Sentiment();

const Exchange = () => {
  const [totalOrders, setTotalOrders] = useState(0);
  const [exchangeRequests, setExchangeRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [replacementProducts, setReplacementProducts] = useState({}); // Store replacement product details
  const [sortBySentiment, setSortBySentiment] = useState(true); // Sort by sentiment priority
  const pageSize = 1;

  // Analyze sentiment of exchange reason
  const analyzeSentiment = (reason) => {
    if (!reason || reason.trim().length < 3) {
      return { sentiment: null, loading: false };
    }

    try {
      const { score } = sentimentAnalyzer.analyze(reason);
      
      if (score > 1) {
        return { sentiment: "positive", loading: false };
      } else if (score < -1) {
        return { sentiment: "negative", loading: false };
      } else {
        return { sentiment: "neutral", loading: false };
      }
    } catch (error) {
      console.error("Sentiment analysis error:", error);
      return { sentiment: "neutral", loading: false };
    }
  };

  // Sort exchange requests by sentiment priority (negative first, then neutral, then positive, rejected last)
  const sortedExchangeRequests = [...exchangeRequests].sort((a, b) => {
    if (!sortBySentiment) return 0;
    
    // Put rejected requests at the bottom
    if (a.exchangeRequest?.exchangeStatus === "Rejected" && b.exchangeRequest?.exchangeStatus !== "Rejected") {
      return 1;
    }
    if (a.exchangeRequest?.exchangeStatus !== "Rejected" && b.exchangeRequest?.exchangeStatus === "Rejected") {
      return -1;
    }
    if (a.exchangeRequest?.exchangeStatus === "Rejected" && b.exchangeRequest?.exchangeStatus === "Rejected") {
      return 0;
    }
    
    const sentimentA = analyzeSentiment(a.exchangeRequest?.reason).sentiment;
    const sentimentB = analyzeSentiment(b.exchangeRequest?.reason).sentiment;
    
    const priorityOrder = { negative: 3, neutral: 2, positive: 1, null: 0 };
    return priorityOrder[sentimentB] - priorityOrder[sentimentA];
  });

  const totalPages = Math.ceil(sortedExchangeRequests.length / pageSize);
  const paginatedExchangeRequests = sortedExchangeRequests.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const backendUrl = "http://localhost:5000";
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchExchangeRequests();
  }, []);

  // Fetch replacement product details
  const fetchReplacementProduct = async (productId) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/product/single",
        { productId },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        return response.data.product;
      }
    } catch (error) {
      console.error("Error fetching replacement product:", error);
    }
    return null;
  };

  // Fetch all replacement products for the exchange requests
  const fetchReplacementProducts = async (requests) => {
    const products = {};
    for (const request of requests) {
      if (request.exchangeRequest?.replacementProduct) {
        const product = await fetchReplacementProduct(request.exchangeRequest.replacementProduct);
        if (product) {
          products[request.exchangeRequest.replacementProduct] = product;
        }
      }
    }
    setReplacementProducts(products);
  };

  const fetchExchangeRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        backendUrl + "/api/order/list",
        {},
        {
          headers: {
            token: token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setTotalOrders(response.data.orders.length);
        const ordersWithExchanges = response.data.orders.filter((order) => order.exchangeRequest && order.exchangeRequest.reason);
        setExchangeRequests(ordersWithExchanges);
        setCurrentPage(1); // Reset to first page
        
        // Fetch replacement product details
        await fetchReplacementProducts(ordersWithExchanges);
      } else {
        setError(response.data.message || "Failed to fetch data");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setError("Authentication failed. Please login again.");
      } else {
        setError("Failed to load exchange requests: " + (error.message || "Unknown error"));
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle exchange status update
  const exchangeStatusHandler = async (event, orderId) => {
    try {
      const newStatus = event.target.value;
      console.log(`🔄 [ADMIN FRONTEND] Updating exchange status for order ${orderId} to ${newStatus}`);
      
      const requestData = {
        orderId,
        exchangeStatus: newStatus,
      };
      
      console.log(`📤 [ADMIN FRONTEND] Sending request:`, requestData);
      
      const response = await axios.post(
        backendUrl + "/api/order/exchange-status",
        requestData,
        {
          headers: {
            token: token,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`📥 [ADMIN FRONTEND] Response:`, response.data);

      if (response.data.success) {
        toast.success("Exchange status updated successfully!");
        await fetchExchangeRequests(); // Refresh the data
      } else {
        toast.error(response.data.message || "Failed to update exchange status");
      }
    } catch (error) {
      console.error(`❌ [ADMIN FRONTEND] Error:`, error);
      toast.error("Failed to update exchange status: " + (error.message || "Unknown error"));
    }
  };

  // Handle exchange rejection
  const rejectExchangeHandler = async (orderId) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/order/exchange-status",
        {
          orderId,
          exchangeStatus: "Rejected",
        },
        {
          headers: {
            token: token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Exchange request rejected successfully!");
        await fetchExchangeRequests(); // Refresh the data
      } else {
        toast.error(response.data.message || "Failed to reject exchange request");
      }
    } catch (error) {
      toast.error("Failed to reject exchange request: " + (error.message || "Unknown error"));
    }
  };

  // Handle exchange deletion
  const deleteExchangeHandler = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this exchange request? This action cannot be undone.")) {
      return;
    }

    try {
      console.log(`🗑️ [ADMIN FRONTEND] Deleting exchange request for order ${orderId}`);
      console.log(`🔑 [ADMIN FRONTEND] Token available:`, !!token);
      console.log(`🔑 [ADMIN FRONTEND] Token value:`, token ? token.substring(0, 20) + "..." : "null");
      
      if (!token) {
        toast.error("Authentication token not found. Please login again.");
        return;
      }

      const response = await axios.post(
        backendUrl + "/api/order/delete-exchange",
        {
          orderId,
        },
        {
          headers: {
            token: token,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`📥 [ADMIN FRONTEND] Delete response:`, response.data);

      if (response.data.success) {
        toast.success("Exchange request deleted successfully!");
        await fetchExchangeRequests(); // Refresh the data
      } else {
        toast.error(response.data.message || "Failed to delete exchange request");
      }
    } catch (error) {
      console.error(`❌ [ADMIN FRONTEND] Delete error:`, error);
      if (error.response?.status === 404) {
        toast.error("Delete endpoint not found. Please ensure the backend is running with the latest code.");
      } else if (error.response?.status === 401 || error.response?.data?.message?.includes("Not Authorized")) {
        toast.error("Authentication failed. Please login again.");
      } else {
        toast.error("Failed to delete exchange request: " + (error.message || "Unknown error"));
      }
    }
  };

  // Get status color based on exchange status
  const getStatusColor = (status) => {
    switch (status) {
      case "Exchange Requested":
        return "bg-blue-100 text-blue-800";
      case "Processing":
        return "bg-yellow-100 text-yellow-800";
      case "Packing":
        return "bg-orange-100 text-orange-800";
      case "Shipped":
        return "bg-purple-100 text-purple-800";
      case "Out for delivery":
        return "bg-indigo-100 text-indigo-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get progress percentage based on status
  const getProgressPercentage = (status) => {
    switch (status) {
      case "Exchange Requested":
        return 14;
      case "Processing":
        return 28;
      case "Packing":
        return 42;
      case "Shipped":
        return 57;
      case "Out for delivery":
        return 71;
      case "Delivered":
        return 85;
      case "Completed":
        return 100;
      case "Rejected":
        return 0; // Rejected requests show 0% progress
      default:
        return 0;
    }
  };

  // Get status timeline
  const getStatusTimeline = (currentStatus) => {
    const statuses = [
      "Exchange Requested",
      "Processing", 
      "Packing",
      "Shipped",
      "Out for delivery",
      "Delivered",
      "Completed"
    ];
    
    const currentIndex = statuses.indexOf(currentStatus);
    
    // If status is rejected, show special timeline
    if (currentStatus === "Rejected") {
      return [
        { label: "Exchange Requested", completed: true },
        { label: "Rejected", completed: true, isRejected: true }
      ];
    }
    
    return statuses.map((status, index) => ({
      label: status,
      completed: index <= currentIndex
    }));
  };

  // Format payment method for display
  const formatPaymentMethod = (paymentMethod) => {
    if (!paymentMethod) return "Not specified";
    
    switch (paymentMethod.toLowerCase()) {
      case "cod":
        return "Cash on Delivery";
      case "stripe":
        return "Credit/Debit Card (Stripe)";
      case "razorpay":
        return "Online Payment (Razorpay)";
      default:
        return paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Exchange Center</h1>
        <div className="text-center py-8">Loading exchange requests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Exchange Center</h1>
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <button onClick={fetchExchangeRequests} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Exchange Center</h1>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setSortBySentiment(!sortBySentiment)} 
            className={`px-3 py-2 rounded text-xs sm:text-sm font-medium ${
              sortBySentiment 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            {sortBySentiment ? '🔥 Priority Sort ON' : '📋 Default Sort'}
          </button>
          <button onClick={fetchExchangeRequests} className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs sm:text-sm">
            Refresh
          </button>
          {token && <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Authenticated ✓</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 w-full">
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow border">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500">Total Exchange Requests</h3>
          <p className="text-xl sm:text-2xl font-bold">{exchangeRequests.length}</p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow border">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500">This Month</h3>
          <p className="text-xl sm:text-2xl font-bold">
            {
              exchangeRequests.filter((order) => {
                const requestDate = new Date(order.exchangeRequest?.requestedAt || order.date);
                const currentMonth = new Date().getMonth();
                return requestDate.getMonth() === currentMonth;
              }).length
            }
          </p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow border">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500">Total Orders</h3>
          <p className="text-xl sm:text-2xl font-bold">{totalOrders}</p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow border">
          <h3 className="text-xs sm:text-sm font-medium text-gray-500">Sentiment Overview</h3>
          <div className="space-y-1 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-red-600">😠 Negative:</span>
              <span className="text-xs sm:text-sm font-medium">
                {sortedExchangeRequests.filter(order => {
                  const { sentiment } = analyzeSentiment(order.exchangeRequest?.reason);
                  return sentiment === "negative" && order.exchangeRequest?.exchangeStatus !== "Rejected";
                }).length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-green-600">😊 Positive:</span>
              <span className="text-xs sm:text-sm font-medium">
                {sortedExchangeRequests.filter(order => {
                  const { sentiment } = analyzeSentiment(order.exchangeRequest?.reason);
                  return sentiment === "positive" && order.exchangeRequest?.exchangeStatus !== "Rejected";
                }).length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">😐 Neutral:</span>
              <span className="text-xs sm:text-sm font-medium">
                {sortedExchangeRequests.filter(order => {
                  const { sentiment } = analyzeSentiment(order.exchangeRequest?.reason);
                  return sentiment === "neutral" && order.exchangeRequest?.exchangeStatus !== "Rejected";
                }).length}
              </span>
            </div>
            <div className="flex items-center justify-between border-t pt-1 mt-1">
              <span className="text-xs text-red-600">🚫 Rejected:</span>
              <span className="text-xs sm:text-sm font-medium">
                {sortedExchangeRequests.filter(order => 
                  order.exchangeRequest?.exchangeStatus === "Rejected"
                ).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {exchangeRequests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-600 text-lg">No exchange requests found</p>
          <p className="text-gray-500 text-sm mt-2">Exchange requests will appear here when customers submit them</p>
        </div>
      ) : (
        <>
          <div className="space-y-4 w-full">
            {paginatedExchangeRequests.map((order, index) => (
              <div key={order._id} className="bg-white border rounded-lg p-4 sm:p-6 shadow-sm w-full overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold break-words">Exchange Request #{(currentPage - 1) * pageSize + index + 1}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 break-all">Order: {order._id}</p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Date:{" "}
                      {order.exchangeRequest?.requestedAt
                        ? new Date(order.exchangeRequest.requestedAt).toLocaleDateString()
                        : new Date(order.date).toLocaleDateString()}
                    </p>
                    {/* Priority indicator based on sentiment */}
                    {(() => {
                      const { sentiment } = analyzeSentiment(order.exchangeRequest?.reason);
                      if (sentiment === "negative") {
                        return (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-red-600 text-xs">🔥</span>
                            <span className="text-xs text-red-700 font-medium">High Priority - Negative Sentiment</span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    
                    {/* Rejected status indicator */}
                    {order.exchangeRequest?.exchangeStatus === "Rejected" && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-red-600 text-xs">🚫</span>
                        <span className="text-xs text-red-700 font-medium">Exchange Request Rejected</span>
                      </div>
                    )}
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0">
                    <p className="text-base sm:text-lg font-bold">PKR {order.amount}</p>
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded mt-1">{order.status}</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4 w-full overflow-hidden">
                  <h4 className="font-medium mb-2 text-sm sm:text-base">Customer Details</h4>
                  <p className="text-xs sm:text-sm break-words">
                    <strong>Name:</strong> {order.address?.firstName} {order.address?.lastName}
                  </p>
                  <p className="text-xs sm:text-sm break-words">
                    <strong>Phone:</strong> {order.address?.phone}
                  </p>
                  <p className="text-xs sm:text-sm break-words">
                    <strong>City:</strong> {order.address?.city}
                  </p>
                </div>

                <div className="mb-4 w-full overflow-hidden">
                  <h4 className="font-medium mb-2 text-sm sm:text-base">Product Exchange Comparison</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                    {/* Original Product */}
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <h5 className="font-medium text-gray-700 mb-2 sm:mb-3 text-xs sm:text-sm">Original Product</h5>
                      <div className="space-y-2">
                        {order.items?.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center gap-2 sm:gap-3 p-2 bg-white rounded overflow-hidden">
                            <img
                              src={item.image?.[0] || "/placeholder.svg?height=40&width=40"}
                              alt={item.name}
                              className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-xs sm:text-sm truncate">{item.name}</p>
                              <p className="text-xs text-gray-600">
                                Size: {item.size} • Qty: {item.quantity}
                              </p>
                              <p className="text-xs font-medium text-gray-800">
                                PKR {item.price}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Replacement Product */}
                    <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                      <h5 className="font-medium text-blue-700 mb-2 sm:mb-3 text-xs sm:text-sm">Replacement Product</h5>
                      {order.exchangeRequest?.replacementProduct && replacementProducts[order.exchangeRequest.replacementProduct] ? (
                        <div className="flex items-center gap-2 sm:gap-3 p-2 bg-white rounded overflow-hidden">
                          <img
                            src={replacementProducts[order.exchangeRequest.replacementProduct].image?.[0] || "/placeholder.svg?height=40&width=40"}
                            alt={replacementProducts[order.exchangeRequest.replacementProduct].name}
                            className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-xs sm:text-sm truncate">{replacementProducts[order.exchangeRequest.replacementProduct].name}</p>
                            <p className="text-xs text-gray-600">
                              Size: {order.exchangeRequest?.size || "Not specified"}
                            </p>
                            <p className="text-xs font-medium text-gray-800">
                              PKR {replacementProducts[order.exchangeRequest.replacementProduct].price}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 sm:gap-3 p-2 bg-white rounded">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded animate-pulse flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-20 sm:w-24 mb-1"></div>
                            <div className="h-2 sm:h-3 bg-gray-200 rounded animate-pulse w-12 sm:w-16"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg mb-4 w-full overflow-hidden">
                  <h4 className="font-medium text-blue-800 mb-2 text-sm sm:text-base">Exchange Request Details</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div className="space-y-2">
                      <p className="break-words">
                        <strong>New Size:</strong> {order.exchangeRequest?.size || "Not specified"}
                      </p>
                      <p className="break-words">
                        <strong>Payment Method:</strong> {formatPaymentMethod(order.exchangeRequest?.paymentMethod)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="break-all text-xs">
                        <strong>Replacement Product ID:</strong> {order.exchangeRequest?.replacementProduct || "Not specified"}
                      </p>

                      {typeof order.exchangeRequest?.priceDifference === "number" && (
                        <div className="mt-2 space-y-1">
                          {order.exchangeRequest.priceDifference > 0 && (
                            <p className="text-green-700 font-medium text-xs sm:text-sm">PKR {order.exchangeRequest.priceDifference} additional payment required.</p>
                          )}

                          {order.exchangeRequest.priceDifference < 0 && (
                            <div className="space-y-1">
                              <p className="text-blue-700 font-medium text-xs sm:text-sm">
                                Customer will get PKR {Math.abs(order.exchangeRequest.priceDifference)} as credit points when marked as "Completed".
                              </p>
                              {order.exchangeRequest?.creditGiven && (
                                <p className="text-green-600 text-xs mt-1">
                                  ✅ Credits already given to customer
                                </p>
                              )}
                            </div>
                          )}

                          {order.exchangeRequest.priceDifference === 0 && (
                            <p className="text-gray-500 font-medium text-xs sm:text-sm">No price difference in exchange.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg mb-4 w-full overflow-hidden">
                  <h4 className="font-medium text-yellow-800 mb-2 text-sm sm:text-base">Customer's Reason</h4>
                  <p className="text-xs sm:text-sm text-gray-700 mb-3 break-words">{order.exchangeRequest?.reason}</p>
                  
                  {/* Sentiment Analysis */}
                  {(() => {
                    const { sentiment } = analyzeSentiment(order.exchangeRequest?.reason);
                    return (
                      <div className="mt-3 p-2 sm:p-3 bg-white rounded-lg border">
                        <h5 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">🧠 Sentiment Analysis</h5>
                        {sentiment === "negative" && (
                          <div className="flex items-center gap-1 sm:gap-2">
                            <span className="text-red-600 text-sm sm:text-lg">😠</span>
                            <span className="text-xs sm:text-sm text-red-700 font-medium">Negative sentiment — prioritize this request</span>
                          </div>
                        )}
                        {sentiment === "positive" && (
                          <div className="flex items-center gap-1 sm:gap-2">
                            <span className="text-green-600 text-sm sm:text-lg">😊</span>
                            <span className="text-xs sm:text-sm text-green-700 font-medium">Positive sentiment — customer seems satisfied</span>
                          </div>
                        )}
                        {sentiment === "neutral" && (
                          <div className="flex items-center gap-1 sm:gap-2">
                            <span className="text-gray-600 text-sm sm:text-lg">😐</span>
                            <span className="text-xs sm:text-sm text-gray-700 font-medium">Neutral sentiment detected</span>
                          </div>
                        )}
                        {!sentiment && (
                          <div className="flex items-center gap-1 sm:gap-2">
                            <span className="text-gray-500 text-sm sm:text-lg">🤔</span>
                            <span className="text-xs sm:text-sm text-gray-500 font-medium">Insufficient text for sentiment analysis</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Exchange Status Tracking */}
                <div className="bg-green-50 p-3 sm:p-4 rounded-lg w-full overflow-hidden">
                  <h4 className="font-medium text-green-800 mb-3 text-sm sm:text-base">Exchange Status Tracking</h4>
                  
                  {/* Current Status Display */}
                  <div className="mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                      <span className="text-xs sm:text-sm font-medium text-gray-700">Current Status:</span>
                      <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.exchangeRequest?.exchangeStatus || "Exchange Requested")}`}>
                        {order.exchangeRequest?.exchangeStatus || "Exchange Requested"}
                      </span>
                    </div>
                  </div>

                  {/* Status Update Dropdown */}
                  <div className="mb-4">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Update Exchange Status:</label>
                    <select
                      value={order.exchangeRequest?.exchangeStatus || "Exchange Requested"}
                      onChange={(e) => exchangeStatusHandler(e, order._id)}
                      className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-700 font-medium bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="Exchange Requested">Exchange Requested</option>
                      <option value="Processing">Processing</option>
                      <option value="Packing">Packing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Out for delivery">Out for delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Completed">Completed</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                    {order.exchangeRequest?.priceDifference < 0 && !order.exchangeRequest?.creditGiven && (
                      <p className="text-xs text-blue-600 mt-1 break-words">
                        💡 Note: When marked as "Completed", {Math.abs(order.exchangeRequest.priceDifference)} credits will be automatically added to customer's account.
                      </p>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="mb-4 space-y-2">
                    <button
                      onClick={() => rejectExchangeHandler(order._id)}
                      className="w-full px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium transition-colors text-xs sm:text-sm"
                    >
                      🚫 Reject Exchange Request
                    </button>
                    <button
                      onClick={() => deleteExchangeHandler(order._id)}
                      className="w-full px-3 sm:px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium transition-colors text-xs sm:text-sm"
                    >
                      🗑️ Delete Exchange Request
                    </button>
                  </div>

                  {/* Status Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{getProgressPercentage(order.exchangeRequest?.exchangeStatus || "Exchange Requested")}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          order.exchangeRequest?.exchangeStatus === "Rejected" ? "bg-red-500" : "bg-green-500"
                        }`}
                        style={{ width: `${getProgressPercentage(order.exchangeRequest?.exchangeStatus || "Exchange Requested")}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="space-y-2">
                    {getStatusTimeline(order.exchangeRequest?.exchangeStatus || "Exchange Requested").map((status, idx) => (
                      <div key={idx} className="flex items-center gap-2 sm:gap-3">
                        <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${
                          status.isRejected ? 'bg-red-500' : 
                          status.completed ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                        <span className={`text-xs break-words ${
                          status.isRejected ? 'text-red-700 font-medium' : 
                          status.completed ? 'text-green-700 font-medium' : 'text-gray-500'
                        }`}>
                          {status.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap justify-center mt-6 gap-1 sm:gap-2 w-full">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-2 sm:px-4 py-1 sm:py-2 bg-gray-200 rounded disabled:opacity-50 text-xs sm:text-sm"
            >
              Previous
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-2 sm:px-4 py-1 sm:py-2 rounded text-xs sm:text-sm ${currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-100"}`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-2 sm:px-4 py-1 sm:py-2 bg-gray-200 rounded disabled:opacity-50 text-xs sm:text-sm"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Exchange;
