import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import Checkout from "./Checkout";
import { handleAcessToken } from "@/fetch/fetchWrapper";
import { useEffect, useState } from "react";
import ApiError from "@/fetch/ApiError";
import { useParams } from "react-router";

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

export default function Payment({ item }: { item: any }) {
  if (stripePublicKey === undefined) {
    throw new Error("STRIPE_PUBLIC_KEY is not defined");
  }

  const [clientSecret, setClientSecret] = useState("");
  const { contractId } = useParams();

  const createPayment = async function (item: any, token: string) {
    try {
      const response = await fetch(
        "http://localhost:3000/payment/create-payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ contractId, milestoneId: item.id }),
        }
      );

      const res = await response.json();

      return res;
    } catch (error) {
      throw new ApiError(
        error.message || "Failed to make the payment",
        error.code || "API_ERROR"
      );
    }
  };

  useEffect(() => {
    const payment = async function () {
      const responce = await handleAcessToken(createPayment.bind(null, item));

      setClientSecret(responce.clientSecret);
    };

    payment();
  }, [item]);

  const stripePromise = loadStripe(stripePublicKey);

  const appearance = {
    theme: "stripe",
  };
  // Enable the skeleton loader UI for optimal loading.
  const loader = "auto";

  return (
    <>
      {clientSecret && (
        <div className="overflow-auto max-h-[80vh]">
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              loader,
            }}
          >
            <Checkout item={item} contractId={contractId} />
          </Elements>
        </div>
      )}
    </>
  );
}
