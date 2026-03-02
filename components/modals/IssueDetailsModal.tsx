import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

import { Check, Loader2 } from "lucide-react";
import { updateIssues, updateIssueDetails, deleteIssue } from "@/lib/actions/issues.actions";
import toast from "react-hot-toast";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog as SubDialog, DialogContent as SubDialogContent, DialogHeader as SubDialogHeader, DialogTitle as SubDialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface IssueDetailsModalProps {
  open: boolean;
  onClose: () => void;
  issue: any;
}

export default function IssueDetailsModal({
  open,
  onClose,
  issue,
}: IssueDetailsModalProps) {
  const [resolving, setResolving] = useState(false);
  const [isResolved, setIsResolved] = useState(issue.status === "Resolved");
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(issue.title || "");
  const [editDescription, setEditDescription] = useState(issue.description || "");
  const [editPriority, setEditPriority] = useState(issue.priority || "");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleResolve = async () => {
    setResolving(true);
    try {
      const res = await updateIssues(issue.projectId, issue.id, !isResolved);
      toast.success(
        res?.message ||
          (isResolved ? "Issue reopened" : "Issue resolved successfully"),
      );
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      setIsResolved(!isResolved); // update local state
    } catch (error) {
      console.error(error);
      toast.error("Failed to resolve issue");
    } finally {
      setResolving(false);
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm("Delete this issue?");
    if (!confirm) return;
    setDeleting(true);
    try {
      const res = await deleteIssue(issue.projectId, issue.id);
      toast.success(res?.message || "Issue deleted");
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      onClose();
    } catch (error) {
      toast.error("Failed to delete issue");
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveEdit = async () => {
    setSavingEdit(true);
    try {
      const res = await updateIssueDetails(issue.projectId, issue.id, {
        title: editTitle,
        description: editDescription,
        priority: editPriority,
      });
      toast.success(res?.message || "Issue updated");
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      setEditOpen(false);
    } catch (error) {
      toast.error("Failed to update issue");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{issue.title}</DialogTitle>
        </DialogHeader>

        <div className="mb-4 flex flex-wrap gap-2">
          <Badge className="bg-red-100 text-red-600">{issue.category}</Badge>
          <Badge className="bg-blue-100 text-blue-600">{issue.status}</Badge>
          <Badge className="bg-red-200 capitalize text-red-700">
            {issue.priority}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Left side */}
          <div className="space-y-4 md:col-span-2">
            <div>
              <h3 className="font-semibold text-gray-800">Description</h3>
              <p className="text-sm text-gray-700">{issue.description}</p>
            </div>

            {/* <div>
              <h3 className="font-semibold text-gray-800">Comments</h3>
              {issue.comments.map((comment: any, idx: number) => (
                <div key={idx} className="mt-2 flex items-start gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={comment.avatarUrl} />
                    <AvatarFallback>{comment.author[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {comment.author}{" "}
                      <span className="ml-2 text-xs text-gray-500">
                        {format(new Date(comment.date), "PPPpp")}
                      </span>
                    </p>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                </div>
              ))}

              <Textarea placeholder="Add a comment..." className="mt-4" />
              <Button className="mt-2 bg-[#4CAF50]">Add Comment</Button>
            </div> */}

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditOpen(true)}>Edit Issue</Button>
              {/* <Button variant="destructive" onClick={handleDelete} disabled={deleting}>{deleting ? "Deleting..." : "Delete"}</Button> */}
            </div>
          </div>

          {/* Right side */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm text-gray-500">Assignee</h3>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={issue.assignee.avatarUrl} />
                  <AvatarFallback>{issue.assignee.name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{issue.assignee.name}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm text-gray-500">Reporter</h3>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={issue.author.avatarUrl} />
                  <AvatarFallback>{issue.author.name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{issue.reporter.name}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm text-gray-500">Date Logged</h3>
              <p className="text-sm text-gray-700">
                {format(new Date(issue.createdAt), "PPPpp")}
              </p>
            </div>

            <div>
              <h3 className="text-sm text-gray-500">Status</h3>
              <div className="rounded-md border p-2">
                <p className="text-sm font-semibold">{issue.status}</p>
              </div>
            </div>

            <Button
              onClick={handleResolve}
              className={`w-full items-center gap-1 ${
                isResolved
                  ? "bg-yellow-600 hover:bg-yellow-700"
                  : "bg-[#4CAF50] hover:bg-green-700"
              }`}
            >
              {resolving ? (
                <Loader2 className="animate-spin" />
              ) : (
                <div className="flex items-center justify-center gap-1">
                  <Check />
                  {isResolved ? "Open Issue" : "Mark as Resolved"}
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
      <SubDialog open={editOpen} onOpenChange={setEditOpen}>
        <SubDialogContent className="lg:min-w-[540px]">
          <SubDialogHeader>
            <SubDialogTitle>Edit Issue</SubDialogTitle>
          </SubDialogHeader>
          <div className="space-y-3">
            <Label>Title</Label>
            <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            <Label>Description</Label>
            <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
            <Label>Priority</Label>
            <Select value={editPriority} onValueChange={setEditPriority}>
              <SelectTrigger className="rounded-sm">
                <SelectValue placeholder="--Priority--" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button className="bg-[#4CAF50] text-white" disabled={savingEdit} onClick={handleSaveEdit}>{savingEdit ? "Saving..." : "Save"}</Button>
            </div>
          </div>
        </SubDialogContent>
      </SubDialog>
    </Dialog>
  );
}
