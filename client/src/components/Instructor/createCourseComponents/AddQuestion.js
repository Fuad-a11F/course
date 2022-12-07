import { useRef, useState } from "react";
import { Form, Row, Col, Button, InputGroup, Card, Popover, OverlayTrigger } from "react-bootstrap";
import "../../../css/createCourse.css";
import { useDispatch } from "react-redux";
import { setTitle, addQuestions } from "../../../redux/exerciseSlice";
function AddQuestion(props) {
	const dispatch = useDispatch();
	const Question = useRef();
	const FirstChoice = useRef();
	const SecondChoice = useRef();
	const ThirdChoice = useRef();
	const FourthChoice = useRef();
	const [Choices, setChoices] = useState(["", "", "", ""]);
	const [CorrectAnswer, setCorrectAnswer] = useState("default");

	const [MissingCorrectAnswer, setMissingCorrectAnswer] = useState(false);

	const handleAddQuestion = (e) => {
		if (
			(CorrectAnswer !== FirstChoice.current.value) &
			(CorrectAnswer !== SecondChoice.current.value) &
			(CorrectAnswer !== ThirdChoice.current.value) &
			(CorrectAnswer !== FourthChoice.current.value) &
			(CorrectAnswer !== "default")
		) {
			setMissingCorrectAnswer(true);
			setCorrectAnswer("default");
			return;
		}
		if (CorrectAnswer === "default") {
			setMissingCorrectAnswer(true);
			return;
		} else setMissingCorrectAnswer(false);
		let newQuestion = {
			question: Question.current.value,
			choices: Choices,
			correctAnswer: CorrectAnswer,
		};
		Question.current.value = "";
		FirstChoice.current.value = "";
		SecondChoice.current.value = "";
		ThirdChoice.current.value = "";
		FourthChoice.current.value = "";
		setChoices(["", "", "", ""]);
		setCorrectAnswer("default");
		dispatch(addQuestions(newQuestion));
		props.setQuestions((questions) => [...questions, newQuestion]);
	};
	const popover = (
		<Popover id="popover-basic" className="align-items-center">
			<Popover.Header as="h3">Can't add question!!!</Popover.Header>
			<Popover.Body className="error">Please choose a correct answer</Popover.Body>
		</Popover>
	);
	return (
		<>
			<Form.Group as={Row} className="my-3 d-flex align-items-center justify-content-start">
				<Form.Label column sm={2}>
					Question
				</Form.Label>
				<Col sm={7}>
					<Form.Control type="text" placeholder="Question" ref={Question} />
				</Col>
			</Form.Group>
			<InputGroup
				className="mb-3"
				onChange={() => {
					setChoices([
						FirstChoice.current.value,
						SecondChoice.current.value,
						ThirdChoice.current.value,
						FourthChoice.current.value,
					]);
				}}>
				<InputGroup.Text>Choices</InputGroup.Text>
				<Form.Control placeholder="First Answer" aria-label="First Answer" ref={FirstChoice} />
				<Form.Control placeholder="Second Answer" aria-label="Second Answer" ref={SecondChoice} />
				<Form.Control placeholder="Third Answer" aria-label="Third Answer" ref={ThirdChoice} />
				<Form.Control placeholder="Fourth Answer" aria-label="Fourth Answer" ref={FourthChoice} />
			</InputGroup>
			<Form.Group as={Row} className="mb-3 d-flex align-items-center justify-content-start">
				<Form.Label column sm={2}>
					Correct Answer
				</Form.Label>
				<Col sm={7}>
					<Form.Select
						value={CorrectAnswer}
						aria-label="Default select example"
						onChange={(e) => {
							setCorrectAnswer(e.target.value);
							setMissingCorrectAnswer(false);
						}}>
						<option value="default">Choose the correct answer</option>
						<option value={Choices[0]}>{Choices[0]}</option>
						<option value={Choices[1]}>{Choices[1]}</option>
						<option value={Choices[2]}>{Choices[2]}</option>
						<option value={Choices[3]}>{Choices[3]}</option>
					</Form.Select>
				</Col>
				<Col sm={3}>
					<OverlayTrigger
						trigger="click"
						placement="right"
						rootClose
						show={MissingCorrectAnswer}
						overlay={MissingCorrectAnswer ? popover : <></>}>
						<Button id="addSubject" onClick={(e) => handleAddQuestion(e)}>
							Add Question
						</Button>
					</OverlayTrigger>
				</Col>
			</Form.Group>
		</>
	);
}

export default AddQuestion;