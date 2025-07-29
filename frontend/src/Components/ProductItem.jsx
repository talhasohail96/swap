import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';

const ProductItem = ({ id, image, name, price, quantity, inStock }) => {
  const { currency } = useContext(ShopContext);

  return (
    <Link className="text-gray-700 cursor-pointer" to={`/products/${id}`}>
      <div className="overflow-hidden rounded-md relative">
        <img
          className={`w-full h-64 object-cover hover:scale-110 transition-transform duration-300 ease-in-out ${!inStock ? 'opacity-50' : ''}`}
          src={image[0]} 
          alt={name} 
        />
        {!inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <span className="text-white font-bold text-lg">OUT OF STOCK</span>
          </div>
        )}
        {inStock && quantity <= 5 && quantity > 0 && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
            Only {quantity} left
          </div>
        )}
      </div>
      <p className="pt-3 pb-1 text-sm">{name}</p>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          {currency}
          {price}
        </p>
        <p className={`text-xs ${inStock ? 'text-green-600' : 'text-red-600'}`}>
          {inStock ? `${quantity} in stock` : 'Out of stock'}
        </p>
      </div>
    </Link>
  );
};

export default ProductItem;
