const mongoose = require("mongoose");
const Administrator = require("../models/administratorModel");
const Course = require("../models/courseModel");
const Trainee = require("../models/traineeModel");
const Instructor = require("../models/instructorModel");
const bcrypt = require("bcrypt");
const CorporateTrainee = require("../models/corporateTraineeModel");

const getAdministrators = async (req, res) => {
  const administrators = await Administrator.find();
  res.status(200).json(administrators);
};

//GET all access requests of a all courses returning trainee id and for each request the course id
const getAllCoursesRequests = async (req, res) => {
  try {
    const courses = await Course.find().populate("instructors");

    res.status(200).json(courses.filter((item) => item.status === "Review"));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//UPDATE grant access to a specific course
const handleCourseRequest = async (req, res) => {
  const corporateTrainee = await CorporateTrainee.findOneAndUpdate(
    { "requests._id": req.body.requestId },
    { "requests.$.status": req.body.status },
  );

  if (!corporateTrainee) {
    return res.status(400).json({ error: "No such corporate Trainee" });
  }
  //Body --> course Id, status, corp Trainee Id
  request = corporateTrainee.requests.filter(
    (request) => request._id == req.body.requestId,
  );

  let courseId = request[0].courseId;
  let traineeId = corporateTrainee._id;

  let corporateTraineeUpdated = {};
  if (req.body.status.toLowerCase() == "accepted") {
    const course = await Course.findById(courseId);

    corporateTraineeUpdated = await CorporateTrainee.findByIdAndUpdate(
      traineeId,
      {
        $push: {
          courses: {
            course: courseId,
            subtitles: course.subtitles,
            exam: course.exam,
          },
        },
        // $pull: { requests: { _id: req.body.requestId } },
      },
      { new: true },
    );
    course.enrolledTrainees.push(traineeId);
    await course.save();
  }

  res.status(200).json(corporateTraineeUpdated);
};

// get a single administrator
const getAdministrator = async (req, res) => {
  const administratorId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(administratorId)) {
    return res.status(404).json({ error: "No such administrator" });
  }

  const administrator = await Administrator.findById(administratorId);

  if (!administrator) {
    return res.status(404).json({ error: "No such administrator" });
  }

  res.status(200).json(administrator);
};

// create a new administrator
const createAdministrator = async (req, res) => {
  // add to the database
  try {
    let adminInfo = req.body;
    adminInfo.password = await bcrypt.hash(adminInfo.password, 10);
    let administrator = await Administrator.create(adminInfo);
    let token = administrator.generateAuthToken();
    res.status(200).json({
      "x-auth-token": token,
      userType: "Administrator",
      user: administrator._doc,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// delete a administrator
const deleteAdministrator = async (req, res) => {
  const administratorId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(administratorId)) {
    return res.status(400).json({ error: "No such administrator" });
  }

  const administrator = await Administrator.findOneAndDelete({
    _id: administratorId,
  });

  if (!administrator) {
    return res.status(400).json({ error: "No such administrator" });
  }

  res.status(200).json(administrator);
};

// update a administrator
const updateAdministrator = async (req, res) => {
  const administratorId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(administratorId)) {
    return res.status(400).json({ error: "No such administrator" });
  }

  const administrator = await Administrator.findOneAndUpdate(
    { _id: administratorId },
    req.body,
    {
      new: true,
    },
  );

  if (!administrator) {
    return res.status(400).json({ error: "No such administrator" });
  }

  let token = administrator.generateAuthToken();
  res.status(200).json({
    "x-auth-token": token,
    userType: "Administrator",
    user: administrator._doc,
  });
};

// Get all courses with Refunds and populate the TraineeId
const getRefundRequests = async (req, res) => {
  try {
    const course = await Course.find({
      refundRequests: { $exists: true, $ne: [] },
    }).populate({
      path: "refundRequests.trainee",
    });
    res.status(200).json(course);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Refund to Trainee's Wallet
const refundToWallet = async (req, res) => {
  const refundId = req.params.refundId;
  try {
    const course = await Course.findOneAndUpdate(
      {
        refundRequests: { $elemMatch: { _id: refundId } },
      },
      { $pull: { refundRequests: { _id: mongoose.Types.ObjectId(refundId) } } },
    );

    course.refundRequests = course.refundRequests.filter(
      (request) => request._id == refundId,
    );
    let courseId = course._id;
    let traineeId = course.refundRequests[0].trainee;
    let paidPrice = course.refundRequests[0].paidPrice;
    const trainee = await Trainee.findByIdAndUpdate(
      traineeId,
      {
        $inc: { wallet: paidPrice },
        $pull: { courses: { course: mongoose.Types.ObjectId(courseId) } },
      },
      { new: true },
    );

    course.enrolledTrainees = course.enrolledTrainees.filter(
      (enrolledTrainee) => {
        !enrolledTrainee.equals(traineeId);
      },
    );

    const instructorShare = paidPrice / course.instructors.length;
    course.instructors.forEach(async (instructorId) => {
      const instructor = await Instructor.findById(instructorId);
      instructor.monthlyPay.amount -= instructorShare;
      await instructor.save();
    });

    await course.save();
    res.status(200).json(trainee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAdministrators,
  getAdministrator,
  createAdministrator,
  deleteAdministrator,
  updateAdministrator,
  getRefundRequests,
  refundToWallet,
  getAllCoursesRequests,
  handleCourseRequest,
};
