import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../Components/Title';

const CartTotalSimple = () => {
  const { currency, delivery_fee, getCartAmount } = useContext(ShopContext);

  // Ensure all necessary values are available to avoid runtime errors
  const cartAmount = getCartAmount ? getCartAmount() : 0;
  const shippingFee = delivery_fee || 0;
  const totalAmount = cartAmount + shippingFee;

  return (
    <div className="w-full">
      {/* Title Section */}
      <div className="text-2xl">
        <Title text1="CART" text2="TOTALS" />
      </div>

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

        {/* Total */}
        <div className="flex justify-between">
          <b>Total</b>
          <b>
            {currency}{' '}
            {totalAmount}.00
          </b>
        </div>
      </div>
    </div>
  );
};

export default CartTotalSimple; 