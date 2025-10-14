import { type LoaderFunctionArgs } from "react-router";
import { handleAcessToken } from "@/fetch/fetchWrapper";
import ApiError from "@/fetch/ApiError";

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
      throw new ApiError(
        errorBody.message || "Failed to create milestone",
        errorBody.code || "API_ERROR"
      );
    }

    const result = await response.json();

    return result;
  }

  const contractData = await handleAcessToken(
    getContractInfo.bind(null, params.contractId as string)
  );
  console.log("Contract data fetched:", contractData);
  return contractData;
}
