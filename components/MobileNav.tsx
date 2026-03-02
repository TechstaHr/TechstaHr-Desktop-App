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
import { usePathname } from "next/navigation";
import { sidebarLinks } from "@/constants";
import { MenuIcon, ChevronDown, ChevronUp } from "lucide-react";
import { SidebarProps } from "@/types";

const MobileNav = () => {
  const pathName = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    {},
  );

  const toggleDropdown = (label: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <section className="w-full max-w-[264px]">
      <Sheet>
        <SheetTrigger>
          <MenuIcon />
        </SheetTrigger>
        <SheetContent
          side="left"
          className="rounded-tr-2xl border-none bg-white"
        >
          <SheetHeader>
            <SheetTitle />
            <SheetDescription />
          </SheetHeader>

          <nav className="flex flex-col gap-6 pt-16 text-[#A1A1A1]">
            {sidebarLinks.map((item: SidebarProps) => {
              const isActive =
                pathName === item.route ||
                pathName.startsWith(`${item.route}/`);
              const hasSubRoutes = item.subRoutes?.length;
              const isExpanded = expandedMenus[item.label];

              return (
                <div key={item.label} className="flex flex-col gap-1">
                  {/* Top-level item */}
                  <div className="flex w-full items-center justify-between">
                    <SheetClose asChild>
                      <Link
                        href={item.route}
                        className={cn("flex items-center gap-4", {
                          "text-[#4CAF50]": isActive,
                        })}
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

                  {/* Subroutes */}
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
          </nav>
        </SheetContent>
      </Sheet>
    </section>
  );
};

export default MobileNav;
