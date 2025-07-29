import React from 'react'
import { Routes,Route } from 'react-router-dom'
import Collection from './pages/Collection'
import About from './pages/About'
import Contact from './pages/Contact'
import Home from './pages/Home'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Login from './pages/Login'
import PlaceOrder from './pages/PlaceOrder'
import Orders from './pages/Orders'
import Navbar from './Components/Navbar'
import Footer from './Components/Footer'
import SearchBar from './Components/SearchBar'
import ExchangeSystem from './pages/ExchangeSystem'
import ExchangeTracking from './pages/ExchangeTracking'
import Profile from './pages/Profile'

import { ToastContainer, toast } from 'react-toastify';
import Verify from './pages/Verify'
function App() {
  return (
    <div className='px-4 sm:px[5vw] md:px[7vw] lg:px-[9vw]'>
      <ToastContainer />
      <Navbar/>
      <SearchBar />
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/collection' element={<Collection/>}/>
        <Route path='/about' element={<About/>}/>
        <Route path='/contact' element={<Contact/>}/>
        <Route path='/profile' element={<Profile/>}/>
        <Route path='/products/:productId' element={<Product/>}/>
        <Route path='/cart' element={<Cart/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/place-order' element={<PlaceOrder/>}/>
        <Route path='/orders' element={<Orders/>}/>
        <Route path='/verify' element={<Verify/>}/>
        <Route path='/exchange' element={<ExchangeSystem/>}/>
        <Route path='/exchange-tracking' element={<ExchangeTracking/>}/>
      </Routes>
      <Footer/>
      
    </div>
 
  )
}

export default App


