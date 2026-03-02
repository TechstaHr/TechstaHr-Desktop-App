import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface IssueCardProps {
  title: string;
  category: string;
  status: string;
  priority: string;
  author: {
    email: string;
  };
  createdAt: Date;
  openModal: () => void;
}

const IssueCard = ({
  title,
  category,
  status,
  priority,
  author,
  createdAt,
  openModal,
}: IssueCardProps) => {
  return (
    <Card className="mb-4 rounded-sm border p-4 shadow-sm">
      <CardContent className="p-0">
        <div className="flex flex-row items-center justify-between">
          {/* Title and View Details */}
          <div className="space-y-3">
            <h2 className="text-base font-medium text-[#333C33]">{title}</h2>
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="default" className="bg-red-100 text-red-600">
                {category}
              </Badge>
              <Badge
                variant="default"
                className={`${
                  status.toLowerCase() === "open"
                    ? "bg-blue-100 capitalize text-blue-600"
                    : status.toLowerCase() === "in progress"
                      ? "bg-yellow-100 capitalize text-yellow-600"
                      : "bg-purple-100 capitalize text-purple-600"
                }`}
              >
                {status}
              </Badge>
              <Badge
                variant="default"
                className={`${
                  priority.toLowerCase() === "high"
                    ? "bg-red-200 text-red-700"
                    : priority.toLowerCase() === "medium"
                      ? "bg-yellow-200 text-yellow-700"
                      : "bg-green-100 text-green-700"
                }`}
              >
                {priority}
              </Badge>
            </div>

            {/* Author */}
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={"/images/default-avatar.png"} />
                <AvatarFallback>{author.email[0] || "O"}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-800">{author.email}</span>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <button
              onClick={openModal}
              className="text-sm font-medium text-green-600 hover:underline"
            >
              View Details
            </button>
            <p className="mt-1 text-xs text-gray-400">
              {format(new Date(createdAt), "MMMM d, yyyy")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IssueCard;
