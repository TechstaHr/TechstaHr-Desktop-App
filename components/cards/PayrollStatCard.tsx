import { Card, CardContent } from "@/components/ui/card";
import Image, { StaticImageData } from "next/image";

interface PayrollStatCardProps {
  icon: StaticImageData;
  title: string;
  value: string | number;
  subtitle: string;
}

export const PayrollStatCard = ({
  icon,
  title,
  value,
  subtitle,
}: PayrollStatCardProps) => (
  <Card>
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="mb-1 text-sm text-muted-foreground">{title}</h4>
          <p className="text-xl font-semibold">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <Image src={icon} alt="icons" />
      </div>
    </CardContent>
  </Card>
);
