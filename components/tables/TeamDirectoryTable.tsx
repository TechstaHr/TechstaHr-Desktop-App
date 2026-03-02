"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EllipsisVertical, Filter } from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";
import userAvatar from "@/public/images/user-avatar.png";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDirectories } from "@/lib/actions/people.actions";
import { Skeleton } from "@/components/ui/skeleton";
import React, { useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"; // adjust this to your project structure
import toast from "react-hot-toast";
import { changeUserRole, deleteUserById } from "@/lib/actions/user.actions";
import { setHourlyRate } from "@/lib/actions/billing.actions";
import { getAllProjects } from "@/lib/actions/project.actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const TeamDirectoryTable = () => {
  const [filterBy, setFilterBy] = React.useState<
    "name" | "role" | "team" | "status" | "email"
  >("name");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isRateModalOpen, setIsRateModalOpen] = React.useState(false);
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(
    null,
  );
  const [rateForm, setRateForm] = React.useState({
    hourlyRate: "",
    currency: "NGN",
    projectId: "",
    rateType: "hourly",
    effectiveFrom: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const queryClient = useQueryClient();

  const { data: projects } = useQuery({
    queryKey: ["all-projects"],
    queryFn: () => getAllProjects(),
  });

  const {
    data: teamDirectories,
    isLoading: teamDirectoriesLoading,
    isError: teamDirectoriesError,
  } = useQuery({
    queryKey: ["teamDirectories"],
    queryFn: getDirectories,
    staleTime: 5 * 60 * 1000,
  });

  const handleChangeRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "team" : "admin";

    try {
      const res = await changeUserRole(id, newRole);
      toast.success(res?.message || `Role changed to ${newRole}`);
      queryClient.invalidateQueries({
        queryKey: ["teamDirectories", "peopleStats", "userRoles"],
      });
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to change role");
    }
  };

  const handleDeleteMember = async (id: string) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this member?",
    );
    if (!confirm) return;

    try {
      const res = await deleteUserById(id);
      toast.success(res?.message || "Member deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["teamDirectories"],
      });
      queryClient.invalidateQueries({
        queryKey: ["peopleStats"],
      });
      queryClient.invalidateQueries({
        queryKey: ["userRoles"],
      });
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to delete member");
    }
  };

  const setRateMutation = useMutation({
    mutationFn: setHourlyRate,
    onSuccess: (data) => {
      toast.success(data?.message || "Hourly rate set successfully");
      setIsRateModalOpen(false);
      setRateForm({
        hourlyRate: "",
        currency: "NGN",
        projectId: "",
        rateType: "hourly",
        effectiveFrom: new Date().toISOString().split("T")[0],
        notes: "",
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to set hourly rate");
    },
  });

  const handleSetRate = () => {
    if (!selectedUserId) return;
    if (!rateForm.hourlyRate || !rateForm.projectId) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setRateMutation.mutate({
      userId: selectedUserId,
      hourlyRate: Number(rateForm.hourlyRate),
      currency: rateForm.currency,
      projectId: rateForm.projectId,
      rateType: rateForm.rateType,
      effectiveFrom: rateForm.effectiveFrom,
      notes: rateForm.notes,
    });
  };

  const filteredDirectories = useMemo(() => {
    if (!teamDirectories) return [];
    return teamDirectories.filter((d) => {
      const value =
        filterBy === "name"
          ? d.full_name || ""
          : filterBy === "email"
            ? d.email || ""
            : filterBy === "role"
              ? d.role || ""
              : d.team_name || "";
      return value.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [teamDirectories, searchTerm, filterBy]);

  const renderSkeletonRow = () => (
    <tr className="border-b">
      <td className="py-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="mb-1 h-3 w-24" />
            <Skeleton className="h-2 w-32" />
          </div>
        </div>
      </td>
      <td className="py-4">
        <Skeleton className="h-6 w-16 rounded" />
      </td>
      <td className="py-4">
        <Skeleton className="h-6 w-20 rounded" />
      </td>
      <td className="py-4">
        <Skeleton className="h-6 w-16 rounded" />
      </td>
      <td className="py-4">
        <Skeleton className="mx-auto h-6 w-6 rounded-full" />
      </td>
    </tr>
  );

  return (
    <div className="rounded-lg border bg-white p-4">
      {/* Header */}
      <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <h3 className="text-lg font-semibold">Team Directory</h3>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="rounded-sm bg-[#F3F4F6] p-2">
                <Filter fill="black" stroke="black" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setFilterBy("name")}>
                Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy("email")}>
                Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy("role")}>
                Role
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy("team")}>
                Team
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Input
            placeholder={`Search by ${filterBy}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-60"
          />
        </div>
      </div>

      {/* Table */}
      <div className="hide-scrollbar w-full overflow-x-auto">
        <table className="min-w-[600px] table-auto text-sm lg:w-full">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="py-2 font-medium">Member</th>
              <th className="py-2 font-medium">Role</th>
              <th className="py-2 font-medium">Team</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teamDirectoriesLoading &&
              Array.from({ length: 4 }).map((_, idx) => (
                <React.Fragment key={idx}>{renderSkeletonRow()}</React.Fragment>
              ))}

            {!teamDirectoriesLoading &&
              filteredDirectories?.length > 0 &&
              filteredDirectories.map((directory) => (
                <tr className="border-b" key={directory._id}>
                  <td className="flex items-center gap-2 py-4">
                    <Image
                      src={directory?.avatar || userAvatar}
                      alt="user avatar"
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                    <div>
                      {directory.full_name || "User"}
                      <br />
                      <span className="text-xs text-muted-foreground">
                        {directory.email || "No email"}
                      </span>
                    </div>
                  </td>
                  <td className="py-4">
                    <Badge
                      variant="outline"
                      className={`font-normal capitalize ${directory.role === "admin" ? "bg-red-100 text-red-700" : "text-[#1E40AF]"}`}
                    >
                      {directory.role}
                    </Badge>
                  </td>
                  <td className="py-4">{directory.team_name || "None"}</td>
                  <td className="py-4">
                    <Badge className="bg-green-100 text-green-600 hover:bg-transparent">
                      {directory.isOnline ? "Active" : "Not active"}
                    </Badge>
                  </td>
                  <td className="py-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="rounded p-1 hover:bg-gray-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <EllipsisVertical
                            size={18}
                            className="text-muted-foreground"
                          />
                        </button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() =>
                            handleChangeRole(directory._id, directory.role)
                          }
                          className="cursor-pointer"
                        >
                          Change Role
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUserId(directory._id);
                            setIsRateModalOpen(true);
                          }}
                          className="cursor-pointer"
                        >
                          Add Hourly Rate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteMember(directory._id)}
                          className="cursor-pointer text-red-600"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}

            {!teamDirectoriesLoading && filteredDirectories?.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-6 text-center text-sm text-muted-foreground"
                >
                  No team members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isRateModalOpen} onOpenChange={setIsRateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Set Hourly Rate</DialogTitle>
            <DialogDescription>
              Set the hourly billing rate for this team member.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hourlyRate" className="text-right">
                Rate
              </Label>
              <Input
                id="hourlyRate"
                type="number"
                value={rateForm.hourlyRate}
                onChange={(e) =>
                  setRateForm({ ...rateForm, hourlyRate: e.target.value })
                }
                className="col-span-3"
                placeholder="1500"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currency" className="text-right">
                Currency
              </Label>
              <Select
                value={rateForm.currency}
                onValueChange={(val) =>
                  setRateForm({ ...rateForm, currency: val })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NGN">NGN</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="projectId" className="text-right">
                Project
              </Label>
              <Select
                value={rateForm.projectId}
                onValueChange={(val) =>
                  setRateForm({ ...rateForm, projectId: val })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map((project: any) => (
                    <SelectItem key={project._id} value={project._id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="effectiveFrom" className="text-right">
                From
              </Label>
              <Input
                id="effectiveFrom"
                type="date"
                value={rateForm.effectiveFrom}
                onChange={(e) =>
                  setRateForm({ ...rateForm, effectiveFrom: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Input
                id="notes"
                value={rateForm.notes}
                onChange={(e) =>
                  setRateForm({ ...rateForm, notes: e.target.value })
                }
                className="col-span-3"
                placeholder="Optional notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant={`ghost`}
              onClick={handleSetRate}
              disabled={setRateMutation.isPending}
            >
              {setRateMutation.isPending ? "Setting..." : "Set Rate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
};
