import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { replyComment, addComment } from "@/lib/actions/comment.actions";

export const CommentsSection = ({
  projectId,
  comments,
  selectedMembers,
  onSelect,
  onRemove,
  isAssigning,
}: {
  projectId: string;
  comments: any[];
  selectedMembers: string[];
  onSelect: (userId: string) => void;
  onRemove: () => void;
  isAssigning: boolean;
}) => {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showCommentForm, setShowCommentForm] = useState(false);

  const addCommentMutation = useMutation({
    mutationFn: (text: string) => addComment(projectId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projectComments", projectId],
      });
      setNewComment("");
      setShowCommentForm(false);
      toast.success("Comment added successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add comment");
    },
  });

  const replyCommentMutation = useMutation({
    mutationFn: ({ commentId, text }: { commentId: string; text: string }) =>
      replyComment(projectId, commentId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projectComments", projectId],
      });
      setReplyText("");
      setReplyingTo(null);
      toast.success("Reply added successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add reply");
    },
  });

  const handleAddComment = () => {
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    addCommentMutation.mutate(newComment);
  };

  const handleReply = (commentId: string) => {
    if (!replyText.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }
    replyCommentMutation.mutate({ commentId, text: replyText });
  };

  return (
    <div className="my-4 space-y-4 rounded-md bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="mb-4 text-xl font-semibold">Comments & Replies</h2>
        <Button
          variant={"outline"}
          onClick={() => setShowCommentForm(!showCommentForm)}
          className="rounded-sm"
        >
          {showCommentForm ? "Cancel" : "Add Comment"}
        </Button>
      </div>

      {/* Add Comment Form */}
      {showCommentForm && (
        <div className="mb-6 space-y-2 rounded-lg border p-4">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your comment..."
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              className="rounded-sm"
              onClick={() => setShowCommentForm(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddComment}
              disabled={addCommentMutation.isPending}
              className="rounded-sm bg-[#4CAF50] text-white"
            >
              {addCommentMutation.isPending ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </div>
      )}

      {comments?.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment._id} className="rounded-lg border p-4">
              {/* Main Comment */}
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/images/default-avatar.png" />
                  <AvatarFallback>
                    {comment.author.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {comment.author.full_name ||
                        comment.author.email.split("@")[0]}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">{comment.text}</p>
                </div>
              </div>

              {/* Replies */}
              {comment.replies?.length > 0 && (
                <div className="mt-4 space-y-4 border-l-2 pl-4">
                  {comment.replies.map((reply: any) => (
                    <div key={reply._id} className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/images/default-avatar.png" />
                        <AvatarFallback>
                          {reply.author.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {reply.author.full_name ||
                              reply.author.email.split("@")[0]}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(reply.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <p className="mt-1 text-sm">{reply.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Form */}
              {replyingTo === comment._id ? (
                <div className="mt-4 space-y-2 pl-11">
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your reply..."
                    rows={2}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyingTo(null)}
                      className="rounded-sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleReply(comment._id)}
                      className="rounded-sm bg-[#4CAF50] text-white"
                      disabled={replyCommentMutation.isPending}
                    >
                      {replyCommentMutation.isPending
                        ? "Posting..."
                        : "Post Reply"}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 text-xs text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    setReplyingTo(comment._id);
                    setReplyText("");
                  }}
                >
                  Reply
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="italic text-gray-500">No comments yet.</p>
      )}

      {selectedMembers.length > 0 && (
        <Button
          className="bg-[#4CAF50] text-white"
          disabled={isAssigning}
          onClick={onRemove}
        >
          {isAssigning ? "Removing..." : "Remove selected"}
        </Button>
      )}
    </div>
  );
};
