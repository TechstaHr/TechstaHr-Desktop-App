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
import { clearClientState, logOut } from "@/lib/auth";
import { Ellipsis, LogOutIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

import { useQueryClient } from "@tanstack/react-query";

type AdminTopNavDropdownProps = {
  onOpenNotification: () => void;
  onOpenInvite: () => void;
};

export function AdminTopNavDropdown({
  onOpenNotification,
  onOpenInvite,
}: AdminTopNavDropdownProps) {
  const navigate = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const res = await logOut();
      toast.success(res?.message || "Logout successful");

      try { queryClient.clear(); } catch { }
      clearClientState();
      try { localStorage.removeItem("currentProjectId"); } catch { }

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
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <Link href="/admin/billing-subscription">
            <DropdownMenuItem>Billing</DropdownMenuItem>
          </Link>
          <Link href="/admin/settings">
            <DropdownMenuItem>Settings</DropdownMenuItem>
          </Link>
          <DropdownMenuItem onClick={onOpenNotification}>
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onOpenInvite}>
            Invite users
          </DropdownMenuItem>
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
