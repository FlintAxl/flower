import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


import Header from './Components/Layout/Header';
import Footer from './Components/Layout/Footer';

import Home from './Components/Home';
import ProductDetails from './Components/Product/ProductDetails';
import Login from './Components/User/Login';
import Register from './Components/User/Register';
import { ToastContainer, } from 'react-toastify';
import ForgotPassword from './Components/User/ForgotPassword';
import NewPassword from './Components/User/NewPassword';
import Profile from './Components/User/Profile';
import UpdateProfile from './Components/User/UpdateProfile';
import UpdatePassword from './Components/User/UpdatePassword';
import ConfirmOrder from './Components/Cart/ConfirmOrder';
import axios from 'axios';
import ProtectedRoute from './Components/Route/ProtectedRoute';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cart from './Components/Cart/Cart';
import Shipping from './Components/Cart/Shipping';
import Payment from './Components/Cart/Payment';
import OrderSuccess from './Components/Cart/OrderSuccess';
import ListOrders from './Components/Order/ListOrders';
import OrderDetails from './Components/Order/OrderDetails';



//admin
import Dashboard from './Components/Admin/Dashboard';
import ProductsList from './Components/Admin/ProductsList';
import NewProduct from './Components/Admin/NewProduct';
import UpdateProduct from './Components/Admin/UpdateProduct';
import UsersList from './Components/Admin/UsersList';
import NewUser from './Components/Admin/NewUser';
import UpdateUser from './Components/Admin/UpdateUser';
import OrdersList from './Components/Admin/OrdersList';
import ProcessOrder from './Components/Admin/ProcessOrder';
import ProductReviews from './Components/Admin/ProductReviews';
function App() {

  const [state, setState] = useState({
    cartItems: localStorage.getItem('cartItems')
      ? JSON.parse(localStorage.getItem('cartItems'))
      : [],

    shippingInfo: localStorage.getItem('shippingInfo')
      ? JSON.parse(localStorage.getItem('shippingInfo'))
      : {},
  })

  // Global theme management
  useEffect(() => {
    const applyTheme = () => {
      const stored = localStorage.getItem('theme');
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const enabled = stored ? stored === 'dark' : prefersDark;
      
      if (enabled) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    };

    // Apply theme immediately
    applyTheme();

    // Listen for storage changes (cross-tab) and custom theme changes (same-tab)
    window.addEventListener('storage', applyTheme);
    window.addEventListener('themeChange', applyTheme);
    
    return () => {
      window.removeEventListener('storage', applyTheme);
      window.removeEventListener('themeChange', applyTheme);
    };
  }, [])

  const addItemToCart = async (id, quantity) => {
    // console.log(id, quantity)
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API}/product/${id}`)
      const item = {
        product: data.product._id,
        name: data.product.name,
        price: data.product.price,
        image: data.product.images[0].url,
        stock: data.product.stock,
        quantity: quantity
      }

      const isItemExist = state.cartItems.find(i => i.product === item.product)
      let updatedCartItems;

      if (isItemExist) {
        updatedCartItems = state.cartItems.map(i => i.product === isItemExist.product ? item : i)
      } else {
        updatedCartItems = [...state.cartItems, item]
      }

      setState({
        ...state,
        cartItems: updatedCartItems
      })
      
      // Update localStorage after state update
      localStorage.setItem('cartItems', JSON.stringify(updatedCartItems))

      toast.success('Item Added to Cart', {
        position: 'bottom-right'
      })

    } catch (error) {
      toast.error(error, {
        position: 'top-left'
      });

    }

  }
  const removeItemFromCart = async (id) => {
    const updatedCartItems = state.cartItems.filter(i => i.product !== id)
    setState({
      ...state,
      cartItems: updatedCartItems
    })
    localStorage.setItem('cartItems', JSON.stringify(updatedCartItems))
  }

  const saveShippingInfo = async (data) => {
    setState({
      ...state,
      shippingInfo: data
    })
    localStorage.setItem('shippingInfo', JSON.stringify(data))
  }

  const clearCart = () => {
    setState(prev => {
      const updated = { ...prev, cartItems: [] }
      localStorage.setItem('cartItems', JSON.stringify([]))
      return updated
    })
  }


  return (
    <>
      <Router>
        <Header cartItems={state.cartItems} />
        <Routes>
          <Route path="/" element={<Home />} exact="true" />
          <Route path="/product/:id" element={<ProductDetails cartItems={state.cartItems} addItemToCart={addItemToCart} />} exact="true" />
          <Route path="/search/:keyword" element={<Home />} exact="true" />
          <Route path="/login" element={<Login />} exact="true" />
          <Route path="/register" element={<Register exact="true" />} />
          <Route path="/password/forgot" element={<ForgotPassword />} exact="true" />
          <Route path="/password/reset/:token" element={<NewPassword />} exact="true" />
          <Route path="/me" element={<Profile />} exact="true" />
          <Route path="/me/update" element={<UpdateProfile />} exact="true"
 />
          <Route path="/password/update" element={<UpdatePassword />} />
          <Route path="/cart" element={<Cart cartItems={state.cartItems} addItemToCart={addItemToCart} removeItemFromCart={removeItemFromCart} />} exact="true" />
          <Route path="/shipping" element={<Shipping shipping={state.shippingInfo} saveShippingInfo={saveShippingInfo} />} />
          <Route path="/confirm" element={<ConfirmOrder cartItems={state.cartItems} shippingInfo={state.shippingInfo} />} />

          <Route path="/payment" element={<Payment cartItems={state.cartItems} shippingInfo={state.shippingInfo} clearCart={clearCart} />} />

          <Route path="/success" element={<OrderSuccess clearCart={clearCart} />} />
          <Route path="/orders/me" element={<ListOrders />} />
          <Route path="/order/:id" element={<OrderDetails />} />
           {/* <Route path="/dashboard" element={<Dashboard />} /> */}
          {/* <Route path="/admin/products" element={<ProductsList />} /> */}
         <Route path="/admin/newproduct" element={<NewProduct />} />
         <Route path="/admin/product/:id" element={<UpdateProduct />} />
          
            
            <Route path="/admin/user/new" element={<NewUser />} />
            <Route path="/admin/user/:id" element={<UpdateUser />} />


            <Route
            path="/admin/users"
            element={
              <ProtectedRoute isAdmin={true}>
                <UsersList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/products"
            element={
              <ProtectedRoute isAdmin={true}>
                <ProductsList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isAdmin={true}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
            <Route
            path="/admin/reviews"
            element={
              <ProtectedRoute isAdmin={true} >
                <ProductReviews />
              </ProtectedRoute>} 
              />


                  <Route path="/admin/orders" element={<OrdersList />} />
          <Route path="/admin/order/:id" element={<ProcessOrder />} />
        </Routes>

      </Router>
      <Footer />
      <ToastContainer />
    </>
  )
}

export default App
