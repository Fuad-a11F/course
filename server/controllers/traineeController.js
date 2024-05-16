const mongoose = require("mongoose");
const Trainee = require("../models/traineeModel");
const Instructor = require("../models/instructorModel");
const Course = require("../models/courseModel");
const bcrypt = require("bcrypt");

// create a new trainee
const createTrainee = async (req, res) => {
  // add to the database
  try {
    let traineeInfo = req.body;

    const userCandidateEmail = await Trainee.findOne({
      email: traineeInfo.email,
    });

    if (!!userCandidateEmail) {
      res.status(400).json({ error: "User with this email already exists" });

      return;
    }
    const userCandidateUsername = await Trainee.findOne({
      username: traineeInfo.username,
    });

    if (!!userCandidateUsername) {
      res.status(400).json({ error: "User with this username already exists" });

      return;
    }

    traineeInfo.password = await bcrypt.hash(traineeInfo.password, 10);
    const trainee = await Trainee.create(traineeInfo);
    let token = trainee.generateAuthToken();
    res.status(200).json({
      "x-auth-token": token,
      userType: "Trainee",
      user: trainee._doc,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getTrainees = async (req, res) => {
  const trainees = await Trainee.find();

  res.status(200).json(trainees);
};

//get a trainee by id
const getTrainee = async (req, res) => {
  const traineeId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(traineeId)) {
    return res.status(404).json({ error: "No such trainee" });
  }

  const trainee = await Trainee.findById(traineeId);

  if (!trainee) {
    return res.status(404).json({ error: "No such trainee" });
  }
  res.status(200).json(trainee);
};

//update a trainee's data
const updateTrainee = async (req, res) => {
  // add to the database
  const traineeId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(traineeId)) {
    return res.status(400).json({ error: "No such trainee" });
  }

  const trainee = await Trainee.findOneAndUpdate({ _id: traineeId }, req.body, {
    new: true,
  });

  if (!trainee) {
    return res.status(400).json({ error: "No such trainee" });
  }

  let token = trainee.generateAuthToken();
  res.status(200).json({
    "x-auth-token": token,
    userType: "Trainee",
    user: trainee._doc,
  });
};

//delete a trainee
const deleteTrainee = async (req, res) => {
  // add to the database
  const traineeId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(traineeId)) {
    return res.status(400).json({ error: "No such trainee" });
  }

  const trainee = await Trainee.findOneAndDelete({ _id: traineeId });

  if (!trainee) {
    return res.status(400).json({ error: "No such trainee" });
  }

  res.status(200).json(trainee);
};

const payCourse = async (req, res) => {
  // input: id of course and id of trainee and card info
  const traineeId = req.params.tId;
  const courseId = req.params.cId;

  //
  // the function should find course by id and get price, discount and exercises.
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return res.status(404).json({ error: "No such course" });
  }

  const course = await Course.findById(courseId);

  if (!mongoose.Types.ObjectId.isValid(traineeId)) {
    return res.status(404).json({ error: "No such trainee" });
  }

  const trainee = await Trainee.findById(traineeId);

  let amountPaidByCard = course.price;
  amountPaidByCard -= trainee.wallet; //deduct the wallet credit from the price
  if (amountPaidByCard > 0) {
    trainee.wallet = 0; //wallet has less so it goes to zero
    //stripe payment using the amountPaidByCard and card that comes from req.body
  } else {
    trainee.wallet -= course.price;
    amountPaidByCard = 0; //wallet has either enough or more than needed
  }

  let newCourse = {
    course: courseId,
    subtitles: course.subtitles,
    exam: course.exam,
    paidPrice: course.price,
  };
  const instructorShare = course.price / course.instructors.length;
  course.instructors.forEach(async (instructorId) => {
    const instructor = await Instructor.findById(instructorId);
    if (!instructor) {
      return res.status(400).json({ error: "No such Instructor" });
    }
    if (!instructor.monthlyPay.updatedAt) {
      instructor.monthlyPay.updatedAt = new Date();
    }
    if (instructor.monthlyPay.updatedAt.getMonth() === new Date().getMonth()) {
      instructor.monthlyPay.amount += instructorShare;
    } else {
      instructor.monthlyPay.amount = instructorShare;
    }

    instructor.save();
  });
  course.enrolledTrainees.push(traineeId);
  await course.save();
  // add to the database
  trainee.courses.push(newCourse);
  await trainee.save();
  res.status(200).json(trainee);
};

const addPaymentMethod = async (req, res) => {
  const traineeId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(traineeId)) {
    return res.status(404).json({ error: "No such trainee" });
  }

  const trainee = await Trainee.findById(traineeId);
  trainee.paymentMethods.push(req.body);
  await trainee.save();
  res.status(200).json(trainee);
};

//delete a card
const deletePaymentMethod = async (req, res) => {
  const traineeId = req.params.tid;
  const paymentId = req.params.pid;

  if (!mongoose.Types.ObjectId.isValid(traineeId)) {
    return res.status(404).json({ error: "No such trainee" });
  }

  const trainee = await Trainee.findById(traineeId);

  trainee.paymentMethods = trainee.paymentMethods.filter(
    (card) => card._id != paymentId,
  );

  await trainee.save();
  res.status(200).json(trainee);
};

// request a refund for a specific course
const requestRefund = async (req, res) => {
  const traineeId = req.params.traineeId;
  const courseId = req.params.courseId;

  if (!mongoose.Types.ObjectId.isValid(traineeId)) {
    return res.status(400).json({ error: "No such Trainee" });
  }
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return res.status(400).json({ error: "No such Course" });
  }

  const trainee = await Trainee.findById(traineeId);
  let paidPrice = 0;
  const foundCourse = trainee.courses.some((course, i) => {
    if (course.course._id.toString() == courseId) {
      trainee.courses[i].requestedRefund = true;
      paidPrice = trainee.courses[i].paidPrice;
      trainee.save();
      return true;
    }
  });
  if (foundCourse) {
    await Course.findByIdAndUpdate(courseId, {
      $push: {
        refundRequests: { trainee: traineeId, paidPrice: paidPrice },
      },
    });
    res.status(200).json(trainee);
  } else {
    res
      .status(400)
      .json("Error: Requested refund Failed! Couldn't find Course.");
  }
};

module.exports = {
  createTrainee,
  requestRefund,
  getTrainees,
  getTrainee,
  updateTrainee,
  deleteTrainee,
  payCourse,
  addPaymentMethod,
  deletePaymentMethod,
};
