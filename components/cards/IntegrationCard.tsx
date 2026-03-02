import { Settings } from "lucide-react";
import Image, { StaticImageData } from "next/image";

interface IntegrationCardProps {
  icon: StaticImageData;
  name: string;
  description: string;
  status: "Connected" | "Disconnected";
}

export const IntegrationCard = ({
  icon,
  name,
  description,
  status,
}: IntegrationCardProps) => (
  <div className="flex items-end justify-between rounded-lg border bg-white p-5 shadow-sm">
    <div className="flex items-start gap-4">
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Image src={icon} alt="icons" />
          <h4 className="font-semibold">{name}</h4>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="mt-1 text-xs font-medium text-green-600">{status}</p>
      </div>
    </div>
    <button className="text-muted-foreground hover:text-primary">
      <Settings size={14} />
    </button>
  </div>
);
