import { PaymentElement } from "@stripe/react-stripe-js";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api";

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const params = useParams();
  const navigate = useNavigate();
	let courseId = params.id;
	const userID = useSelector((state) => state.userReducer.user._id);
  const wallet = useSelector((state) => state.userReducer.user.wallet);
  const [message, setMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsProcessing(true);
    
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: "/",
        redirect : 'if_required'
      },
    });
    const response = await API.post(`/trainees/${userID}/courses/${courseId}/payment`);
    navigate("/");
    
    // if (error.type === "card_error" || error.type === "validation_error") {
    //   setMessage(error.message);
    // } else {
    //   setMessage(error.message);
    // }

    


    setIsProcessing(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" />
      <button type="primary" disabled={isProcessing || !stripe || !elements} id="submit">
        <span id="button-text">
          {isProcessing ? "Processing ... " : "Pay now"}
        </span>
      </button>
      {/* Show any error or success messages */}
      {message && <div id="payment-message">{message}</div>}
    </form>
  );
}