import React, { useState } from "react";
import { Link, useParams, useLoaderData, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import banner from "../assets/images/banner-kba.svg";

export const courseLoader = async({params}) => {
  const courseNameParam = params.courseName;
  try{
    const res = await fetch(`/api/getCourse?courseName=${encodeURIComponent(courseNameParam)}`)
    if(!res.ok){
      const errorData = await res.json();
      throw new Error(errorData.msg || 'Failed to fetch course data');
    }
    const data = await res.json();
    return data;
  } catch(error){
    console.log("Course Loading Error:", error.message)
    return {
      courseName: "Not Found",
      description: "No description available",
      price: 0,
      imageURL: null,
    }
  }
}

const CoursePage = () => {
  const { courseName } = useParams();
  const course = useLoaderData();
  const navigate = useNavigate();
  const { profile, loading: authLoading } = useAuth();
  const { addToCart, cartItems, placeOrder } = useCart();
  const [deleting, setDeleting] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);

  const displayedImage = course.imageUrl ? course.imageUrl : banner;
  const isAdmin = profile?.userRole === "admin";
  const isLoggedIn = !!profile;
  const alreadyInCart = cartItems.some(item => item.courseName === course.courseName);

  if(authLoading){
    return <div className="text-center p-10">Loading course details...</div>
  }

  const handleDelete = async () => {
    if(!window.confirm(`Are you sure you want to delete "${course.courseName}"?`)) return;
    setDeleting(true);
    try{
      const res = await fetch('/api/deleteCourse', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseName: course.courseName }),
      });
      const data = await res.json();
      if(!res.ok) throw new Error(data.msg || 'Failed to delete course');
      toast.success(`"${course.courseName}" deleted successfully!`);
      navigate('/courses');
    } catch(err){
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleAddToCart = async () => {
    if(!isLoggedIn){
      toast.info('Please login to add courses to cart');
      navigate('/login');
      return;
    }
    setCartLoading(true);
    try{
      await addToCart(course.courseName);
      toast.success(`"${course.courseName}" added to cart!`);
    } catch(err){
      toast.error(err.message);
    } finally {
      setCartLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if(!isLoggedIn){
      toast.info('Please login to purchase courses');
      navigate('/login');
      return;
    }
    setBuyLoading(true);
    try{
      if(!alreadyInCart){
        await addToCart(course.courseName);
      }
      const result = await placeOrder();
      toast.success(`🎉 Purchase successful! Order placed for ${result.order.items.length} course(s).`);
      navigate('/dashboard');
    } catch(err){
      toast.error(err.message);
    } finally {
      setBuyLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white text-gray-900 mb-10 pb-10">
        <div className="max-w-4xl mx-auto p-5">
          <section>
            <Link
              className="flex items-center my-5 gap-1 font-medium text-purple-700 hover:underline"
              to="/courses"
            >
              ← Back to Courses
            </Link>
          </section>

          <div className="bg-purple-100 shadow-lg rounded-lg overflow-hidden">
            <img
              src={displayedImage}
              alt="Course Thumbnail"
              className="w-full h-64 object-cover"
            />
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h1 className="text-3xl font-bold text-purple-800">
                  {course.courseName}
                </h1>
                <div className="flex items-center mt-2 sm:mt-0 gap-2">
                  <span className="text-2xl text-red-500 font-semibold mr-2">
                    ₹{course.price?.toLocaleString()}
                  </span>
                  <span className="text-sm bg-purple-200 text-purple-700 px-2 py-1 rounded">
                    {course.courseType}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-purple-800 mb-2">Description</h2>
                <p className="text-gray-700 leading-relaxed">{course.description}</p>
              </div>

              {!isAdmin && (
                <div className="flex flex-wrap gap-3 mt-6">
                  <button
                    onClick={handleAddToCart}
                    disabled={cartLoading || alreadyInCart}
                    className={`px-6 py-3 rounded-full font-bold transition-colors focus:outline-none focus:shadow-outline
                      ${alreadyInCart
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-white border-2 border-purple-500 text-purple-600 hover:bg-purple-50'
                      }`}
                  >
                    {cartLoading ? 'Adding...' : alreadyInCart ? '✓ In Cart' : '🛒 Add to Cart'}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={buyLoading}
                    className="px-6 py-3 rounded-full bg-purple-600 text-white font-bold hover:bg-purple-700 focus:outline-none focus:shadow-outline transition-colors"
                  >
                    {buyLoading ? 'Processing...' : '⚡ Buy Now'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {isAdmin && (
            <div className="flex flex-row justify-end gap-4 mt-6">
              <Link
                className="flex bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full h-10 w-32 focus:outline-none focus:shadow-outline justify-center items-center transition-colors"
                to={`/admin/edit-course/${courseName}`}
              >
                ✏️ Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex bg-red-500 hover:bg-red-600 text-white font-bold rounded-full h-10 w-36 focus:outline-none focus:shadow-outline justify-center items-center transition-colors disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : '🗑️ Delete'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CoursePage;
