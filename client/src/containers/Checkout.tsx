import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Checkout({
  item,
  contractId,
}: {
  item: any;
  contractId: string;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async function (e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `http://localhost:5173/payment-complete?milestoneId=${item.id}&contractId=${contractId}`,
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message);
    } else {
      setMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: {
      type: "tabs",
    },
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" />
      <Button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        type={"submit"}
        variant={"default"}
        className="mt-6"
      >
        {`Pay $${item.amount}`}
      </Button>
    </form>
  );
}
