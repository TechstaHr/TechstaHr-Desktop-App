import { Card, CardContent } from "@/components/ui/card";
import Image, { StaticImageData } from "next/image";

interface StatCardProps {
  icon: StaticImageData;
  title: string;
  value: string | number;
}

export const StatCard = ({ icon: Icon, title, value }: StatCardProps) => (
  <Card>
    <CardContent className="p-4 flex items-center justify-between gap-4">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
      <Image src={Icon} alt="icons" />
      {/* <Icon className="w-6 h-6 text-primary" /> */}
    </CardContent>
  </Card>
);
