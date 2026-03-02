import Image, { StaticImageData } from "next/image";

interface RoleCardProps {
  title: string;
  subTitle: string;
  icon: StaticImageData;
  users: string;
}

export const RoleCard = ({ title, icon, subTitle, users }: RoleCardProps) => (
  <div className="flex items-center justify-between gap-2 rounded-sm bg-[#F9FAFB] p-2 shadow-sm">
    <div className="flex items-center justify-between gap-2">
      <Image src={icon} alt="icons" />
      <div>
        <p className="text-lg font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{subTitle}</p>
      </div>
    </div>
    <p className="text-sm text-muted-foreground">{users} users</p>
  </div>
);
