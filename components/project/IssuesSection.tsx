import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Issue } from "@/types";
import redCaution from "@/public/images/caution-red.png";
import orangeCaution from "@/public/images/caution-orange.png";

export const IssuesSection = ({ issues }: { issues: Issue[] }) => (
  <div className="my-4 space-y-4 rounded-md bg-white p-4">
    <h2 className="mb-4 text-xl font-semibold">Current Blockers & Issues</h2>
    {issues.length === 0 ? (
      <p className="italic text-gray-500">
        No issues created for this project.
      </p>
    ) : (
      issues.map((issue) => <IssueCard key={issue._id} issue={issue} />)
    )}
  </div>
);

const IssueCard = ({ issue }: { issue: Issue }) => {
  const cautionIcon = issue.priority === "high" ? redCaution : orangeCaution;
  const reportedAgo = formatDistanceToNow(new Date(issue.createdAt), {
    addSuffix: true,
  });

  return (
    <div
      className={`rounded-2xl border p-4 ${
        issue.priority === "high"
          ? "border-[#FECACA] bg-[#FEE2E2]"
          : "border-[#FDE68A] bg-[#FFFBEB]"
      }`}
    >
      <div className="flex items-start gap-5">
        <Image
          src={cautionIcon}
          alt="caution sign"
          className="mt-1"
          width={24}
          height={24}
        />
        <div className="space-y-2">
          <h4 className="font-semibold">{issue.title}</h4>
          <p className="text-sm">{issue.description}</p>
          <p className="text-sm">Extra message: {issue.message}</p>
          <div className="text-sm text-gray-700 flex items-center gap-2">
            <p>Priority: </p>
            <Badge className="font-medium capitalize">{issue.priority}</Badge>
          </div>
          <Badge className={issue.resolved ? "bg-green-600" : "bg-red-600"}>
            {issue.resolved ? "Resolved" : "Open"}
          </Badge>
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-500">
              Reported by user ID: {issue.raisedBy} · {reportedAgo}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
