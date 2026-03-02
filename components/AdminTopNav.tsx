"use client";

import React, { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { BellIcon, Plus } from "lucide-react";
import { NotificationCard } from "./NotificationCard"; // Import this
import Image from "next/image";
import usersIcon from "@/public/icons/invite.png";
import { useUserStore } from "@/store/userStore";
import { useQuery } from "@tanstack/react-query";
import { getAllNotifications } from "@/lib/actions/notifications.actions";
import ProjectModal, { ProjectModalRef } from "./modals/ProjectModal";
import InviteModal, { InviteModalRef } from "./modals/InviteModal";
import { AdminTopNavDropdown } from "./AdminTopNavDropdown";
import { getUserProfile } from "@/lib/actions/user.actions";

const AdminTopNav = () => {
  const modalRef = useRef<ProjectModalRef>(null);
  const inviteModalRef = useRef<InviteModalRef>(null);
  const user = useUserStore((state) => state.user);
  const [open, setOpen] = useState(false);

  useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfile,
    enabled: !user, // only refetch if user is null
  });

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: getAllNotifications,
    refetchOnWindowFocus: true,
    enabled: true,
  });

  return (
    <div className="relative flex items-center justify-center gap-4">
      <AdminTopNavDropdown
        onOpenNotification={() => setOpen(true)}
        onOpenInvite={() => inviteModalRef.current?.open()}
      />
      <Button
        variant={"outline"}
        onClick={() => inviteModalRef.current?.open()}
        className="hidden h-6 cursor-pointer items-center justify-center rounded-sm bg-transparent p-4 font-semibold lg:flex lg:h-9"
      >
        <Image src={usersIcon} alt="Users" />
        Invite
      </Button>

      <Button
        onClick={() => modalRef.current?.open()}
        className="h-6 w-fit rounded-sm bg-[#4CAF50] p-4 px-6 font-semibold text-white lg:h-9"
      >
        <Plus /> Create Project
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

      <ProjectModal ref={modalRef} />
      <InviteModal ref={inviteModalRef} />
    </div>
  );
};

export default AdminTopNav;
