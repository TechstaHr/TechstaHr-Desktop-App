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

import { sidebarLinks } from "@/constants";
import { ChevronDown, ChevronUp, LogOutIcon } from "lucide-react";
import { SidebarProps } from "@/types";
import { Button } from "./ui/button";
import { logOut } from "@/lib/auth";
import toast from "react-hot-toast";


export function AppSidebar() {
  const pathname = usePathname();
  const navigate = useRouter();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    {},
  );
  const [loggingOut, setLoggingOut] = useState(false);

  const toggleDropdown = (label: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

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
    <Sidebar>
      <SidebarContent className="border-none bg-white">
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
                                  className="h-auto w-auto object-contain"
                                />
                              ) : (
                                <Image
                                  src={item.imgURL}
                                  alt={item.label}
                                  width={20}
                                  height={20}
                                  className="object-contain"
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
                            onClick={() => toggleDropdown(item.label)}
                            className="text-gray-500 hover:text-gray-700"
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
                                "ml-9 mt-2 block rounded-md px-2 py-1 text-sm text-[#A1A1A1] hover:text-[#4CAF50]",
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
