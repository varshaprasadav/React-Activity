import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loadingOrders, setLoadingOrders] = useState(false);
  const navigate = useNavigate();

  useEffect(()=>{
    const fetchProfile = async () =>{
      try{
        const response = await fetch('/api/profile',{
          method:'GET',
          credentials:'include',
        });
        if(!response.ok){
          throw new Error('Unauthorized Access!');
        }
        const data = await response.json();
        setProfile(data);

        if(data.userRole === 'user'){
          setLoadingOrders(true);
          try{
            const ordersRes = await fetch('/api/orders', { credentials: 'include' });
            if(ordersRes.ok){
              const ordersData = await ordersRes.json();
              setOrders(ordersData);
            }
          } catch(err){
            console.error('Orders fetch error:', err);
          } finally {
            setLoadingOrders(false);
          }
        }
      } catch(err){
        setError(err.message || 'Error fetching Profile')
        navigate('/login');
      }
    }
    fetchProfile();
  },[navigate])

  return (
    <div className='p-8 max-w-4xl mx-auto'>
      <h2 className='text-3xl font-bold mb-6 text-purple-800'>Dashboard</h2>
      {error && <p className='text-red-500'>{error}</p>}

      {profile ? (
        <div>
          <div className='bg-purple-100 rounded-xl p-6 mb-8 shadow'>
            <div className='flex items-center gap-4'>
              <div className='w-16 h-16 rounded-full bg-purple-500 flex items-center justify-center text-white text-2xl font-bold'>
                {profile.userName?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className='text-xl font-bold text-purple-900'>{profile.userName}</p>
                <p className='text-purple-600 capitalize'>{profile.userRole}</p>
              </div>
            </div>
          </div>

          {profile.userRole === 'user' && (
            <div>
              <h3 className='text-2xl font-semibold text-purple-800 mb-4'>My Orders</h3>
              {loadingOrders ? (
                <p className='text-gray-500'>Loading orders...</p>
              ) : orders.length === 0 ? (
                <div className='bg-gray-50 rounded-xl p-8 text-center border border-gray-200'>
                  <p className='text-4xl mb-3'>📦</p>
                  <p className='text-gray-500'>No orders yet. Browse our courses and start learning!</p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {orders.map((order) => (
                    <div key={order._id} className='bg-white rounded-xl shadow p-5 border border-purple-100'>
                      <div className='flex justify-between items-start mb-3'>
                        <div>
                          <p className='text-sm text-gray-400'>Order ID: {order._id}</p>
                          <p className='text-sm text-gray-400'>
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'long', year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className='text-right'>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            order.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.status}
                          </span>
                          <p className='font-bold text-purple-700 mt-1'>₹{order.totalPrice?.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className='space-y-1'>
                        {order.items.map((item, idx) => (
                          <div key={idx} className='flex justify-between text-sm text-gray-600 bg-purple-50 rounded px-3 py-2'>
                            <span>{item.courseName}</span>
                            <span className='font-medium'>₹{item.price?.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {profile.userRole === 'admin' && (
            <div className='bg-blue-50 rounded-xl p-6 border border-blue-200'>
              <p className='text-blue-700 font-medium'>👑 Admin Panel</p>
              <p className='text-blue-500 text-sm mt-1'>You have full access to manage courses.</p>
            </div>
          )}
        </div>
      ):(
        <p className='text-gray-500'>Loading Profile...</p>
      )}
    </div>
  )
}

export default Dashboard
