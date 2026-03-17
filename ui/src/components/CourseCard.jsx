import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const CourseCard = ({course}) => {
  const [showFullDescription, setShowFullDescription] = useState(false)
  const { addToCart, cartItems } = useCart()
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [cartLoading, setCartLoading] = useState(false)

  const description = showFullDescription
    ? course.description
    : (course.description || '').substring(0, 70)

  const alreadyInCart = cartItems.some(item => item.courseName === course.courseName)
  const isAdmin = profile?.userRole === 'admin'

  const handleAddToCart = async (e) => {
    e.preventDefault()
    if (!profile) {
      toast.info('Please login to add courses to cart')
      navigate('/login')
      return
    }
    setCartLoading(true)
    try {
      await addToCart(course.courseName)
      toast.success(`"${course.courseName}" added to cart!`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setCartLoading(false)
    }
  }

  return (
    <div className='bg-purple-100 rounded-xl shadow-2xl flex flex-col items-center justify-between mx-2 my-5 py-6 px-4 hover:shadow-3xl transition-shadow'>
      <div className='w-full h-40 rounded-lg overflow-hidden bg-purple-200 mb-3'>
        {course.image ? (
          <img
            src={`/api/getCourseImage?courseName=${encodeURIComponent(course.courseName)}`}
            alt='course thumbnail'
            className='w-full h-full object-cover'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center text-purple-400 text-5xl'>📚</div>
        )}
      </div>

      <h2 className='font-bold text-lg text-purple-900 text-center mb-1'>{course.courseName}</h2>
      <p className='text-xs text-purple-500 mb-2'>{course.courseType}</p>
      <p className='text-gray-700 my-2 text-sm text-center'>{description}{!showFullDescription && course.description?.length > 70 && '...'}</p>

      <button
        className='text-purple-400 hover:text-purple-600 py-1 text-sm self-start'
        onClick={() => setShowFullDescription(!showFullDescription)}
      >
        {showFullDescription ? 'Show Less' : 'Show More'}
      </button>

      <div className='flex items-center justify-between w-full mt-3 gap-2'>
        <p className='font-bold text-red-500'>₹{course.price?.toLocaleString()}</p>

        <div className='flex gap-2'>
          {!isAdmin && (
            <button
              onClick={handleAddToCart}
              disabled={cartLoading || alreadyInCart}
              className={`text-xs px-3 py-2 rounded-full font-medium transition-colors
                ${alreadyInCart
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-purple-400 text-purple-600 hover:bg-purple-50'
                }`}
            >
              {cartLoading ? '...' : alreadyInCart ? '✓ In Cart' : 'Add to Cart'}
            </button>
          )}

          <Link
            to={`/course/${encodeURIComponent(course.courseName)}`}
            className='bg-purple-500 text-white text-xs px-3 py-2 rounded-full hover:bg-purple-600 transition-colors'
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CourseCard
