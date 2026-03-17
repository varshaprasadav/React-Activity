import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const EditCoursePage = () => {
  const { courseName } = useParams();
  const navigate = useNavigate();

  const [courseId, setCourseId] = useState("");
  const [courseType, setCourseType] = useState("Self-Paced");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(5000);
  const [courseImage, setCourseImage] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      try{
        const res = await fetch(`/api/getCourse?courseName=${encodeURIComponent(courseName)}`);
        if(!res.ok){
          throw new Error("Failed to fetch course details!");
        }
        const data = await res.json();
        if(!data || !data.courseName){
          throw new Error("Course Not found!");
        }
        setCourseId(data.courseId);
        setCourseType(data.courseType || "Self-Paced");
        setDescription(data.description || "");
        setPrice(data.price || 5000);
        setCurrentImageUrl(data.imageUrl || null);
      } catch(err){
        console.error(err);
        setError(err.message);
      } finally{
        setLoading(false);
      }
    }
    fetchCourse();
  }, [courseName]);

  // Image preview when user selects a new file
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if(file){
      setCourseImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const submitForm = async (e) => {
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

      const res = await fetch("/api/updateCourse", {
        method: "PUT",
        credentials: "include",
        body: formData,
        // Do NOT set Content-Type header - browser sets it with boundary for multipart
      });

      const data = await res.text();
      if(!res.ok){
        throw new Error(data || "failed to update course");
      }

      toast.success("Course Updated Successfully!");
      navigate(`/course/${encodeURIComponent(courseName)}`);
    } catch(error){
      console.error("Update Error:", error);
      toast.error(error.message);
    }
  }

  if(loading) {
    return <div className="p-4 text-center">Loading course data...</div>
  }

  if(error) {
    return <div className="p-4 text-red-500">{error}</div>
  }

  return (
    <>
      <section className="bg-white mb-20">
        <div className="container m-auto max-w-2xl py-2">
          <div className="bg-purple-100 px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0">
            <form onSubmit={submitForm} encType="multipart/form-data">
              <h2 className="text-3xl text-purple-800 text-center font-semibold mb-6">
                Update Course
              </h2>

              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Course ID</label>
                <input
                  type="text"
                  className="border rounded w-full py-2 px-3 mb-2"
                  value={courseId}
                  onChange={(e)=> setCourseId(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="type" className="block text-gray-700 font-bold mb-2">
                  Course Type
                </label>
                <select
                  value={courseType}
                  onChange={(e)=> setCourseType(e.target.value)}
                  className="border rounded w-full py-2 px-3"
                  required
                >
                  <option value="Self-Paced">Self-Paced</option>
                  <option value="Instructor-Led">Instructor-Led</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-gray-700 font-bold mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e)=> setDescription(e.target.value)}
                  className="border rounded w-full py-2 px-3"
                  rows="4"
                ></textarea>
              </div>

              <div className="mb-4">
                <label htmlFor="price" className="block text-gray-700 font-bold mb-2">
                  Price
                </label>
                <select
                  value={price}
                  onChange={(e)=> setPrice(Number(e.target.value))}
                  className="border rounded w-full py-2 px-3"
                  required
                >
                  <option value="5000">Rs.5000</option>
                  <option value="3500">Rs.3500</option>
                  <option value="15000">Rs.15000</option>
                </select>
              </div>

              {/* ✅ Image edit section */}
              <div className="mb-6">
                <label className="block text-gray-700 font-bold mb-2">Course Image</label>
                {/* Show current image */}
                {(previewUrl || currentImageUrl) && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-500 mb-1">
                      {previewUrl ? "New image preview:" : "Current image:"}
                    </p>
                    <img
                      src={previewUrl || currentImageUrl}
                      alt="Course"
                      className="w-40 h-28 object-cover rounded border border-purple-300"
                    />
                  </div>
                )}
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-purple-400 rounded cursor-pointer bg-white hover:bg-purple-50 transition-colors">
                  <span className="text-purple-500 font-medium text-sm">
                    📷 {courseImage ? courseImage.name : "Click to upload new image"}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP accepted</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>

              <div>
                <button
                  className="bg-purple-500 hover:bg-purple-600 my-4 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline transition-colors"
                  type="submit"
                >
                  Update Course
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default EditCoursePage;
