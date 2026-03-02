import { Check } from "lucide-react";
import Image, { StaticImageData } from "next/image";

interface AccessCardProps {
  title: string;
  icon: StaticImageData;
  permissions: string[];
}

export const AccessCard = ({ title, icon, permissions }: AccessCardProps) => (
  <div className="flex flex-col gap-2 rounded-xl border p-4 shadow-sm">
    <div className="flex items-center justify-between gap-2 text-lg font-medium">
      {title}
      <Image src={icon} alt="icons" />
    </div>
    <ul className="space-y-1 text-sm text-muted-foreground">
      {permissions.map((perm, i) => (
        <li key={i} className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500" /> {perm}
        </li>
      ))}
    </ul>
  </div>
);
