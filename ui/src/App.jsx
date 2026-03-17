import React from 'react'
import {createBrowserRouter} from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import HomePage from './pages/HomePage'
import ContactPage from './pages/ContactPage'
import AddCoursePage from './pages/AddCoursePage'
import CoursePage, {courseLoader} from './pages/CoursePage'
import CoursesPage from './pages/CoursesPage'
import EditCoursePage from './pages/EditCoursePage'
import CartPage from './pages/CartPage'
import NotFoundPage from './pages/NotFoundPage'
import Protected from './routes/Protected'

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {path:"/login", element:<Login />},
      {path: "/signup", element: <Signup />},
    ],
  },
  {
    element: <MainLayout />,
    children: [
      {path: "/", element: <HomePage />},
      {path: "/courses", element: <CoursesPage />},
      {path: "/course/:courseName", element: <CoursePage />, loader:courseLoader},
      {path: "/contact", element: <ContactPage />},
      {path: "/cart", element: <CartPage />},
    ],
  },
  {
    element: <Protected role="admin" />,
    children: [
      {path: "/admin/add-course", element: <AddCoursePage />},
      {path:"/admin/edit-course/:courseName", element: <EditCoursePage />},
    ],
  },
  {
    element: <Protected />,
    children: [
      {path: "/dashboard", element: <Dashboard />},
    ],
  },
  {path: "*", element: <NotFoundPage />},
])
