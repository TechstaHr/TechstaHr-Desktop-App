import Image, { StaticImageData } from "next/image";

interface ReportOptionCardProps {
  icon: StaticImageData;
  title: string;
  description: string;
  actionText: string;
}

export const ReportOptionCard = ({
  icon,
  title,
  description,
  actionText,
}: ReportOptionCardProps) => (
  <div className="rounded-lg border bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between">
      <div className="space-y-3">
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="mt-2 text-sm font-medium text-green-600">
          {actionText} →
        </p>
      </div>
      <Image src={icon} alt="icons" />
    </div>
  </div>
);
