import { type LoaderFunctionArgs } from "react-router";
import { handleAcessToken } from "@/fetch/fetchWrapper";
import ApiError from "@/fetch/ApiError";
import { redirect } from "react-router";

export async function fetchContract({ params }: LoaderFunctionArgs) {
  //   const token = localStorage.getItem("accessToken") as string;

  async function getContractInfo(contractId: string, token: string) {
    console.log("Fetching contract with ID:", contractId);

    const response = await fetch(
      `http://localhost:3000/contract/getContract/${contractId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorBody = await response.json();

      if (errorBody.code === "NO_CONTRACT_FOUND") {
        return redirect("/dashboard/contracts");
      } else {
        throw new ApiError(
          errorBody.message || "Failed to fetch contract",
          errorBody.code || "API_ERROR"
        );
      }
    }

    const result = await response.json();

    console.log("Fetched contract data:", result);

    return result;
  }

  const contractData = await handleAcessToken(
    getContractInfo.bind(null, params.contractId as string)
  );
  console.log("Contract data fetched:", contractData);
  return contractData;
}
