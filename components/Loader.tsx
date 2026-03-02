import { Loader2 } from "lucide-react";
import React from "react";

const Loader = () => {
  return (
    <div className="absolute top-0 ovefflow-hidden z-10 flex h-screen w-screen items-center justify-center gap-2 bg-black bg-opacity-20">
      <p className="text-base text-black font-semibold">Loading</p>
      <Loader2 className="animate-spin" />
    </div>
  );
};

export default Loader;
