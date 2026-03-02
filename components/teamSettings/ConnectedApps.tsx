import React from "react";
import appIcon from "@/public/icons/app-icons.svg";
import Image from "next/image";

const ConnectedApps = () => {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-xl font-medium text-[#333333]">Connected apps</p>
        <p className="text-[#AAAAAA]">
          Control which apps have access to your user data, see which apps your
          site administrator controls, and find further information about apps
          storing data outside of TechstaHR. Apps may appear on this page more
          than once depending on their implementation or how much access you&apos;ve
          granted to the app.
        </p>
      </div>
      <div className="space-y-3">
        <p className="text-xl font-medium text-[#333333]">
          App with access to your accounts
        </p>
        <p className="text-[#AAAAAA]">
          You&apos;ve given these apps permission to access information and to act on
          behalf of your accounts. If you do not want the app to have access,
          remove access for the app using the button below.
        </p>
        <div className="flex items-center gap-2 rounded-sm border p-2 py-1">
          <Image src={appIcon} alt="app icon" />
          <p className="text-[#71717A]">No apps have been added </p>
        </div>
      </div>
    </div>
  );
};

export default ConnectedApps;
