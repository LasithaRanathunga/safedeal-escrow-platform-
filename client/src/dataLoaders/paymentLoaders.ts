import { type LoaderFunctionArgs } from "react-router";
import { handleAcessToken } from "@/fetch/fetchWrapper";
import ApiError from "@/fetch/ApiError";
import { redirect } from "react-router";

export async function finishPayment({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const contractId = url.searchParams.get("contractId");
  const milestoneId = url.searchParams.get("milestoneId");

  console.log("#####complete##########", contractId, milestoneId);

  const updateMilestone = async function (token: string) {
    try {
      await fetch("http://localhost:3000/payment/complete-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contractId, milestoneId }),
      });
    } catch (error) {
      throw new ApiError(
        error.message || "Failed to update milestone",
        error.code || "API_ERROR"
      );
    }
  };

  await handleAcessToken(updateMilestone);

  return redirect(`/dashboard/contracts/${contractId}`);
}
