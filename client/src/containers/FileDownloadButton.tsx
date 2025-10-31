import { Button } from "@/components/ui/button";
import { handleAcessToken } from "@/fetch/fetchWrapper";
import ApiError from "@/fetch/ApiError";
import { useParams } from "react-router";

export default function FileDownloadButton({
  type,
  itemId,
}: {
  type: "preview" | "final";
  itemId: string;
}) {
  const { contractId } = useParams();

  const handleDownload = async function (token: string) {
    try {
      const res = await fetch(
        `http://localhost:3000/file/download?contractId=${contractId}&itemId=${itemId}&type=${type}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res;
    } catch (error: ApiError) {
      throw new ApiError(error.messege, error.code || "UPLOAD_FAILED");
    }
  };

  const onDownloadClick = async function () {
    const response = await handleAcessToken(handleDownload);

    if (response && !response.ok) throw new Error("Failed to download file");

    const blobFile = await response.blob();

    // Create a temporary link
    const url = window.URL.createObjectURL(blobFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-files.zip"; // or any custom name
    document.body.appendChild(a);
    a.click();

    // Cleanup
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return <Button onClick={onDownloadClick} className="hover:cursor-pointer" />;
}
