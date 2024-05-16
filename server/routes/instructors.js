const express = require("express");
const {
  getInstructors,
  getInstructor,
  createInstructor,
  deleteInstructor,
  updateInstructor,
  reviewInstructor,
  getInstructorReviews,
  getMonthlyIncome,
} = require("../controllers/instructorController");

const {
  createCourseInstructor,
  getCoursesInstructor,
} = require("../controllers/courseController");
const ban = require("../middleware/ban");

const router = express.Router();

// GET all Instructors
router.get("/", getInstructors);

// GET a single Instructor
router.get("/:id", getInstructor);

// Create a new Instructor
router.post("/", createInstructor);

// DELETE an Instructor
router.delete("/:id", deleteInstructor);

// UPDATE an Instructor
router.put("/:id", updateInstructor);

// Create a new Course
router.post("/:id/courses", createCourseInstructor);

// View all Courses' Titles given by him/her and search/filter.
router.get("/:id/courses", getCoursesInstructor);

// Review an Instructor
router.post("/:id/review", reviewInstructor);

// Review an Instructor
router.get("/:id/reviews", getInstructorReviews);

// Add to Monthly Income
router.get("/:id/income", getMonthlyIncome);

module.exports = router;
