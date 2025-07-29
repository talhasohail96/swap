import React, { useContext, useEffect, useState } from 'react';
import Title from './Title';
import { ShopContext } from '../context/ShopContext';
import ProductItem from '../Components/ProductItem';

const BestSeller = () => {
  const { products } = useContext(ShopContext);
  const [bestSeller, setBestSeller] = useState([]);

  useEffect(() => {
    if (Array.isArray(products) && products.length > 0) {
      const bestProduct = products.filter((item) => item?.bestseller === true);
      setBestSeller(bestProduct.slice(0, 5));
    }
  }, [products]);

  return (
    <div className='my-10'>
      <div className='text-center text-3xl py-8'>
        <Title text1={'BEST'} text2={'SELLERS'} />
        <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
          Discover our best-selling styles without spending a dime!
        </p>
      </div>

      {bestSeller.length === 0 ? (
        <p className='text-center text-gray-500'>No best sellers found.</p>
      ) : (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6'>
          {bestSeller.map((item) => (
            <ProductItem
              key={item._id}
              id={item._id}
              name={item.name}
              image={item.image}
              price={item.price}
              quantity={item.quantity}
              inStock={item.inStock}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BestSeller;
