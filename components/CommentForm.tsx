import React, { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { Input } from "./ui/input";

import { addComment } from "@/lib/actions/comment.actions";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

// Separate component for the comment input form
const CommentForm = ({
  projectId,
  rowId,
  onCommentAdded,
}: {
  projectId: string;
  rowId: number;
  onCommentAdded: () => void;
}) => {
  const [commentInput, setCommentInput] = useState("");
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (!commentInput.trim()) return;

    try {
      const res = await addComment(projectId, commentInput.trim());
      toast.success(res?.message || "Comment added successfully");
      setCommentInput("");
      // Invalidate and refetch the comments query
      queryClient.invalidateQueries({
        queryKey: ["project-comments", projectId],
      });
    } catch (err: any) {
      console.error("Failed to add comment:", err);
      toast.error(err?.message || "Failed to add comment");
    }
  };

  return (
    <div key={rowId} className="flex items-center gap-1">
      <Input
        type="text"
        className="flex-1 rounded border px-2 py-1 text-xs"
        value={commentInput}
        onChange={(e) => setCommentInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="Add comment..."
      />
      <button
        onClick={handleSubmit}
        className="text-blue-600 hover:text-blue-800"
      >
        <Send size={14} />
      </button>
    </div>
  );
};

export default CommentForm;
