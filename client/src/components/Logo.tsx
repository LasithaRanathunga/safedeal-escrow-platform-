import React from "react";

import logoImg from "../assets/d2cffbb4-5fb2-4ff3-84d1-7034c6d0aac2_removalai_preview.png";

type logoProps = { size?: "xs" | "sm" | "md" | "lg" };

const getSize = function (size: string) {
  switch (size) {
    case "xs":
      return "w-40";
    case "sm":
      return "w-56";
    case "md":
      return "w-80";
    case "lg":
      return "w-96";
  }
};

export default function Logo({ size = "sm" }: logoProps) {
  return (
    <div className={`${getSize(size)}`}>
      <img src={logoImg} alt="Logo" />
    </div>
  );
}
