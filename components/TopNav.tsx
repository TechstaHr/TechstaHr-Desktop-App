"use client";

import React, { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { BellIcon } from "lucide-react";
import { DropdownMenuDemo } from "./TopNavDropdown";
import Image from "next/image";
import diamond from "@/public/icons/diamond.svg";
import CreateModal, { CreateModalRef } from "./modals/CreateModal";
import { NotificationCard } from "./NotificationCard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllNotifications } from "@/lib/actions/notifications.actions";
import { useUserStore } from "@/store/userStore";
import { getUserProfile } from "@/lib/actions/user.actions";

const TopNav = () => {
  const modalRef = useRef<CreateModalRef>(null);
  const user = useUserStore((state) => state.user);
  const [open, setOpen] = useState(false);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: getAllNotifications,
    refetchOnWindowFocus: true,
    enabled: true,
  });

  useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfile,
    enabled: !user, // only refetch if user is null
  });

  if (!user) {
    return <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />;
  }

  return (
    <div className="relative flex items-center justify-center gap-4">
      <Button
        onClick={() => modalRef.current?.open()}
        className="h-6 w-fit rounded-sm bg-[#4CAF50] p-4 px-6 font-semibold text-white lg:h-9"
      >
        + Add Task
      </Button>
      <DropdownMenuDemo onOpenNotification={() => setOpen(true)} />
      <Button className="hidden h-9 w-fit items-center justify-center rounded-sm border border-[#4CAF50] bg-transparent p-4 px-4 font-semibold text-[#CECE00] lg:flex">
        <Image src={diamond} alt="diamond" /> Premium
      </Button>

      {/* Bell Icon + Toggle */}
      <div className="relative hidden lg:flex">
        <Button
          onClick={() => setOpen(true)}
          className="size-9 rounded-full bg-[#4CAF50] bg-opacity-10"
        >
          <BellIcon stroke="#71717A" />
          {notifications?.some((n) => !n.isRead) && (
            <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-500" />
          )}
        </Button>

        <NotificationCard
          open={open}
          onOpenChange={setOpen}
          notifications={notifications}
          isLoadingNotifications={isLoading}
        />
      </div>

      <Avatar className="hidden size-9 lg:flex">
        <AvatarImage src={user?.avatar} alt="@avatar" />
        <AvatarFallback className="uppercase">
          {user?.email.slice(0, 2)}
        </AvatarFallback>
      </Avatar>

      <CreateModal ref={modalRef} />
    </div>
  );
};

export default TopNav;
