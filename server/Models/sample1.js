import {Schema} from 'mongoose';
import {model} from 'mongoose';

const demo=new Schema({
  firstName:String,
  lastName:String,
  userName:{type:String,required:true,unique:true},
  password:String,
  userRole:{type:String ,enum:['admin','user'],required:true}
});

const sample=model('sample1',demo)

export default sample;

const CourseSchema=new Schema({
  courseName:{type:String,unique:true},
  courseId:String,
  courseType:String,
  description:String,
  price:Number,
  image:String
})

const Course=model('courses',CourseSchema)

export {Course};

// Cart item schema
const CartItemSchema = new Schema({
  courseName: String,
  courseId: String,
  courseType: String,
  price: Number,
  image: String
});

// Cart schema - one cart per user
const CartSchema = new Schema({
  userName: { type: String, required: true, unique: true },
  items: [CartItemSchema],
  updatedAt: { type: Date, default: Date.now }
});

const Cart = model('cart', CartSchema);
export { Cart };

// Order schema
const OrderSchema = new Schema({
  userName: { type: String, required: true },
  items: [CartItemSchema],
  totalPrice: Number,
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const Order = model('order', OrderSchema);
export { Order };
