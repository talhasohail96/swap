import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";


const Navbar = () => {
  const [visible, setVisible] = useState(false);
const location = useLocation();

  const { setShowSearch, getCartCount, navigate, token, setToken, setCartItems } = useContext(ShopContext);
  const logout = () => {
    navigate("/login");
    localStorage.removeItem("token");
    setToken("");
    setCartItems({});
  };

  return (
    <div className="flex item-center justify-between py-5 font-medium">
      <Link to="/">
        <img src={assets.logo} className="w-36" alt="" />
      </Link>
      <ul className="hidden sm:flex gap-5 text-sm text-gray-700">
        <NavLink to="/" className="flex flex-col items-center gap-1">
          <p>HOME</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden"></hr>
        </NavLink>
        <NavLink to="/collection" className="flex flex-col items-center gap-1">
          <p>COLLECTION</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden"></hr>
        </NavLink>

        <NavLink to="/about" className="flex flex-col items-center gap-1">
          <p>ABOUT</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden"></hr>
        </NavLink>

        <NavLink to="/contact" className="flex flex-col items-center gap-1">
          <p>CONTACT</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden"></hr>
        </NavLink>
        <NavLink to="/exchange" className="flex flex-col items-center gap-1">
          <p className={location.pathname === "/exchange" ? "text-gray-900 font-bold" : "text-gray-700"}>EXCHANGE</p>
          <hr className={`w-2/4 border-none h-[1.5px] bg-gray-700 ${location.pathname === "/exchange" ? "block" : "hidden"}`} />
        </NavLink>
      </ul>
      {/* after and before login search icon and profile icon */}
      <div className="flex item-center justify-center gap-6">
       {location.pathname === "/collection" && (
  <img onClick={() => setShowSearch(true)} className="w-5 h-5 cursor-pointer" src={assets.search_icon} alt="" />
)}

        <div className="group relative">
          <img
            onClick={() => (token ? null : navigate("/login"))}
            className={`${token ? "h-7" : "h-5"} cursor-pointer`}
            src={token ? assets.user_profile : assets.profile_icon}
            alt="profile"
          />
          {/* dropdown menu */}
          {token && (
            <div className="group-hover:block hidden absolute dropdown-menu right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <ul className="w-36 flex flex-col text-sm text-gray-600">
                <li onClick={() => navigate("/profile")} className="px-4 py-2 hover:bg-gray-100 hover:text-black cursor-pointer rounded-t-lg">
                  My Profile
                </li>
                <li onClick={() => navigate("/orders")} className="px-4 py-2 hover:bg-gray-100 hover:text-black cursor-pointer">
                  Orders
                </li>
                <li onClick={() => navigate("/exchange-tracking")} className="px-4 py-2 hover:bg-gray-100 hover:text-black cursor-pointer">
                  Exchange Tracking
                </li>
                <li onClick={logout} className="px-4 py-2 hover:bg-gray-100 text-red-500 hover:text-red-700 cursor-pointer rounded-b-lg">
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>

        <Link to="/Cart" className="relative inline-block">
          <img src={assets.cart_icon} className="w-5 h-5" alt="" />

          <p className="absolute bottom-2 right-0 w-5 h-5 text-center leading-5 bg-black text-white rounded-full text-xs transform translate-x-1/4 -translate-y-1/4 hidden sm:block">
            {getCartCount()}
          </p>
        </Link>
        <img onClick={() => setVisible(true)} src={assets.menu_icon} className="w-5 cursor-pointer sm:hidden" alt="" />
      </div>
      {/* sidebar menu for smaller screen */}
      <div className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${visible ? "w-full" : "w-0"}`}>
        <div className="flex flex-col text-gray-600">
          <div onClick={() => setVisible(false)} className="flex items-center gap-4 p-3 cursor-pointer">
            <img className="h-4 rotate-180" src={assets.dropdown_icon} alt="" />
            <p>Back</p>
          </div>
          <NavLink onClick={() => setVisible(false)} className="py-2 pl-6 border" to="/">
            HOME
          </NavLink>
          <NavLink onClick={() => setVisible(false)} className="py-2 pl-6 border" to="/collection">
            COLLECTION
          </NavLink>
          <NavLink onClick={() => setVisible(false)} className="py-2 pl-6 border" to="/about">
            ABOUT
          </NavLink>
          <NavLink onClick={() => setVisible(false)} className="py-2 pl-6 border" to="/contact">
            CONTACT
          </NavLink>
          <NavLink onClick={() => setVisible(false)} className="py-2 pl-6 border" to="/exchange">
            EXCHANGE
          </NavLink>
          {token && (
            <NavLink onClick={() => setVisible(false)} className="py-2 pl-6 border" to="/exchange-tracking">
              EXCHANGE TRACKING
            </NavLink>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
