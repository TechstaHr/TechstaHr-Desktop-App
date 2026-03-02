"use client";

import { useRef } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProductivityLineChart from "./ProductivityLineChart";
import { getUserProductivity } from "@/lib/actions/productivity.actions";
import { useQuery } from "@tanstack/react-query";

type CardProps = React.ComponentProps<typeof Card>;

export function ProductivityCard({ className, ...props }: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["userProductivity"],
    queryFn: getUserProductivity,
  });

  const transformedData =
    data?.productivity &&
    Object.entries(data.productivity).map(([day, value]) => ({
      name: day.slice(0, 3),
      productivity: value,
    }));


  return (
    <Card
      ref={cardRef}
      className={cn("w-[380px] overflow-hidden lg:w-[720px]", className)}
      {...props}
    >
      <CardHeader className="w-full flex-row items-center justify-between p-4">
        <CardTitle>Productivity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center text-sm">Loading chart...</p>
        ) : isError ? (
          <p className="text-center text-sm text-red-500">
            Failed to load productivity data.
          </p>
        ) : (
          <ProductivityLineChart data={transformedData} />
        )}
      </CardContent>
    </Card>
  );
}
