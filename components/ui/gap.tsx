import { cn } from "@/lib/utils";

export default function Gap({className} : Readonly<{className?: string}>) {
  return (
    <div className={cn("h-4 w-full", className)} />
  )
}
