"use client";

import { StatCard } from "@/components/cards/StatCard";
import { TeamDirectoryTable } from "@/components/tables/TeamDirectoryTable";
import { AnalyticsPanel } from "@/components/AnalyticsPanel";
import teams from "@/public/images/teams.png";
import pending from "@/public/images/pending.png";
import active from "@/public/images/active.png";
import total from "@/public/images/total.png";
import { RoleCard } from "@/components/cards/RoleCard";
import adminAccess from "@/public/images/admin-access.png";
import managerAccess from "@/public/images/manager-access.png";
import employeeAccess from "@/public/images/employee-access.png";
import clientAccess from "@/public/images/client.png";
import { useQuery } from "@tanstack/react-query";
import { getPeopleStats, getRoles } from "@/lib/actions/people.actions";
import Link from "next/link";
import InviteModal, { InviteModalRef } from "@/components/modals/InviteModal";
import { useRef } from "react";

// components/skeletons/StatCardSkeleton.tsx
const StatCardSkeleton = () => (
  <div className="space-y-2 rounded-lg border bg-white p-4 shadow-sm">
    <div className="h-6 w-6 rounded-full bg-gray-200" />
    <div className="h-4 w-1/2 rounded bg-gray-200" />
    <div className="h-6 w-1/3 rounded bg-gray-300" />
  </div>
);

// components/skeletons/RoleCardSkeleton.tsx
const RoleCardSkeleton = () => (
  <div className="flex items-center gap-3 rounded-lg border bg-white p-4 shadow-sm">
    <div className="h-12 w-12 rounded-full bg-gray-200" />
    <div className="space-y-2">
      <div className="h-4 w-24 rounded bg-gray-200" />
      <div className="h-3 w-20 rounded bg-gray-300" />
    </div>
    <div className="ml-auto h-6 w-6 rounded-full bg-gray-200" />
  </div>
);

const People = () => {
  const inviteModalRef = useRef<InviteModalRef>(null);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["peopleStats"],
    queryFn: getPeopleStats,
    staleTime: 5 * 60 * 1000,
  });

  const { data: userRoles, isLoading: rolesLoading } = useQuery({
    queryKey: ["userRoles"],
    queryFn: getRoles,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="space-y-4 px-4 py-2">
      {/* Header Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              icon={total}
              title="Total Users"
              value={stats?.totalUsers || 0}
            />
            <StatCard
              icon={active}
              title="Active Users"
              value={stats?.activeUsers || 0}
            />
            <StatCard
              icon={pending}
              title="Pending Invites"
              value={stats?.pendingInvites || 0}
            />
            <StatCard icon={teams} title="Teams" value={stats?.teams || 0} />
          </>
        )}
      </div>

      {/* Team Section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="col-span-1 rounded-lg border bg-white p-4">
          <h3 className="mb-2 text-lg font-semibold">User Roles</h3>
          <div className="space-y-3">
            {rolesLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <RoleCardSkeleton key={i} />
              ))
            ) : (
              <>
                <RoleCard
                  icon={adminAccess}
                  title="Admin"
                  subTitle="Full System access"
                  users={userRoles?.admin || 0}
                />
                <RoleCard
                  icon={managerAccess}
                  title="Manager"
                  subTitle="Team management"
                  users={userRoles?.team || 0}
                />
                <RoleCard
                  icon={employeeAccess}
                  title="Employee"
                  subTitle="Standard access"
                  users={userRoles?.agent || 0}
                />
                <RoleCard
                  icon={clientAccess}
                  title="Client"
                  subTitle="Limited access"
                  users={userRoles?.user || 0}
                />
              </>
            )}
          </div>
        </div>
        <div className="col-span-1 lg:col-span-2">
          <TeamDirectoryTable />
        </div>
      </div>

      {/* Analytics */}
      <div className="rounded-sm bg-white p-4">
        <h2 className="mb-2 text-lg font-semibold">Performance Analytics</h2>
        <AnalyticsPanel />
      </div>

      {/* Footer CTA */}
      {/* <div className="flex justify-between rounded-sm bg-white p-4">
        <p
          className="mb-5 cursor-pointer underline"
          onClick={() => inviteModalRef.current?.open()}
        >
          Invite New Users
        </p>
        <Link href="/admin/invite">
          <p className="mb-5 cursor-pointer text-sm text-[#4CAF50]">
            View all invites
          </p>
        </Link>
      </div> */}
      <InviteModal ref={inviteModalRef} />
    </div>
  );
};

export default People;
