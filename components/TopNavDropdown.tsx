"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logOut } from "@/lib/auth";
import { Ellipsis, LogOutIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";


type AdminTopNavDropdownProps = {
  onOpenNotification: () => void;
};

export function DropdownMenuDemo({
  onOpenNotification,
}: AdminTopNavDropdownProps) {
  const navigate = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const res = await logOut();
      toast.success(res?.message || "Logout successful");

      // Clear both localStorage and cookies for complete session cleanup
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");


      navigate.push("/login");
    } catch (error: any) {
      toast.error(error?.message || "Logout failed");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex h-7 w-7 items-center justify-center rounded-sm border-[#4CAF50] bg-[#4CAF50] bg-opacity-10 lg:hidden"
        >
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/team/settings">
            <DropdownMenuItem>Profile</DropdownMenuItem>
          </Link>
          <DropdownMenuItem onClick={onOpenNotification}>
            Notifications
          </DropdownMenuItem>
          <Link href="/team/settings">
            <DropdownMenuItem>Settings</DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} disabled={loggingOut}>
          <LogOutIcon stroke="#FF0000" className="mr-1" />
          {loggingOut ? "Logging out..." : "Logout"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
