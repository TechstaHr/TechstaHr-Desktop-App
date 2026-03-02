"use client";

import React from "react";
import Calendar from "@/public/icons/calendar-soon.svg";
import Edit from "@/public/icons/edit.svg";
import Tick from "@/public/icons/tick.svg";
import Update from "@/public/icons/update.svg";
import Image, { StaticImageData } from "next/image";
import ProjectTable from "../ProjectTable";
import { useQuery } from "@tanstack/react-query";
import { getProjectStats } from "@/lib/actions/project.actions";
import { cn } from "@/lib/utils";

interface SummaryProps {
  icon: StaticImageData;
  title: string;
  subtitle: string;
  isLoading?: boolean;
  isError?: boolean;
}

const SummaryBox = ({
  icon,
  title,
  subtitle,
  isLoading,
  isError,
}: SummaryProps) => {
  if (isError) {
    return (
      <div className="flex w-full items-center justify-center rounded-sm border border-red-300 bg-red-50 p-4 text-sm text-red-700">
        Failed to load stats
      </div>
    );
  }

  return (
    <div className="flex w-full items-center gap-3 rounded-sm border border-[#AAAAAA38] p-3">
      <div className="flex h-[35px] w-[35px] items-center justify-center rounded bg-[#DDDDDD] bg-opacity-30 md:h-[48px] md:w-[48px]">
        {isLoading ? (
          <div className="h-4 w-4 animate-pulse rounded bg-gray-300" />
        ) : (
          <Image src={icon} alt="summary icon" />
        )}
      </div>
      <div>
        <p
          className={cn(
            "font-medium text-[#333333]",
            isLoading && "h-4 w-24 animate-pulse rounded bg-gray-300",
          )}
        >
          {!isLoading && title}
        </p>
        <p
          className={cn(
            "text-sm text-[#AAAAAA]",
            isLoading && "mt-1 h-3 w-16 animate-pulse rounded bg-gray-200",
          )}
        >
          {!isLoading && subtitle}
        </p>
      </div>
    </div>
  );
};

const SummaryComp = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["project-stats"],
    queryFn: getProjectStats,
    staleTime: 5 * 60 * 1000,
  });

  const summaryOptions = [
    {
      icon: Tick,
      title: `${data?.completed ?? 0} Completed`,
      subtitle: "in the last 7 days",
    },
    {
      icon: Update,
      title: `${data?.updated ?? 0} Updated`,
      subtitle: "in the last 7 days",
    },
    {
      icon: Edit,
      title: `${data?.created ?? 0} Created`,
      subtitle: "in the last 7 days",
    },
    {
      icon: Calendar,
      title: `${data?.dueSoon ?? 0} Due Soon`,
      subtitle: "in the last 7 days",
    },
  ];

  return (
    <div className="p-4">
      <div className="flex flex-col gap-3 lg:flex-row">
        {isLoading &&
          Array.from({ length: 4 }).map((_, index) => (
            <SummaryBox
              key={index}
              icon={Tick}
              title=""
              subtitle=""
              isLoading
            />
          ))}

        {!isLoading &&
          !isError &&
          summaryOptions.map((item, index) => (
            <SummaryBox key={index} {...item} />
          ))}

        {isError &&
          Array.from({ length: 4 }).map((_, index) => (
            <SummaryBox key={index} icon={Tick} title="" subtitle="" isError />
          ))}
      </div>

      <ProjectTable />
    </div>
  );
};

export default SummaryComp;
