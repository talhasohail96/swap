import React from 'react';
import { assets } from '../assets/assets.js';
import { Link } from "react-router-dom";



const Footer = () => {
  return (
    <div>
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr] gap-14 my-10 mt-40 text-sm">
        {/* Logo and Description */}
        <div>
          <img src={assets.logo} className="mb-5 w-32" alt="Logo" />
          <p className="w-full md:w-2/3 text-gray-600">
         Join us today for free!
          </p>
        </div>

        {/* Company Section */}
        <div>
          <p className="text-xl font-medium mb-5">COMPANY</p>
          <ul className="flex flex-col gap-1 text-gray-600">
  <li><Link to="/" className="hover:text-black transition">Home</Link></li>
  <li><Link to="/about" className="hover:text-black transition">About Us</Link></li>
  <li><Link to="/orders" className="hover:text-black transition">Delivery</Link></li>
  <li><Link to="/exchange" className="hover:text-black transition">Exchange</Link></li>
</ul>

        </div>

        {/* Get in Touch Section */}
        <div>
          <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
       <ul className="flex flex-col gap-1 text-gray-600">
  <li><a href="tel:+12224569078" className="hover:text-black transition">+1-222-456-9078</a></li>
  <li><a href="mailto:contact@swap.com" className="hover:text-black transition">contact@swap.com</a></li>
</ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div>
        <hr />
        <p className="py-5 text-center">
          &copy; 2025 Swap.com - All Rights Reserved
        </p>
      </div>
    </div>
  );
};

export default Footer;
