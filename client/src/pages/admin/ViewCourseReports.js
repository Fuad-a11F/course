import { useEffect, useState } from "react";
import { Col, Tab, Tabs, Container, Button } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import ReportCard from "../../components/admin/ReportCard";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Pagination from "../../components/shared/pagination/Pagination";
let pageSize = 12;
function ViewCourseReports() {
	const navigate = useNavigate();
	const [Reports, setReports] = useState([]);
	const [reportsCurrentPage, setReportsCurrentPage] = useState(1);
	let reportsFirstPageIndex = (reportsCurrentPage - 1) * pageSize;
	let reportsLastPageIndex = reportsFirstPageIndex + pageSize;
	let currentReports = Reports.slice(reportsFirstPageIndex, reportsLastPageIndex);

	const [Resolved, setResolved] = useState([]);
	const [resolvedCurrentPage, setResolvedCurrentPage] = useState(1);
	let resolvedFirstPageIndex = (resolvedCurrentPage - 1) * pageSize;		 		
	let resolvedLastPageIndex = resolvedFirstPageIndex + pageSize;
	let currentResolved = Resolved.slice(resolvedFirstPageIndex, resolvedLastPageIndex);

	const [Pending, setPending] = useState([]);
	const [pendingCurrentPage, setPendingCurrentPage] = useState(1);
	let pendingFirstPageIndex = (pendingCurrentPage - 1) * pageSize;
	let pendingLastPageIndex = pendingFirstPageIndex + pageSize;
	let currentPending = Pending.slice(pendingFirstPageIndex, pendingLastPageIndex);

	const [selectedItem, setSelectedItem] = useState("No-Filter");
	const location = useLocation();
	const ResolvingReport = (report) => {
		report.isResolved = true;
		setResolved([...Resolved, report]);
		let filtered = Pending.filter(function (el) {
			return el._id !== report._id;
		});
		setPending(filtered);
		let newReports = Reports.map((oldReport) =>
			oldReport._id === report._id
				? { ...oldReport, isResolved: true }
				: oldReport
		);
		setReports(newReports);
	};
	const SeenReport = (report) => {
		let newReports = Reports.map((oldReport) =>
			oldReport._id === report._id ? { ...oldReport, isSeen: true } : oldReport
		);
		setReports(newReports);
		let newPendingReports = Pending.map((oldReport) =>
			oldReport._id === report._id ? { ...oldReport, isSeen: true } : oldReport
		);
		setPending(newPendingReports);
		let newResolvedReports = Resolved.map((oldReport) =>
			oldReport._id === report._id ? { ...oldReport, isSeen: true } : oldReport
		);
		setResolved(newResolvedReports);
	};
	const AddComment = (comment, report) => {
		let newReports = Reports.map((oldReport) =>
			oldReport._id === report._id
				? { ...oldReport, comments: [...report.comments, comment] }
				: oldReport
		);
		setReports(newReports);
		let newPendingReports = Pending.map((oldReport) =>
			oldReport._id === report._id
				? { ...oldReport, comments: [...report.comments, comment] }
				: oldReport
		);
		setPending(newPendingReports);
		let newResolvedReports = Resolved.map((oldReport) =>
			oldReport._id === report._id
				? { ...oldReport, comments: [...report.comments, comment] }
				: oldReport
		);
		setResolved(newResolvedReports);
	};
	useEffect(() => {
		setReports(location.state.reports);
		let resolved = location.state.reports.filter(
			(report) => report.isResolved === true
		);
		let pending = location.state.reports.filter(
			(report) => report.isResolved === false
		);
		setResolved(resolved);
		setPending(pending);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	useEffect(() => {
		if (selectedItem === "Seen") {
			let pending = location.state.reports.filter(
				(report) => report.isResolved === false
			);
			let allReports = location.state.reports;
			let seenAndPending = pending.filter((report) => report.isSeen === true);
			let allSeen = allReports.filter((report) => report.isSeen === true);
			setPending(seenAndPending);
			setReports(allSeen);
		} else if (selectedItem === "Unseen") {
			let pending = location.state.reports.filter(
				(report) => report.isResolved === false
			);
			let allReports = location.state.reports;
			let allUnseen = allReports.filter((report) => report.isSeen === false);
			let UnseenAndPending = pending.filter(
				(report) => report.isSeen === false
			);
			setPending(UnseenAndPending);
			setReports(allUnseen);
		} else if (selectedItem === "No-Filter") {
			let pending = location.state.reports.filter(
				(report) => report.isResolved === false
			);
			let allReports = location.state.reports;
			setPending(pending);
			setReports(allReports);
		}
	}, [selectedItem]);

	return (
		<>
			<Tabs
				id="controlled-tab-example"
				defaultActiveKey="All-Reports"
				className="d-flex justify-content-start reportTabs"
			>
				<Tab eventKey="All-Reports" title="All Reports">
					<DropdownButton id="dropdown-item-button" title={selectedItem}>
						<Dropdown.Item
							as="button"
							onClick={() => setSelectedItem("No-Filter")}
						>
							No Filter
						</Dropdown.Item>
						<Dropdown.Item
							className="ms-auto"
							as="button"
							onClick={() => setSelectedItem("Seen")}
						>
							Seen
						</Dropdown.Item>
						<Dropdown.Item
							as="button"
							onClick={() => setSelectedItem("Unseen")}
						>
							Unseen
						</Dropdown.Item>
					</DropdownButton>
					<Container className="my-2 d-flex flex-wrap">
						{currentReports.map((report, i) => (
							<Col sm={3} className="mb-2 me-2">
								<ReportCard
									report={report}
									resolvingReport={ResolvingReport}
									seenReport={SeenReport}
									AddComment={AddComment}
								/>
							</Col>
						))}
						<Pagination
							className="pagination-bar"
							currentPage={reportsCurrentPage}
							totalCount={Reports.length}
							pageSize={pageSize}
							onPageChange={(page) => setReportsCurrentPage(page)}
						/>
					</Container>
				</Tab>
				<Tab eventKey="Resolved" title="Resolved">
					<Container className="my-2 d-flex flex-wrap">
						{currentResolved.map((report, i) => (
							<Col sm={3} className="mb-2 me-2">
								<ReportCard
									report={report}
									seenReport={SeenReport}
									AddComment={AddComment}
								/>
							</Col>
						))}
						<Pagination
							className="pagination-bar"
							currentPage={resolvedCurrentPage}
							totalCount={Resolved.length}
							pageSize={pageSize}
							onPageChange={(page) => setResolvedCurrentPage(page)}
						/>
					</Container>
				</Tab>
				<Tab eventKey="Pending" title="Pending">
					<DropdownButton id="dropdown-item-button" title={selectedItem}>
						<Dropdown.Item
							as="button"
							onClick={() => setSelectedItem("No-Filter")}
						>
							No Filter
						</Dropdown.Item>
						<Dropdown.Item
							className="ms-auto"
							as="button"
							onClick={() => setSelectedItem("Seen")}
						>
							Seen
						</Dropdown.Item>
						<Dropdown.Item
							as="button"
							onClick={() => setSelectedItem("Unseen")}
						>
							Unseen
						</Dropdown.Item>
					</DropdownButton>
					<Container className="my-2 d-flex flex-wrap">
						{currentPending.map((report, i) => (
							<Col sm={3} className="mb-2 me-2">
								<ReportCard
									report={report}
									resolvingReport={ResolvingReport}
									seenReport={SeenReport}
									AddComment={AddComment}
								/>
							</Col>
						))}
						<Pagination
							className="pagination-bar"
							currentPage={pendingCurrentPage}
							totalCount={Pending.length}
							pageSize={pageSize}
							onPageChange={(page) => setPendingCurrentPage(page)}
						/>
					</Container>
				</Tab>
			</Tabs>
			<Button onClick={() => navigate("/admin/viewReports")}>Go back</Button>
		</>
	);
}

export default ViewCourseReports;
