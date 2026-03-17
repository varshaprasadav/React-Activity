import { Router } from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import authenticate from "../Middleware/auth.js";
import sample from '../Models/sample1.js';
import { Cart } from '../Models/sample1.js';
import { Order } from '../Models/sample1.js';
import { Course } from '../Models/sample1.js';
dotenv.config();

const userauth = Router();

userauth.get('/', (req,res)=>{
  res.send("Hello Everyone");
});

userauth.post('/signup', async(req,res)=>{
  try{
    const {FirstName, LastName, UserName, Password, UserRole} = req.body;
    const existingUser = await sample.findOne({userName:UserName})
    if(existingUser){
      res.status(400).send("Username already exist");
    }
    else {
      const newPassword = await bcrypt.hash(Password,10);
      const newUser = new sample({
        firstName: FirstName,
        lastName: LastName,
        userName: UserName,
        password: newPassword,
        userRole: UserRole
      });
      await newUser.save();
      res.status(201).send("Signed-up successfully")
    }
  }
  catch(err){
    console.error(err);
    res.status(500).send("Internal Server error");
  }
})

userauth.post('/login', async(req,res)=>{
  try{
    const {UserName, Password} = req.body;
    const result = await sample.findOne({userName:UserName})
    if(!result){
      res.status(400).send("Enter a valid username");
    }
    else{
      const valid = await bcrypt.compare(Password, result.password);
      if(valid){
        const token = jwt.sign(
          {UserName:UserName, UserRole:result.userRole},
          process.env.SECRET_KEY,
          {expiresIn:'1h'}
        );
        res.cookie('authToken', token, { httpOnly:true });
        res.status(200).json({message:"Logged in successfully"});
      }
      else{
        res.status(401).json({msg:"Unauthorized access"});
      }
    }
  }
  catch(err){
    console.error(err);
    res.status(500).send({msg:"Internal Server Error"})
  }
})

userauth.post('/logout', (req,res)=>{
  res.clearCookie('authToken');
  res.status(200).json({msg:"Successfully logged out"});
});

userauth.get('/profile', authenticate, (req,res)=>{
  res.status(200).json({userName:req.user, userRole:req.role})
});

// ===================== CART ROUTES =====================

// Get cart for logged-in user
userauth.get('/cart', authenticate, async(req,res)=>{
  try{
    let cart = await Cart.findOne({userName: req.user});
    if(!cart){
      cart = { userName: req.user, items: [] };
    }
    res.status(200).json(cart);
  } catch(err){
    console.error(err);
    res.status(500).json({msg:"Internal Server Error"});
  }
});

// Add item to cart
userauth.post('/cart/add', authenticate, async(req,res)=>{
  try{
    const {courseName} = req.body;
    const course = await Course.findOne({courseName});
    if(!course){
      return res.status(404).json({msg:"Course not found"});
    }

    let cart = await Cart.findOne({userName: req.user});
    if(!cart){
      cart = new Cart({userName: req.user, items: []});
    }

    // Check if course already in cart
    const alreadyInCart = cart.items.some(item => item.courseName === courseName);
    if(alreadyInCart){
      return res.status(400).json({msg:"Course already in cart"});
    }

    cart.items.push({
      courseName: course.courseName,
      courseId: course.courseId,
      courseType: course.courseType,
      price: course.price,
      image: course.image
    });
    cart.updatedAt = new Date();
    await cart.save();
    res.status(200).json({msg:"Course added to cart", cart});
  } catch(err){
    console.error(err);
    res.status(500).json({msg:"Internal Server Error"});
  }
});

// Remove item from cart
userauth.delete('/cart/remove', authenticate, async(req,res)=>{
  try{
    const {courseName} = req.body;
    const cart = await Cart.findOne({userName: req.user});
    if(!cart){
      return res.status(404).json({msg:"Cart not found"});
    }
    cart.items = cart.items.filter(item => item.courseName !== courseName);
    cart.updatedAt = new Date();
    await cart.save();
    res.status(200).json({msg:"Item removed from cart", cart});
  } catch(err){
    console.error(err);
    res.status(500).json({msg:"Internal Server Error"});
  }
});

// Clear cart
userauth.delete('/cart/clear', authenticate, async(req,res)=>{
  try{
    await Cart.findOneAndUpdate({userName: req.user}, {items:[], updatedAt: new Date()});
    res.status(200).json({msg:"Cart cleared"});
  } catch(err){
    console.error(err);
    res.status(500).json({msg:"Internal Server Error"});
  }
});

// ===================== ORDER ROUTES =====================

// Place order (buy all items in cart)
userauth.post('/order/place', authenticate, async(req,res)=>{
  try{
    const cart = await Cart.findOne({userName: req.user});
    if(!cart || cart.items.length === 0){
      return res.status(400).json({msg:"Cart is empty"});
    }

    const totalPrice = cart.items.reduce((sum, item) => sum + item.price, 0);

    const order = new Order({
      userName: req.user,
      items: cart.items,
      totalPrice,
      status: 'completed'
    });
    await order.save();

    // Clear cart after order
    cart.items = [];
    cart.updatedAt = new Date();
    await cart.save();

    res.status(201).json({msg:"Order placed successfully", order});
  } catch(err){
    console.error(err);
    res.status(500).json({msg:"Internal Server Error"});
  }
});

// Get user's orders
userauth.get('/orders', authenticate, async(req,res)=>{
  try{
    const orders = await Order.find({userName: req.user}).sort({createdAt:-1});
    res.status(200).json(orders);
  } catch(err){
    console.error(err);
    res.status(500).json({msg:"Internal Server Error"});
  }
});

export {userauth};
