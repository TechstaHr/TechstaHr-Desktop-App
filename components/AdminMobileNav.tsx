"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { adminSidebarLinks } from "@/constants";
import { MenuIcon, ChevronDown, ChevronUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ProjectProps, SidebarProps } from "@/types";
import { getAllProjects } from "@/lib/actions/project.actions";
import toast from "react-hot-toast";
import { clearClientState, logOut } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";


const AdminMobileNav = () => {
  const pathName = usePathname();
  const navigate = useRouter();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    {},
  );
  const [loggingOut, setLoggingOut] = useState(false);
  const queryClient = useQueryClient();

  const { data: projects } = useQuery<ProjectProps[]>({
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

  return (
    <section className="w-full max-w-[264px]">
      <Sheet>
        <SheetTrigger>
          <MenuIcon />
        </SheetTrigger>
        <SheetContent
          side={"left"}
          className="rounded-tr-2xl border-none bg-white"
        >
          <SheetHeader>
            <SheetTitle></SheetTitle>
            <SheetDescription></SheetDescription>
          </SheetHeader>

          <div className="pt-4">
            <nav className="flex flex-col gap-6 text-[#A1A1A1]">
              {sidebarLinks.map((item: SidebarProps) => {
                const isActive =
                  pathName === item.route ||
                  pathName.startsWith(`${item.route}/`);
                const hasSubRoutes = item.subRoutes?.length! > 0;
                const isExpanded = expandedMenus[item.label];

                return (
                  <div key={item.label} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <SheetClose asChild>
                        <Link
                          className={cn("flex items-center gap-4", {
                            "text-[#4CAF50]": isActive,
                          })}
                          href={item.route}
                        >
                          <div className="size-5 min-w-[20px]">
                            <Image
                              src={isActive ? item.activeImgURL : item.imgURL}
                              alt={item.label}
                              width={20}
                              height={20}
                              className="object-contain"
                            />
                          </div>
                          <span
                            className={cn("truncate text-[#A1A1A1]", {
                              "!text-[#4CAF50]": isActive,
                            })}
                          >
                            {item.label}
                          </span>
                        </Link>
                      </SheetClose>

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

                    {isExpanded &&
                      item.subRoutes?.map((sub) => {
                        const isSubActive = pathName === sub.route;
                        return (
                          <SheetClose asChild key={sub.route}>
                            <Link
                              href={sub.route}
                              className={cn(
                                "ml-7 block rounded-md py-1 text-sm text-[#A1A1A1] hover:text-[#4CAF50]",
                                {
                                  "!text-[#4CAF50]": isSubActive,
                                },
                              )}
                            >
                              {sub.label}
                            </Link>
                          </SheetClose>
                        );
                      })}
                  </div>
                );
              })}

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="mt-6 flex items-center gap-2 text-sm text-red-500 hover:underline"
              >
                <span>{loggingOut ? "Logging out..." : "Logout"}</span>
              </button>
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
};

export default AdminMobileNav;
