import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import profilePic from "../assets/profile.jpeg";
import { LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { handleAcessToken } from "@/fetch/fetchWrapper";
import ApiError from "@/fetch/ApiError";
import { useNavigate } from "react-router";
import { useCallback } from "react";

async function getUserInfo(acessToken: string) {
  try {
    const userInfo = await fetch("http://localhost:3000/user/getCurrentUser", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${acessToken}`,
      },
    });
    const userInfoRes = await userInfo.json();
    return userInfoRes;
  } catch (error: ApiError) {
    throw new ApiError(
      error.message || "Failed to fetch user info",
      error.code || "API_ERROR"
    );
  }
}

async function handleLogOut(token: string) {
  try {
    const res = await fetch("http://localhost:3000/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const response = await res.json();
    console.log("$$$$$$$$", response);

    return response;
  } catch (error: ApiError) {
    throw new ApiError(
      error.message || "Failed to LogOut user",
      error.code || "API_ERROR"
    );
  }
}

export default function UserAccount() {
  const [userName, setUserName] = useState<string>("");
  const [email, setemail] = useState<string>("");

  useEffect(() => {
    async function fetchUserData() {
      const userData: { name: string; email: string } = await handleAcessToken(
        getUserInfo
      );

      if (userData) {
        setUserName(userData.name);
        setemail(userData.email);
      }
    }

    fetchUserData();
  }, []);

  const navigate = useNavigate();

  const onLogOut = useCallback(async () => {
    await handleAcessToken(handleLogOut);

    navigate("/log-in");
  }, [navigate]);

  return (
    <div className="flex justify-between items-center rounded-md p-2 ">
      <div className="flex items-center gap-3">
        <Avatar className="rounded-md w-10 h-10 p-0 m-0">
          <AvatarImage src={profilePic} alt={userName} />
          <AvatarFallback>KK</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-bold">{userName}</p>
          <p className="text-sm">{email}</p>
        </div>
      </div>
      <LogOut
        size={24}
        className="cursor-pointer hover:bg-accent"
        onClick={onLogOut}
      />
    </div>
  );
}
