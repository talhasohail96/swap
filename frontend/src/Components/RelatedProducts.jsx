import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import ProductItem from './ProductItem';

const RelatedProducts = ({category,subcategory}) => {
    const {products}=useContext(ShopContext)
    const[related,setrelated]=useState([]);
    useEffect(()=>{
        if(products.length>0){
            let productsCopy=products.slice();
            productsCopy=productsCopy.filter((item)=>category===item.category)
            productsCopy=productsCopy.filter((item)=>subcategory===item.subcategory)
            setrelated(productsCopy.slice(0,5))
        }
    },[])

  return (
    <div className='my-24'>
        <div className='text-center text-3xl py-2'>
            <h2>Related Products</h2>
        </div>
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
            {related.map((item,index)=>(
                <ProductItem key={index} id={item._id}  name={item.name} price={item.price} image={item.image} quantity={item.quantity} inStock={item.inStock}/>
            ))}
        </div>
      
    </div>
  )
}

export default RelatedProducts
