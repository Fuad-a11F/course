import { Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function TraineeNavbarButtons() {
	const navigate = useNavigate();
    
	return (
		<>
			<Nav.Link
				onClick={() => {
					navigate("courses");
				}}
			>
				Catalog
			</Nav.Link>
			<Nav.Link
				onClick={() => {
					navigate("myCourses");
				}}
			>
				My Courses
			</Nav.Link>
			<Nav.Link
				onClick={() => {
					navigate("myReports");
				}}
			>
				My Reports
			</Nav.Link>
		</>
	);
}
