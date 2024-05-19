import { Card } from "react-bootstrap";
import { useSelector } from "react-redux";

function PersonalInfo() {
  const { firstName, lastName, gender, courses, paymentMethods } = useSelector(
    (state) => state.userReducer.user,
  );

  return (
    <>
      <Card>
        <Card.Body>
          <Card.Title>
            Привет, {firstName} {lastName}
          </Card.Title>
          {/* Your Courses:
					{courses.map((course, i) => (
						<Card.Text key={"PersonalInfo_Card" + i + course.title}>
							{course.Title}
						</Card.Text>
					))} */}
        </Card.Body>
      </Card>
    </>
  );
}

export default PersonalInfo;
