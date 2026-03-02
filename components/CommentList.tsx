"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getComments } from "@/lib/actions/comment.actions";
import toast from "react-hot-toast";

// Separate component for displaying comments
const CommentList = ({ projectId }: { projectId: string }) => {
  const {
    data: commentsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["project-comments", projectId],
    queryFn: () => getComments(projectId),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <div className="py-2 text-xs">Loading comments...</div>;
  if (isError)
    return (
      <div className="py-2 text-xs text-red-500">Failed to load comments</div>
    );

  const comments = commentsData?.comments || [];

  return (
    <div className="hide-scrollbar mb-2 max-h-28 space-y-1 overflow-y-auto pr-1">
      {comments.length > 0 ? (
        comments.map((comment, idx) => (
          <div key={comment._id || idx} className="flex items-start gap-2">
            <div>
              <div
                className={`w-60 break-words rounded p-2 text-xs text-white ${
                  idx % 2 === 0 ? "bg-[#39786D]" : "bg-[#453978]"
                }`}
              >
                <p className="mb-1">{comment.text}</p>
                <p className="text-[10px] opacity-80">
                  {new Date(comment.createdAt || Date.now()).toLocaleTimeString(
                    [],
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </p>
              </div>
              <p className="mt-1 text-xs text-gray-600">
                {comment.author?.full_name ||
                  comment.author?.email ||
                  "Manager"}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-xs text-gray-500">No comments yet</p>
      )}
    </div>
  );
};

export default CommentList;
