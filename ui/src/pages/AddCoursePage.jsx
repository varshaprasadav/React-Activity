import React, { useState } from "react";

const AddCoursePage = () => {
  const [courseName, setCourseName] = useState("")
  const [courseId, setCourseId] = useState("")
  const [courseType, setCourseType] = useState("Self-Paced")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState(5000)
  const [courseImage, setCourseImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if(file){
      setCourseImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      const formData = new FormData();
      formData.append("CourseName", courseName);
      formData.append("CourseId", courseId);
      formData.append("CourseType", courseType);
      formData.append("Description", description);
      formData.append("Price", price);
      if(courseImage){
        formData.append("courseImage", courseImage);
      }

      const res = await fetch("/api/addCourse",{
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if(!res.ok){
        const data = await res.json();
        throw new Error(data.msg || "Error adding course");
      }

      alert("Course added Successfully!");
      setCourseName(""); setCourseId(""); setCourseType("Self-Paced");
      setDescription(""); setPrice(5000); setCourseImage(null); setPreviewUrl(null);
    } catch(err){
      alert("Something went wrong: "+ err.message);
    }
  }

  return (
    <>
      <section className="bg-white mb-20">
        <div className="container m-auto max-w-2xl py-2">
          <div className="bg-purple-100 px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0">
            <h2 className="text-3xl text-purple-800 text-center font-semibold mb-6">Add Course</h2>
            <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">

              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Course Name</label>
                <input type="text" className="border rounded w-full py-2 px-3 mb-2" value={courseName} onChange={(e)=>setCourseName(e.target.value)} placeholder="eg. Certified Blockchain Associate" required />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Course Id</label>
                <input type="text" value={courseId} onChange={(e) => setCourseId(e.target.value)} className="border rounded w-full py-2 px-3 mb-2" placeholder="eg. CBA-101" required />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Course Type</label>
                <select value={courseType} onChange={(e) => setCourseType(e.target.value)} className="border rounded w-full py-2 px-3" required>
                  <option value="Self-Paced">Self-Paced</option>
                  <option value="Instructor-Led">Instructor-Led</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="border rounded w-full py-2 px-3" rows="4" placeholder="Small description on the course"></textarea>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Price</label>
                <select value={price} onChange={(e) => setPrice(Number(e.target.value))} className="border rounded w-full py-2 px-3" required>
                  <option value="5000">Rs.5000</option>
                  <option value="3500">Rs.3500</option>
                  <option value="15000">Rs.15000</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Course Image</label>
                {previewUrl && (
                  <img src={previewUrl} alt="Preview" className="w-40 h-28 object-cover rounded mb-3 border border-purple-300" />
                )}
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-purple-400 rounded cursor-pointer bg-white hover:bg-purple-50 transition-colors">
                  <span className="text-purple-500 font-medium text-sm">
                    📷 {courseImage ? courseImage.name : "Click to upload image"}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP accepted</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>

              <div>
                <button className="bg-purple-500 hover:bg-purple-600 my-4 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none transition-colors" type="submit">
                  Add Course
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default AddCoursePage;
