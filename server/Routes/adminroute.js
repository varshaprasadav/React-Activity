import { Router } from "express";
import authenticate from "../Middleware/auth.js";
import adminCheck from "../Middleware/adminauth.js";
import {Course} from "../Models/sample1.js";
import upload from "../Middleware/upload1.js";
import sharp from "sharp";

const adminauth = Router();

const convertToBase64 = (buffer) => {
  return buffer.toString("base64");
};

// Add Course
adminauth.post("/addCourse", authenticate, adminCheck, upload.single("courseImage"), async(req,res)=>{
  try{
    const {CourseName, CourseId, CourseType, Description, Price} = req.body;
    const existingCourse = await Course.findOne({courseName:CourseName})
    if(existingCourse){
      res.status(400).json({msg:"Course name already exist"});
    }
    else{
      let imageBase64 = null;
      if (req.file) {
        imageBase64 = convertToBase64(req.file.buffer);
      }
      const newCourse = new Course({
        courseName: CourseName,
        courseId: CourseId,
        courseType: CourseType,
        description: Description,
        price: Number(Price),
        image: imageBase64
      })
      await newCourse.save();
      res.status(201).json({msg:`${CourseName} stored successfully`, data: newCourse})
    }
  }
  catch(err){
    console.error(err);
    res.status(500).send("Internal Server error");
  }
})

// Get all courses
adminauth.get('/getAllCourses', async (req, res) => {
  try {
    const courses = await Course.find({});
    res.json(courses);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

// Get single course
adminauth.get('/getCourse', async (req, res) => {
  try {
    const name = req.query.courseName;
    console.log("Requested course:", name);
    const result = await Course.findOne({ courseName: name });
    if (!result) {
      return res.status(404).json({ msg: "No such course found" });
    }
    res.status(200).json({
      courseName: result.courseName,
      courseId: result.courseId,
      courseType: result.courseType,
      description: result.description,
      price: result.price,
      imageUrl: `/api/getCourseImage?courseName=${encodeURIComponent(name)}`,
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

// Get course image
adminauth.get('/getCourseImage', async (req, res) => {
  try {
    const name = req.query.courseName;
    const result = await Course.findOne({ courseName: name });
    if (!result || !result.image) {
      return res.status(404).json({ msg: "Image not found" });
    }
    const imageBuffer = Buffer.from(result.image, "base64");
    const compressedImage = await sharp(imageBuffer)
      .resize({ width: 300 })
      .jpeg({ quality: 70 })
      .toBuffer();
    res.set("Content-Type", "image/jpeg");
    res.send(compressedImage);
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

// Update Course (full update)
adminauth.put('/updateCourse', authenticate, adminCheck, upload.single("courseImage"), async(req,res)=>{
  try{
    const {CourseName, CourseId, CourseType, Description, Price} = req.body;
    const result = await Course.findOne({courseName:CourseName}).exec();
    if(result){
      result.courseId = CourseId;
      result.courseType = CourseType;
      result.description = Description;
      result.price = Price;

      // Update image if a new one was uploaded
      if(req.file){
        result.image = convertToBase64(req.file.buffer);
      }

      await result.save();
      res.status(201).send("Course successfully updated");
    }
    else{
      res.status(404).send("No such course exist");
    }
  }
  catch(err){
    console.error(err);
    res.status(500).send("Internal Server Error")
  }
})

// Partial update
adminauth.patch('/editCourse', authenticate, adminCheck, async(req,res)=>{
  try{
    const {CourseName, CourseType, Price} = req.body;
    const result = await Course.findOne({courseName:CourseName});
    if(result){
      result.courseType = CourseType;
      result.price = Price;
      await result.save()
      res.status(200).json({msg:"Course successfully updated"});
    }
    else{
      res.status(404).send("Course not found");
    }
  }
  catch(err){
    console.error(err);
    res.status(500).send("Internal Server Error")
  }
})

// ✅ DELETE Course - now fully functional
adminauth.delete('/deleteCourse', authenticate, adminCheck, async(req,res)=>{
  try{
    const {courseName} = req.body;
    const result = await Course.findOne({courseName:courseName})
    if(result){
      await Course.findOneAndDelete({courseName:courseName});
      res.status(200).json({msg:"Course successfully deleted"});
    }
    else{
      res.status(404).json({msg:"Course not found"});
    }
  }
  catch(err){
    console.error(err);
    res.status(500).json({msg:"Internal Server Error"})
  }
})

export default adminauth;
