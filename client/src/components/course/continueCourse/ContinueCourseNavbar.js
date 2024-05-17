import { Toolbar, AppBar } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { Breadcrumb, Button, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";
import API from "../../../functions/api";
import { addNotification } from "../../../redux/notificationsSlice";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axios from "axios";
import { solveExercise, watchVideo } from "../../../redux/userSlice";
export default function ContinueCourseNavbar({
  Course,
  handleNext,
  handlePrevious,
}) {
  // Setup
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const MySwal = withReactContent(Swal);

  // Page Control
  const User = useSelector((state) => state.userReducer.user);
  const UserType = useSelector((state) => state.userReducer.type);

  const CourseIndex = useSelector(
    (state) => state.userReducer.user.courses,
  ).findIndex((course) => course.course === Course._id);

  const CourseCurrent = useSelector(
    (state) => state.userReducer.user.courses,
  ).find((course) => course.course === Course._id);

  const Subtitles = useSelector(
    (state) => state.userReducer.user.courses[CourseIndex].subtitles,
  );

  const SubtitleIndex = useSelector(
    (state) => state.continueCourseReducer.subtitleIndex,
  );
  const SelectedContentIndex = useSelector(
    (state) => state.continueCourseReducer.selectedContentIndex,
  );

  const Content = useSelector((state) => state.continueCourseReducer.content);

  const ContentType = useSelector(
    (state) => state.continueCourseReducer.contentType,
  );
  const Progress = useSelector(
    (state) => state.userReducer.user.courses[CourseIndex].progress,
  );
  const mainNavbar = document.getElementById("main-navbar");
  console.log(Content);
  console.log(User.courses[CourseIndex].subtitles[SubtitleIndex].videos);
  const VideoIndex = User.courses[CourseIndex].subtitles[
    SubtitleIndex
  ].videos.findIndex((video) => video._id === Content._id);
  const Answers = useSelector((state) => state.continueCourseReducer.answers);

  const ExerciseIndex =
    ContentType === "Exercise"
      ? User.courses[CourseIndex].subtitles[SubtitleIndex].exercises.findIndex(
          (video) => video._id === Content._id,
        )
      : -1;

  let userQuestions = Content?.questions?.map((question, questionIndex) => {
    return { ...question, studentAnswer: Answers[questionIndex].choice };
  });

  const markAsFinish = async () => {
    if (Content.type === "Video") {
      const config = {
        method: "PUT",
        url: `http://localhost:4000/api/courses/${User._id}/watchVideo`,
        data: {
          userType: UserType,
          courseIndex: CourseIndex,
          subtitleIndex: SubtitleIndex,
          videoIndex: VideoIndex,
        },
      };

      const response = await axios(config);

      let progress = response.data.courses[CourseIndex].progress;

      console.log(progress);

      dispatch(
        watchVideo({
          courseIndex: CourseIndex,
          subtitleIndex: SubtitleIndex,
          videoIndex: VideoIndex,
          progress: progress,
        }),
      );
    } else if (Content.type === "Exercise") {
      const config = {
        method: "PUT",
        url: `http://localhost:4000/api/courses/${User._id}/solveExercise`,
        data: {
          userType: UserType,
          courseIndex: CourseIndex,
          subtitleIndex: SubtitleIndex,
          exerciseIndex: ExerciseIndex,
          questions: userQuestions,
          receivedGrade: 2,
        },
      };

      await axios(config);

      dispatch(
        solveExercise({
          courseIndex: CourseIndex,
          subtitleIndex: SubtitleIndex,
          exerciseIndex: ExerciseIndex,
          questions: userQuestions,
          receivedGrade: 2,
        }),
      );
    }
  };

  return (
    <AppBar
      position="fixed"
      style={{ zIndex: "3", backgroundColor: "#F8F8F8" }}
    >
      <Toolbar
        id="continueCourseBreadcrumbs"
        className="continueCourseBreadcrumbs"
        sx={{
          marginTop: { sm: `${mainNavbar ? mainNavbar.offsetHeight : ""}px` },
        }}
      >
        {/* Breadcrumbs */}
        <Col sm={7}>
          {/* Subtitles */}
          {Subtitles[SubtitleIndex] && (
            <Breadcrumb className="my-auto">
              <Breadcrumb.Item className="cut-text">
                {Course.title}
              </Breadcrumb.Item>
              <Breadcrumb.Item className="cut-text">
                {Subtitles[SubtitleIndex].title}
              </Breadcrumb.Item>
              <Breadcrumb.Item className="breadcrumbItem">
                {Content.title}
              </Breadcrumb.Item>
            </Breadcrumb>
          )}
          {/* Exam */}
          {ContentType === "Exam" && (
            <Breadcrumb>
              <Breadcrumb.Item className="cut-text">
                {Course.title}
              </Breadcrumb.Item>
              <Breadcrumb.Item className="breadcrumbItem">
                {Content.title}
              </Breadcrumb.Item>
            </Breadcrumb>
          )}
        </Col>
        {/* Page Naviagtion */}

        <Col sm={5}>
          <div className="ms-auto d-flex">
            {/* Progress and Get Certificate */}
            <div className="d-flex ms-auto my-auto">
              {/* Get Certificate */}
              {Progress === 1 && (
                <Button
                  variant="link"
                  className="ms-3 blackText "
                  onClick={async () => {
                    MySwal.fire({
                      toast: true,
                      position: "bottom-end",
                      showConfirmButton: false,
                      timer: 4000,
                      title: <strong>Continue Course</strong>,
                      html: <i>We have sent to you your Certificate.</i>,
                      icon: "success",
                      timerProgressBar: true,
                      grow: "row",
                    });
                    await API.post(`/courses/sendCertificate`, {
                      courseTitle: Course.title,
                      email: User.email,
                    });
                  }}
                >
                  Get Certificate
                </Button>
              )}
            </div>
            {/* Previous */}
            {(SubtitleIndex !== 0 || SelectedContentIndex !== 0) && (
              <Button
                variant="link"
                className="blackText linkDecor"
                onClick={handlePrevious}
              >
                <AiOutlineArrowLeft />
                Previous
              </Button>
            )}
            {/* Next */}
            {ContentType !== "Exam" && (
              <Button
                variant="link"
                className="blackText linkDecor"
                onClick={handleNext}
              >
                Next
                <AiOutlineArrowRight />
              </Button>
            )}
            {/* View Course */}
            <Button
              variant="primary"
              className="ms-1  linkDecor"
              onClick={() =>
                navigate(`/${UserType.toLowerCase()}/courses/${Course._id}`)
              }
            >
              Back to Course
            </Button>
            {/* Mark as a finish */}
            <Button
              variant="primary"
              className="ms-1  linkDecor"
              onClick={() => markAsFinish()}
            >
              Пометить как пройденное
            </Button>
          </div>
        </Col>
      </Toolbar>
    </AppBar>
  );
}
