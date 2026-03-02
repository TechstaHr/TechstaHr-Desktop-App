"use client";

import React, { useEffect, useRef, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { settingsTabs } from "@/constants";
import Profile from "./teamSettings/Profile";
import Email from "./teamSettings/Email";
import Security from "./teamSettings/Security";
import AccountPreferences from "./teamSettings/AccountPreferences";
import ConnectedApps from "./teamSettings/ConnectedApps";

const SettingsTabs = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [activeTab, setActiveTab] = useState("Profile");
  const [visibleCount, setVisibleCount] = useState(settingsTabs.length);

  // Utility to assign refs
  const setTabRef = (index: number) => (el: HTMLButtonElement | null) => {
    tabRefs.current[index] = el;
  };

  useEffect(() => {
    const updateVisibleTabs = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      let totalWidth = 0;
      let count = 0;

      for (let i = 0; i < settingsTabs.length; i++) {
        const tabEl = tabRefs.current[i];
        if (!tabEl) continue;

        totalWidth += tabEl.offsetWidth;

        // Reserve 100px for "More" dropdown space
        if (totalWidth < containerWidth - 100) {
          count++;
        } else {
          break;
        }
      }

      // Update only if changed
      setVisibleCount((prev) => (prev !== count ? count : prev));
    };

    // Delay to allow DOM refs to populate
    const timeout = setTimeout(updateVisibleTabs, 50);

    const observer = new ResizeObserver(updateVisibleTabs);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, []);

  const visibleTabs = settingsTabs.slice(0, visibleCount);
  const overflowTabs = settingsTabs.slice(visibleCount);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList
        ref={containerRef}
        className="relative flex w-full flex-wrap justify-start rounded-none bg-transparent px-4 py-0"
      >
        {/* Bottom gray border */}
        <div className="absolute bottom-0 left-0 h-px w-full bg-gray-200" />

        <div className="z-0 flex gap-2">
          {visibleTabs.map((tab, index) => (
            <TabsTrigger
              key={tab.name}
              ref={setTabRef(index)}
              value={tab.name}
              className="relative flex h-full items-end gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-b-[#4CAF50] data-[state=active]:text-[#4CAF50]"
            >
              {tab.name}
              {activeTab === tab.name && (
                <div className="absolute -bottom-[6px] -right-2 z-10 h-[10px] w-[10px] -translate-x-1/2 rotate-45 bg-[#4CAF50]" />
              )}
            </TabsTrigger>
          ))}
        </div>

        {/* More dropdown */}
        {overflowTabs.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="z-10 ml-2 flex items-center text-sm text-gray-600 hover:text-black">
                More <ChevronDown size={16} className="ml-1" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {overflowTabs.map((tab) => (
                <DropdownMenuItem
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                >
                  {tab.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </TabsList>

      <TabsContent value="Profile" className="px-5 py-8">
        <Profile />
      </TabsContent>
      <TabsContent value="Email" className="px-5 py-8">
        <Email />
      </TabsContent>
      <TabsContent value="Security" className="px-5 py-8">
        <Security />
      </TabsContent>
      <TabsContent value="Account preferences" className="px-5 py-8">
        <AccountPreferences />
      </TabsContent>
      {/* <TabsContent value="Connected apps" className="px-5 py-8">
        <ConnectedApps />
      </TabsContent> */}
    </Tabs>
  );
};

export default SettingsTabs;
