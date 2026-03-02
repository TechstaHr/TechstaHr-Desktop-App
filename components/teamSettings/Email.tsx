import React from "react";
import google from "@/public/images/google.svg";
import caution from "@/public/icons/icon-caution.png";
import Image from "next/image";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useUserStore } from "@/store/userStore";

const Email = () => {
  const user = useUserStore((state) => state.user);

  return (
    <div className="space-y-12">
      <div>
        <p className="text-xl font-medium text-[#333333]">Security</p>
        <p className="text-[#AAAAAA]">
          Your current email address is{" "}
          <span className="font-medium text-black">
            {user?.email || "xxxxxx@gmail.com"}
          </span>
        </p>
      </div>

      <div className="space-y-8">
        <div className="space-y-3">
          <div className="flex items-center gap-1">
            <Image src={google} alt="google" />
            <p className="text-base text-[#71717A]">
              Log in with Google enabled
            </p>
          </div>
          <div className="flex items-start gap-5 rounded-sm bg-[#D59029] bg-opacity-20 p-4">
            <Image src={caution} alt="" />

            <div className="space-y-2">
              <p className="text-lg font-medium text-[#333333]">
                Connected account
              </p>
              <p className="text-sm text-[#71717A] md:w-[80%] md:text-base">
                Your account is connected to a Google account. Changing the
                email address here will disconnect your account from the Google
                account.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-base text-[#71717A]">New email address</p>
          <Input
            placeholder="Enter new email address"
            className="rounded-sm py-5 lg:w-1/2"
          />
          <Button className="my-4 rounded-sm bg-[#4CAF50] p-4 font-semibold text-white">
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Email;
