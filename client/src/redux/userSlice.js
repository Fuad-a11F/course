import { createSlice } from "@reduxjs/toolkit";
import api from "../functions/api";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    token: "",
    type: "Guest",
    user: {
      country: "USA",
      currency: "USD",
      exchangeRate: 1,
    },
  },
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setType: (state, action) => {
      state.type = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setCountry: (state, action) => {
      state.user.country = action.payload;
      if (state.type !== "Guest")
        api.put(`/${state.type}s/${state.user._id}`, {
          country: action.payload,
        });
    },
    setCourses: (state, action) => {
      state.user.courses = action.payload;
    },
    setCourseRefund: (state, action) => {
      console.log(action);
      state.user.courses = state.user.courses.map((course) => {
        if (course.course === action.payload) {
          course.requestedRefund = true;
        }
        //console.log(course);
        return course;
      });
    },
    setRequests: (state, action) => {
      state.user.requests = action.payload;
    },
    payFromWallet: (state, action) => {
      state.user.wallet -= action.payload;
    },
    watchVideo: (state, action) => {
      state.user.courses[action.payload.courseIndex].subtitles[
        action.payload.subtitleIndex
      ].videos[action.payload.videoIndex].isWatched = true;
      state.user.courses[action.payload.courseIndex].progress =
        action.payload.progress;
    },
    updateInstructorCourses: (state, action) => {
      state.user.courses = [...state.user.courses, action.payload];
    },
    addNoteToVideoNotes: (state, action) => {
      state.user.courses[action.payload.courseIndex].subtitles[
        action.payload.subtitleIndex
      ].videos[action.payload.videoIndex].notes = [
        ...state.user.courses[action.payload.courseIndex].subtitles[
          action.payload.subtitleIndex
        ].videos[action.payload.videoIndex].notes,
        action.payload.note,
      ];
    },
    deleteNoteFromVideoNotes: (state, action) => {
      let newNotes = state.user.courses[action.payload.courseIndex].subtitles[
        action.payload.subtitleIndex
      ].videos[action.payload.videoIndex].notes.filter(
        (_, i) => i !== action.payload.noteIndex,
      );

      state.user.courses[action.payload.courseIndex].subtitles[
        action.payload.subtitleIndex
      ].videos[action.payload.videoIndex].notes = newNotes;
      // state.notifications = state.notifications.filter((notification, i) => i !== action.payload);
    },
    solveExercise: (state, action) => {
      state.user.courses[action.payload.courseIndex].subtitles[
        action.payload.subtitleIndex
      ].exercises[action.payload.exerciseIndex].isSolved = true;
      state.user.courses[action.payload.courseIndex].subtitles[
        action.payload.subtitleIndex
      ].exercises[action.payload.exerciseIndex].questions =
        action.payload.questions;
      state.user.courses[action.payload.courseIndex].subtitles[
        action.payload.subtitleIndex
      ].exercises[action.payload.exerciseIndex].receivedGrade =
        action.payload.receivedGrade;
    },
    solveExam: (state, action) => {
      state.user.courses[action.payload.courseIndex].exam.isSolved = true;
      state.user.courses[action.payload.courseIndex].exam.questions =
        action.payload.questions;
      state.user.courses[action.payload.courseIndex].exam.receivedGrade =
        action.payload.receivedGrade;
    },
    readContentDispatch: (state, action) => {
      state.user.courses[action.payload.courseIndex].subtitles[
        action.payload.subtitleIndex
      ].content[action.payload.contentIndex].isWatched = true;

      state.user.courses[action.payload.courseIndex].subtitles[
        action.payload.subtitleIndex
      ].content[action.payload.contentIndex].receivedGrade =
        action.payload.receivedGrade;
    },
    resetMonthlyPay: (state) => {
      state.user.monthlyPay.amount = 0;
    },
    login: (state, action) => {
      state.type = action.payload.type;
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    logout: (state) => {
      localStorage.clear();
      state.type = "Guest";
      state.token = "";
      state.user = {
        country: "USA",
        currency: "USD",
        exchangeRate: 1,
      };
    },
    deleteCourseInstructor: (state, action) => {
      state.user.courses = state.user.courses.filter(
        (courseId) => courseId !== action.payload.courseId,
      );
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setToken,
  setType,
  setUser,
  logout,
  login,
  setCountry,
  setCourses,
  setRequests,
  payFromWallet,
  resetMonthlyPay,
  watchVideo,
  addNoteToVideoNotes,
  deleteNoteFromVideoNotes,
  solveExercise,
  updateInstructorCourses,
  solveExam,
  deleteCourseInstructor,
  setCourseRefund,
  readContentDispatch,
} = userSlice.actions;

export default userSlice.reducer;
