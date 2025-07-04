import React from "react";

import Logo from "@/components/Logo";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      <h1 className="text-3xl font-bold underline">Home</h1>
      <Button>Hello</Button>
      <Logo />
    </>
  );
}
