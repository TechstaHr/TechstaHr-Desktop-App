import Image from "next/image";
import { Check } from "lucide-react";
import React from "react";

const UserCard = ({
  avatar,
  name,
  selected,
  onSelect,
}: {
  avatar: string;
  name: string;
  selected: boolean;
  onSelect: () => void;
}) => {
  return (
    <div
      onClick={onSelect}
      className={`relative flex w-fit cursor-pointer items-center gap-2 rounded-full p-2 shadow ${
        selected ? "border-2 border-green-500" : ""
      }`}
    >
      <Image
        src={avatar}
        alt="user pics"
        width={24}
        height={24}
        className="rounded-full object-contain"
      />
      <p className="text-sm font-medium">{name}</p>

      {selected && (
        <span className="absolute -right-1 -top-1 rounded-full bg-green-500 p-1 text-white">
          <Check size={12} />
        </span>
      )}
    </div>
  );
};

export default UserCard;
