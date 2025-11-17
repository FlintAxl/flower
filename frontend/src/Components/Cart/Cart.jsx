import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MetaData from '../Layout/MetaData';

const Cart = ({ addItemToCart, removeItemFromCart, cartItems }) => {
  const navigate = useNavigate();

  const increaseQty = (id, quantity, stock) => {
    const newQty = quantity + 1;
    if (newQty > stock) return;
    addItemToCart(id, newQty);
  };

  const decreaseQty = (id, quantity) => {
    const newQty = quantity - 1;
    if (newQty <= 0) return;
    addItemToCart(id, newQty);
  };

  const removeCartItemHandler = (id) => {
    removeItemFromCart(id);
  };

  const checkoutHandler = () => {
    navigate('/login?redirect=shipping');
  };

  localStorage.setItem('cartItems', JSON.stringify(cartItems));

  return (
    <>
      <MetaData title={'Your Cart'} />

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#4A3F35]">
      
          <h2 className="text-2xl font-semibold mb-2">Your Cart is Empty</h2>
          <Link
            to="/"
            className="bg-[#F7CAC9] text-[#4A3F35] px-5 py-2 rounded-full hover:bg-[#f4bfb7] transition-all shadow-sm"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="container mx-auto px-6 py-10">
          <h2 className="text-3xl font-bold text-[#4A3F35] mb-8 text-center">
            Your Cart <span className="text-[#D6A77A]">({cartItems.length} items)</span>
          </h2>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Cart Items */}
            <div className="flex-1 bg-white rounded-2xl shadow-md p-6 border border-[#F0E3D0]">
              {cartItems.map((item) => (
                <div
                  key={item.product}
                  className="flex flex-col sm:flex-row items-center justify-between py-4 border-b border-[#F3E7D3] last:border-none"
                >
                  {/* Image */}
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-xl border border-[#EAD8C5]"
                    />
                    <Link
                      to={`/products/${item.product}`}
                      className="font-semibold text-[#4A3F35] hover:text-[#C89B6D] transition-all"
                    >
                      {item.name}
                    </Link>
                  </div>

                  {/* Price */}
                  <div className="text-[#6B5B4A] font-medium mt-2 sm:mt-0">${item.price}</div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mt-3 sm:mt-0">
                    <button
                      className="px-3 py-1.5 bg-[#F7CAC9] rounded-full hover:bg-[#f4bfb7] transition-all font-bold"
                      onClick={() => decreaseQty(item.product, item.quantity)}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      readOnly
                      className="w-12 text-center border border-[#E8D9C4] rounded-md text-[#4A3F35] font-semibold"
                    />
                    <button
                      className="px-3 py-1.5 bg-[#F7CAC9] rounded-full hover:bg-[#f4bfb7] transition-all font-bold"
                      onClick={() => increaseQty(item.product, item.quantity, item.stock)}
                    >
                      +
                    </button>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => removeCartItemHandler(item.product)}
                    className="text-red-500 hover:text-red-700 mt-3 sm:mt-0"
                    title="Remove"
                  >
                    <i className="fa fa-trash text-xl"></i>
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-1/3 bg-[#FFF9F5] rounded-2xl shadow-md p-6 border border-[#F0E3D0]">
              <h4 className="text-2xl font-semibold text-[#4A3F35] mb-4">Order Summary</h4>
              <hr className="mb-4 border-[#E8D9C4]" />

              <p className="flex justify-between text-[#4A3F35] mb-2">
                Subtotal:
                <span className="font-medium">
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)} Units
                </span>
              </p>

              <p className="flex justify-between text-[#4A3F35] mb-6">
                Est. Total:
                <span className="font-bold text-[#C89B6D]">
                  $
                  {cartItems
                    .reduce((acc, item) => acc + item.quantity * item.price, 0)
                    .toFixed(2)}
                </span>
              </p>

              <button
                id="checkout_btn"
                onClick={checkoutHandler}
                className="w-full py-3 bg-[#F7CAC9] text-[#4A3F35] rounded-full font-semibold hover:bg-[#f4bfb7] transition-all shadow-sm"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Cart;
