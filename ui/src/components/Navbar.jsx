import {Link, NavLink, useNavigate} from 'react-router-dom'
import {useAuth} from '../context/AuthContext'
import {useCart} from '../context/CartContext'
import {toast} from 'react-toastify'

export default function Navbar(){
  const {profile, isAdmin, logout} = useAuth();
  const {cartCount} = useCart();
  const navigate = useNavigate();

  const onLogout = async () => {
    try{
      await logout();
      toast.success("Logged Out!");
      navigate("/login", {replace:true});
    } catch{
      toast.error("Logout failed!");
    }
  }

  return (
    <nav className='flex items-center justify-between px-6 py-3 bg-white shadow sticky top-0 z-50'>
      <Link to="/" className='font-bold text-purple-800 text-lg'>KBA Courses</Link>

      <div className='flex items-center gap-4'>
        <NavLink to="/courses" className='hover:underline text-gray-700'>Courses</NavLink>
        <NavLink to="/contact" className='hover:underline text-gray-700'>Contact</NavLink>

        {profile ? (
          <>
            <span className='text-sm text-gray-500'>Hi, {profile.username}</span>
            <NavLink to="/dashboard" className='hover:underline text-gray-700'>Dashboard</NavLink>

            {isAdmin && (
              <NavLink to="/admin/add-course" className='hover:underline text-purple-600 font-medium'>
                Add Course
              </NavLink>
            )}

            {/* Cart icon - only for non-admin users */}
            {!isAdmin && (
              <NavLink to="/cart" className='relative hover:text-purple-700'>
                <span className='text-xl'>🛒</span>
                {cartCount > 0 && (
                  <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold'>
                    {cartCount}
                  </span>
                )}
              </NavLink>
            )}

            <button
              onClick={onLogout}
              className='text-sm text-red-600 border border-red-300 rounded px-3 py-1 hover:bg-red-50 transition-colors'
            >
              Logout
            </button>
          </>
        ) : (
          <>
            {/* Cart icon for guests */}
            <NavLink to="/cart" className='relative hover:text-purple-700'>
              <span className='text-xl'>🛒</span>
            </NavLink>
            <NavLink to="/login" className='hover:underline text-gray-700'>Login</NavLink>
            <NavLink to='/signup' className='bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600 transition-colors'>
              Sign Up
            </NavLink>
          </>
        )}
      </div>
    </nav>
  )
}
