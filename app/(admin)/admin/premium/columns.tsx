"use client";

import { FeatureComparison } from "@/types";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<FeatureComparison>[] = [
  {
    accessorKey: "features",
    header: "Features",
  },
  {
    accessorKey: "free",
    header: () => <div className="text-center">Free</div>,
    cell: (info) => <div className="text-center">{info.row.original.free}</div>,
  },
  {
    accessorKey: "basic",
    header: () => <div className="text-center">Basic</div>,
    cell: (info) => <div className="text-center">{info.row.original.basic}</div>,
  },
  {
    accessorKey: "premium",
    header: () => <div className="text-center">Premium</div>,
    cell: (info) => <div className="text-center">{info.row.original.premium}</div>,
  },
];

