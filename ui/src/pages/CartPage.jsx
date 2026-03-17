import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartPage = () => {
  const { cartItems, totalPrice, removeFromCart, placeOrder, loading } = useCart();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [removingItem, setRemovingItem] = useState(null);

  const handleRemove = async (courseName) => {
    setRemovingItem(courseName);
    try {
      await removeFromCart(courseName);
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRemovingItem(null);
    }
  };

  const handleCheckout = async () => {
    if (!profile) {
      toast.info('Please login to checkout');
      navigate('/login');
      return;
    }
    setCheckoutLoading(true);
    try {
      const result = await placeOrder();
      toast.success(`🎉 Order placed successfully! Total: ₹${result.order.totalPrice?.toLocaleString()}`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-20 text-gray-500">Loading cart...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-purple-800 mb-8">🛒 Your Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">🛒</p>
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">Your cart is empty</h2>
          <p className="text-gray-400 mb-6">Add some courses to get started!</p>
          <Link
            to="/courses"
            className="bg-purple-500 text-white px-6 py-3 rounded-full font-bold hover:bg-purple-600 transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.courseName}
                className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4 border border-purple-100"
              >
                <div className="w-20 h-16 shrink-0 rounded-lg overflow-hidden bg-purple-100">
                  {item.image ? (
                    <img
                      src={`/api/getCourseImage?courseName=${encodeURIComponent(item.courseName)}`}
                      alt={item.courseName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-purple-400 text-2xl">
                      📚
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">{item.courseName}</h3>
                  <p className="text-sm text-gray-500">{item.courseType}</p>
                  <p className="text-purple-600 font-bold mt-1">₹{item.price?.toLocaleString()}</p>
                </div>

                <button
                  onClick={() => handleRemove(item.courseName)}
                  disabled={removingItem === item.courseName}
                  className="text-red-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50 shrink-0"
                  title="Remove from cart"
                >
                  {removingItem === item.courseName ? (
                    <span className="text-sm">...</span>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="lg:w-72">
            <div className="bg-purple-50 rounded-xl shadow-md p-6 border border-purple-200 sticky top-24">
              <h2 className="text-xl font-bold text-purple-800 mb-4">Order Summary</h2>

              <div className="space-y-2 mb-4">
                {cartItems.map((item) => (
                  <div key={item.courseName} className="flex justify-between text-sm text-gray-600">
                    <span className="truncate mr-2 max-w-40">{item.courseName}</span>
                    <span className="font-medium whitespace-nowrap">₹{item.price?.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-purple-200 pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold text-purple-800">
                  <span>Total</span>
                  <span>₹{totalPrice?.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{cartItems.length} course(s)</p>
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-full transition-colors focus:outline-none focus:shadow-outline disabled:opacity-60"
              >
                {checkoutLoading ? 'Processing...' : '⚡ Checkout & Buy'}
              </button>

              <Link
                to="/courses"
                className="block text-center mt-3 text-purple-600 hover:underline text-sm"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
