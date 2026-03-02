/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useRef } from "react";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import SearchBar from "../Searchbar";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

import { getUserProjects } from "@/lib/actions/project.actions";
import IssuesModal, { IssuesModalRef } from "../modals/IssuesModal";

const BoardComponent = () => {
  const modalRef = useRef<IssuesModalRef>(null);
  const {
    data: userProjects,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user-projects"],
    queryFn: getUserProjects,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="p-5 lg:px-8">
      <div className="flex items-center gap-3">
        <SearchBar />
        <div className="relative flex items-center">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <Avatar className="-ml-4">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="my-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {userProjects?.projects &&
          userProjects?.projects.map((project, index) => (
            <div
              key={index + "_"}
              className="rounded-sm border bg-[#DDDDDD4D] bg-opacity-30 p-5 md:max-h-[200px]"
            >
              <p className="text-[#71717A]">
                {project.name}
              </p>
              <button
                onClick={() => modalRef.current?.open()}
                className="my-10 flex items-center gap-3 text-center hover:shadow-sm"
              >
                <Plus /> Create issues
              </button>
            </div>
          ))}
      </div>
      <IssuesModal ref={modalRef} />
    </div>
  );
};

export default BoardComponent;
