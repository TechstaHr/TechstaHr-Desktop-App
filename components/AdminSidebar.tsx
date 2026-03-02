"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";


import { adminSidebarLinks } from "@/constants";
import { ChevronDown, ChevronUp, LogOutIcon } from "lucide-react";
import { Button } from "./ui/button";
import { ProjectProps, SidebarProps } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { getAllProjects } from "@/lib/actions/project.actions";
import { clearClientState, logOut } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function AdminSidebar() {
  const pathname = usePathname();
  const navigate = useRouter();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    {},
  );
  const [loggingOut, setLoggingOut] = useState(false);
  const queryClient = useQueryClient();

  const { data: projects, isLoading: loadingProjects } = useQuery<
    ProjectProps[]
  >({
    queryKey: ["all-projects"],
    queryFn: getAllProjects,
    staleTime: 5 * 60 * 1000,
  });

  const toggleDropdown = (label: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const sidebarLinks = adminSidebarLinks.map((item) => {
    if (item.label === "Project Management" && projects?.length) {
      return {
        ...item,
        subRoutes: projects.map((proj) => ({
          label: proj.name,
          route: `/admin/project-management/details`,
          onClick: () => {
            localStorage.setItem('currentProjectId', proj._id);
          },
        })),
      };
    }
    return item;
  });

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
    <Sidebar>
      <SidebarContent className="hide-scrollbar overflow-y-auto border-none bg-white">
        <SidebarGroup>
          <SidebarGroupLabel></SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="mt-16">
              {sidebarLinks.map((item: SidebarProps) => {
                const isActive =
                  pathname === item.route ||
                  pathname.startsWith(`${item.route}/`);
                const hasSubRoutes = item.subRoutes?.length;
                const isExpanded = expandedMenus[item.label];

                return (
                  <SidebarMenuItem key={item.label} className="my-2">
                    <div className="flex w-full flex-col">
                      {/* Top link and chevron */}
                      <div className="flex w-full items-center justify-between gap-2">
                        <SidebarMenuButton asChild>
                          <Link
                            href={item.route}
                            className={cn("flex flex-1 items-center gap-4", {
                              "text-[#4CAF50]": isActive,
                            })}
                          >
                            <div className="size-5 min-w-[20px]">
                              {isActive ? (
                                <Image
                                  src={item.activeImgURL}
                                  alt={item.label}
                                  width={20}
                                  height={20}
                                  className="object-contain w-auto h-auto"
                                />
                              ) : (
                                <Image
                                  src={item.imgURL}
                                  alt={item.label}
                                  width={20}
                                  height={20}
                                  className="object-contain w-auto h-auto"
                                />
                              )}
                            </div>

                            <span
                              className={cn("truncate text-[#A1A1A1]", {
                                "!text-[#4CAF50]": isActive,
                              })}
                            >
                              {item.label}
                            </span>
                          </Link>
                        </SidebarMenuButton>

                        {hasSubRoutes && (
                          <button
                            onClick={() =>
                              !loadingProjects && toggleDropdown(item.label)
                            }
                            className="text-gray-500 hover:text-gray-700"
                            disabled={loadingProjects}
                          >
                            {isExpanded ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Sub-menu dropdown */}
                      {isExpanded &&
                        item.subRoutes?.map((sub) => {
                          const isSubActive = pathname === sub.route;
                          return (
                            <Link
                              key={sub.route}
                              href={sub.route}
                              className={cn(
                                "ml-9 mt-1 block rounded-md px-2 py-1 text-sm text-[#A1A1A1] hover:text-[#4CAF50]",
                                {
                                  "!text-[#4CAF50]": isSubActive,
                                },
                              )}
                            >
                              {sub.label}
                            </Link>
                          );
                        })}
                    </div>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarFooter>
          <Button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-fit items-center justify-start bg-white text-[#FF0000] shadow-none"
          >
            <LogOutIcon stroke="#FF0000" className="mr-1" />
            {loggingOut ? "Logging out..." : "Logout"}
          </Button>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
