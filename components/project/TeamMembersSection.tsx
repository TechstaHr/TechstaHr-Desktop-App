import { Button } from "@/components/ui/button";
import UserCard from "@/components/cards/UserCard";
import { _user } from "@/types";

export const TeamMembersSection = ({
  title,
  users,
  selectedMembers,
  onSelect,
  buttonText,
  onButtonClick,
  disabled,
}: {
  title: string;
  users: _user[];
  selectedMembers: string[];
  onSelect: (userId: string) => void;
  buttonText: string;
  onButtonClick: () => void;
  disabled: boolean;
}) => (
  <div className="my-4 space-y-4 rounded-md bg-white p-4">
    <h2 className="mb-4 text-xl font-semibold">{title}</h2>
    <div className="flex flex-wrap items-center justify-start gap-4">
      {users?.length > 0 ? (
        users.map((user) => (
          <UserCard
            key={user._id}
            avatar={user?.avatar || "/images/default-avatar.png"}
            name={user.full_name || user.email}
            selected={selectedMembers.includes(user._id)}
            onSelect={() => onSelect(user._id)}
          />
        ))
      ) : (
        <p className="italic text-gray-500">No users found.</p>
      )}
    </div>
    <Button
      className="bg-[#4CAF50] text-white"
      disabled={disabled}
      onClick={onButtonClick}
    >
      {buttonText}
    </Button>
  </div>
);
