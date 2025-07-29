import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../Components/Title';

const CartTotal = ({ onCreditsChange }) => {
  const { currency, delivery_fee, getCartAmount, userProfile } = useContext(ShopContext);

  // Ensure all necessary values are available to avoid runtime errors
  const cartAmount = getCartAmount ? getCartAmount() : 0;
  const shippingFee = delivery_fee || 0;
  const totalAmount = cartAmount + shippingFee;
  
  const [creditsToUse, setCreditsToUse] = useState(0);
  const [showCreditInput, setShowCreditInput] = useState(false);

  const availableCredits = userProfile?.credit_points || 0;
  const maxCreditsToUse = Math.min(availableCredits, totalAmount);

  useEffect(() => {
    if (onCreditsChange) {
      onCreditsChange(creditsToUse);
    }
  }, [creditsToUse, onCreditsChange]);

  const handleCreditChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    const clampedValue = Math.min(value, maxCreditsToUse);
    setCreditsToUse(clampedValue);
  };

  const finalAmount = totalAmount - creditsToUse;

  return (
    <div className="w-full">
      {/* Title Section */}
      <div className="text-2xl">
        <Title text1="CART" text2="TOTALS" />
      </div>

      {/* Credit Points Section */}
      {availableCredits > 0 && (
        <div className="bg-green-50 p-4 rounded-lg mb-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-lg">💰</span>
              <span className="text-sm font-medium text-green-800">Available Credits</span>
            </div>
            <span className="text-lg font-bold text-green-700">{currency} {availableCredits}</span>
          </div>
          
          {!showCreditInput ? (
            <button
              onClick={() => setShowCreditInput(true)}
              className="w-full bg-green-600 text-white py-2 px-4 rounded text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Use Credits
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-green-800">Credits to use:</label>
                <input
                  type="number"
                  min="0"
                  max={maxCreditsToUse}
                  value={creditsToUse}
                  onChange={handleCreditChange}
                  className="flex-1 px-3 py-1 border border-green-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0"
                />
                <button
                  onClick={() => {
                    setCreditsToUse(0);
                    setShowCreditInput(false);
                  }}
                  className="text-green-600 hover:text-green-800 text-sm"
                >
                  Cancel
                </button>
              </div>
              <div className="text-xs text-green-600">
                Max: {currency} {maxCreditsToUse}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cart Totals Section */}
      <div className="flex flex-col gap-2 mt-2 text-sm">
        {/* Subtotal */}
        <div className="flex justify-between">
          <p>Subtotal</p>
          <p>
            {currency}
            {cartAmount}.00
          </p>
        </div>
        <hr />

        {/* Shipping Fee */}
        <div className="flex justify-between">
          <p>Shipping fee</p>
          <p>
            {currency}
            {shippingFee}.00
          </p>
        </div>
        <hr />

        {/* Credits Applied */}
        {creditsToUse > 0 && (
          <>
            <div className="flex justify-between text-green-600">
              <p>Credits applied</p>
              <p>-{currency} {creditsToUse}.00</p>
            </div>
            <hr />
          </>
        )}

        {/* Total */}
        <div className="flex justify-between">
          <b>Total</b>
          <b className={creditsToUse > 0 ? "text-green-600" : ""}>
            {currency}{' '}
            {finalAmount}.00
          </b>
        </div>
      </div>
    </div>
  );
};

export default CartTotal;
