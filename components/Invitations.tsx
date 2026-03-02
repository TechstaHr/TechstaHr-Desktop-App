"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import {
  acceptInvitation,
  getInvitations,
  getPendingInvitations,
  rejectInvitation,
} from "@/lib/actions/project.actions";
import { _user } from "@/types";

const Invitations = () => {
  const queryClient = useQueryClient();

  // Invitations
  const {
    data: invitationsResponse,
    isLoading: isLoadingInvites,
    isError: isErrorInvites,
  } = useQuery({ queryKey: ["invitations"], queryFn: getInvitations });
  const invitations = invitationsResponse?.invitations ?? [];

  // Pending invitations
  const {
    data: pendingInvitesResponse,
    isLoading: isLoadingPending,
    isError: isErrorPending,
  } = useQuery({
    queryKey: ["pending-invitations"],
    queryFn: getPendingInvitations,
  });
  const pendingInvites = pendingInvitesResponse?.invitations ?? [];

  // Accept invitation
  const acceptMutation = useMutation({
    mutationFn: acceptInvitation,
    onSuccess: () => {
      toast.success("Invitation accepted!");
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      queryClient.invalidateQueries({ queryKey: ["pending-invitations"] });
    },
    onError: () => toast.error("Failed to accept invitation."),
  });

  // Reject invitation
  const rejectMutation = useMutation({
    mutationFn: rejectInvitation,
    onSuccess: () => {
      toast.success("Invitation rejected.");
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      queryClient.invalidateQueries({ queryKey: ["pending-invitations"] });
    },
    onError: () => toast.error("Failed to reject invitation."),
  });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* ==================== SECTION 1: Invitations ==================== */}
      {/* Invitations */}
      <Card>
        <CardHeader>
          <CardTitle>Project Invitations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingInvites ? (
            <p className="text-muted-foreground">Loading invitations...</p>
          ) : isErrorInvites ? (
            <p className="text-red-500">Failed to load invitations.</p>
          ) : invitations.length === 0 ? (
            <p className="text-muted-foreground">No invitations found.</p>
          ) : (
            invitations.map((invite: any) => (
              <div
                key={invite._id}
                className="flex flex-col gap-2 rounded border p-3 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium">
                    {invite.name || "Unnamed Project"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Invited by: {invite.invitedBy?.email || "Unknown"}
                  </p>
                  <p className="text-xs text-gray-400">
                    Deadline:{" "}
                    {invite.deadline
                      ? new Date(invite.deadline).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p className="text-xs text-gray-400">
                    Status: {invite.status || "N/A"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    disabled={acceptMutation.status === "pending"}
                    onClick={() => acceptMutation.mutate(invite._id)}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={rejectMutation.status === "pending"}
                    onClick={() => rejectMutation.mutate(invite._id)}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingPending ? (
            <p className="text-muted-foreground">
              Loading pending invitations...
            </p>
          ) : isErrorPending ? (
            <p className="text-red-500">Failed to load pending invitations.</p>
          ) : pendingInvites.length === 0 ? (
            <p className="text-muted-foreground">
              No pending invitations found.
            </p>
          ) : (
            pendingInvites.map((pending: any) => {
              return (
                <div
                  key={pending.projectId}
                  className="mb-2 flex flex-col gap-2 rounded border p-3"
                >
                  <div>
                    <p className="font-medium">
                      {pending.projectName || "Unnamed Project"}
                    </p>

                    {/* List pending members */}
                    {pending?.pendingMembers?.length > 0 ? (
                      pending.pendingMembers.map((member: any) => {
                        const { user, status, _id: pendingId } = member;

                        return (
                          <div
                            key={pendingId}
                            className="mb-2 flex flex-col gap-2 rounded border p-3 md:flex-row md:items-center md:justify-between"
                          >
                            <div>
                              <p className="font-medium">
                                {user?.full_name ||
                                  user?.email ||
                                  "Unknown User"}
                              </p>
                              <p className="text-sm text-gray-500">
                                Email: {user?.email || "Unknown"}
                              </p>
                              <p className="text-xs text-gray-400">
                                Status: {status}
                              </p>
                            </div>
                            <Badge className="bg-yellow-100 capitalize text-yellow-800">
                              {status}
                            </Badge>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-muted-foreground">
                        No pending members for this project.
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Invitations;
