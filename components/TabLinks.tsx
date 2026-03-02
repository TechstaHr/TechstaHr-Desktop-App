"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { mainTabs } from "@/constants";
import SummaryComp from "./teamDashboard/SummaryComp";
import BoardComponent from "./teamDashboard/BoardComponent";
import CalendarComponent from "./teamDashboard/CalendarComponent";
import IssuesComponent from "./teamDashboard/IssuesComponent";
import WidgetsComponent from "./teamDashboard/WidgetsComponent";

const TabLinks = () => {
  const [activeTab, setActiveTab] = useState("Summary");
  const [visibleCount, setVisibleCount] = useState(mainTabs.length);
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const setTabRef = (index: number) => (el: HTMLButtonElement | null) => {
    tabRefs.current[index] = el;
  };

  useEffect(() => {
    const updateVisibleTabs = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      let totalWidth = 0;
      let count = 0;

      for (let i = 0; i < mainTabs.length; i++) {
        const tabEl = tabRefs.current[i];
        if (!tabEl) continue;

        totalWidth += tabEl.offsetWidth;

        if (totalWidth < containerWidth - 80) {
          count++;
        } else {
          break;
        }
      }

      setVisibleCount((prev) => (prev !== count ? count : prev));
    };

    const timeout = setTimeout(updateVisibleTabs, 50);
    const observer = new ResizeObserver(updateVisibleTabs);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, []);

  const visibleTabs = mainTabs.slice(0, visibleCount);
  const overflowTabs = mainTabs.slice(visibleCount);

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full shadow-none"
    >
      <TabsList
        ref={containerRef}
        className="relative flex w-full flex-wrap items-center rounded-none bg-transparent md:px-4 py-0"
      >
        {/* Gray border */}
        <div className="absolute bottom-2 md:bottom-1 left-0 z-0 h-px w-full bg-gray-200" />

        <div className="z-0 flex md:justify-between md:w-full gap-2">
          {visibleTabs.map((tab, index) => {
            const isActive = activeTab === tab.name;
            const icon = isActive && tab.activeIcon ? tab.activeIcon : tab.icon;

            return (
              <TabsTrigger
                key={tab.name}
                ref={setTabRef(index)}
                value={tab.name}
                className="relative flex items-end gap-2 rounded-none border-b-2 border-transparent text-xs data-[state=active]:border-b-[#4CAF50] data-[state=active]:text-[#4CAF50]"
              >
                <Image
                  src={icon}
                  alt={`${tab.name} icon`}
                  width={16}
                  height={16}
                />
                {tab.name}
                {activeTab === tab.name && (
                  <div className="absolute -bottom-[6px] -right-2 z-10 h-[10px] w-[10px] -translate-x-1/2 rotate-45 bg-[#4CAF50]" />
                )}
              </TabsTrigger>
            );
          })}

          {overflowTabs.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="z-10 ml-2 flex items-center text-xs text-gray-600 hover:text-black">
                  More <ChevronDown size={16} className="ml-0.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {overflowTabs.map((tab) => (
                  <DropdownMenuItem
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className="flex items-center gap-2"
                  >
                    <Image
                      src={tab.icon}
                      alt={`${tab.name} icon`}
                      width={16}
                      height={16}
                    />
                    {tab.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </TabsList>

      <TabsContent value="Summary">
        <SummaryComp />
      </TabsContent>
      <TabsContent value="Board">
        <BoardComponent />
      </TabsContent>
      <TabsContent value="Calendar">
        <CalendarComponent />
      </TabsContent>
      <TabsContent value="Issues">
        <IssuesComponent />
      </TabsContent>
      <TabsContent value="Live Timer Widget">
        <WidgetsComponent />
      </TabsContent>
    </Tabs>
  );
};

export default TabLinks;
