import SearchCourses from "../components/SearchCourses";
import { useState } from "react";
import { Button } from "react-bootstrap";
import AdminNavbar from "../components/AdminNavbar";

function AdminView() {
	const [courses, setCourses] = useState([]);

	return (
		<>
			<AdminNavbar />
			<h1>Admin</h1>
		</>
	);
}

export default AdminView;
