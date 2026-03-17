import React from 'react'
import { Link } from 'react-router-dom'

const AllCoursesButton = () => {
  return (
    <div className='flex justify-center mb-40'>
      <Link to="/courses" className='w-80 h-10 rounded-full bg-purple-500 text-white font-medium hover:bg-purple-600 flex items-center justify-center'>
        View all Courses
      </Link>
    </div>
  )
}

export default AllCoursesButton
