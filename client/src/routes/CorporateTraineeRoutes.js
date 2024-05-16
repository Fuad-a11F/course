import { Routes, Route } from "react-router-dom";
import Layout from "../components/shared/Layout";
import Protected from "../components/shared/Protected";
import CorporateTraineeHome from "../pages/corporateTrainee/CorporateTraineeHome";
import CourseDetails from "../pages/sharedTrainee/CoursePage";
import Courses from "../pages/sharedTrainee/Courses";
import ChangePassword from "../components/shared/ChangePassword";
import ContinueCourse from "../pages/ContinueCourse";
import ViewInstructor from "../pages/ViewInstructor";
import MyReports from "../pages/MyReports";
import NotFound from "../pages/NotFound";
import MyCoursesPage from "../pages/sharedTrainee/MyCoursesPage";
import Profile from "../pages/Profile";
import TraineeEditProfile from "../pages/trainee/TraineeEditProfile";
export function CorporateTraineeRoutes() {
  return (
    <>
      <Protected authorizedUserType={"CorporateTrainee"}>
        <Routes>
          <Route path="" element={<Layout />}>
            <Route path="" element={<CorporateTraineeHome />} />
            <Route path="courses" element={<Courses />} />
            <Route path="myCourses" element={<MyCoursesPage />} />{" "}
            <Route path="profile" element={<Profile />} />
            <Route path="changePassword" element={<ChangePassword />} />{" "}
            <Route path="editProfile" element={<TraineeEditProfile />} />
            <Route
              path="courses/:id/continueCourse"
              element={<ContinueCourse />}
            />
            <Route path="courses/:id" element={<CourseDetails />} />
            <Route path="viewInstructor/:id" element={<ViewInstructor />} />
            <Route path="myReports" element={<MyReports />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Protected>
    </>
  );
}
