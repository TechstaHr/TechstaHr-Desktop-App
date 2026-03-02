/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef, useState } from "react";
import PaymentNav from "../PaymentNav";
import Image from "next/image";
import noSearch from "@/public/images/no-search.svg";
import { Button } from "../ui/button";
import IssuesModal, { IssuesModalRef } from "../modals/IssuesModal";
import IssueCard from "../cards/IssueCard";
import IssueDetailsModal from "../modals/IssueDetailsModal";
import { useQuery } from "@tanstack/react-query";
import { getMyIssues } from "@/lib/actions/issues.actions";

const IssuesComponent = () => {
  const modalRef = useRef<IssuesModalRef>(null);
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["issues"],
    queryFn: getMyIssues,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const userIssues = data?.issues;

  const handleOpen = (issue: any) => {
    const transformedIssue = {
      id: issue._id,
      projectId: issue.projectId,
      title: issue.projectName,
      category: "Bug",
      status: issue.resolved ? "Resolved" : "Open",
      priority: issue.priority,
      author: {
        name: "Unknown",
        avatarUrl: "https://via.placeholder.com/150",
      },
      assignee: {
        name: "Unassigned",
        avatarUrl: "https://via.placeholder.com/150",
      },
      reporter: {
        name: "Unknown",
        avatarUrl: issue.reporter?.avatar ?? "https://via.placeholder.com/150",
      },
      createdAt: new Date(issue.createdAt),
      description: issue.description ?? "No description provided.",
      comments:
        issue.comments?.map((comment: any) => ({
          author: comment.author?.name ?? "Anonymous",
          avatarUrl: "https://via.placeholder.com/150",
          content: comment.content,
          date: new Date(comment.createdAt),
        })) ?? [],
    };

    setSelectedIssue(transformedIssue);
    setOpenModal(true);
  };

  return (
    <div className="px-5 py-5 lg:px-8">
      <PaymentNav />

      <div className="my-5 flex items-center justify-end">
        <Button
          onClick={() => modalRef.current?.open()}
          className="h-6 w-fit rounded-sm bg-[#4CAF50] p-4 px-6 font-semibold text-white lg:h-9"
        >
          Create Issue
        </Button>
      </div>

      {isLoading && <p>Getting issues...</p>}

      {userIssues?.length === 0 && (
        <div className="my-10 flex flex-col items-center justify-center rounded-md bg-[#DDDDDD4D] bg-opacity-30 p-8 md:w-fit">
          <Image src={noSearch} alt="no search found" />
          <p className="text-[#333333] md:text-2xl">No issues were found</p>
        </div>
      )}

      {/* Populated issues */}
      {userIssues?.length > 0 &&
        userIssues.map((issue) => (
          <div key={issue._id}>
            <IssueCard
              title={issue.projectName}
              category="Bug"
              status={issue.resolved ? "Resolved" : "Open"}
              priority={issue.priority}
              author={issue.raisedBy}
              createdAt={new Date(issue.createdAt)}
              openModal={() => handleOpen(issue)}
            />
          </div>
        ))}

      {selectedIssue && (
        <IssueDetailsModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          issue={selectedIssue}
        />
      )}
      <IssuesModal ref={modalRef} />
    </div>
  );
};

export default IssuesComponent;
