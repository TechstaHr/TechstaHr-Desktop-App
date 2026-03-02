"use client";

import React, { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ChevronDown, EllipsisVertical, CreditCard } from "lucide-react";
import slackLogo from "@/public/icons/slack_logo.png";
import jiraLogo from "@/public/icons/jira_logo.png";
import Image from "next/image";
import atmCard from "@/public/images/atm_card.png";
import visaCard from "@/public/images/visa_card.png";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllUsers } from "@/lib/actions/user.actions";
import { getAllTasks } from "@/lib/actions/tasks.actions";
import {
  getWorkloads,
  getUserWorkloadLimit,
  updateUserWorkloadLimit,
} from "@/lib/actions/workload.actions";
import { Input } from "@/components/ui/input";
import { listBanks, createBank, updateBank, deleteBank, listPaymentMethods } from "@/lib/actions/billing.actions";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

const Settings = () => {
  const { data: paymentMethodsData } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: listPaymentMethods,
  });
  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4">
      <Card className="space-y-2 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Admin Settings</h2>
          <a href="/admin/profile" className="text-sm text-green-600">Go to Profile & Account</a>
        </div>
      </Card>
      {/* Project Preferences */}


      {/* Workload Management */}
      <Card className="space-y-4 p-6">
        <h2 className="text-lg font-semibold">Workload Management</h2>
        <WorkloadSection />
      </Card>

      {/* <Card className="space-y-2 p-4">
        <Accordion type="single" collapsible>
          <AccordionItem value="banks">
            <AccordionTrigger className="text-lg font-semibold">Banks</AccordionTrigger>
            <AccordionContent>
              <div className="pt-2">
                <BanksSection />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card> */}

      {/* Notifications & Alerts */}
      <Card className="space-y-4 p-6">
        <h2 className="text-lg font-semibold">Notifications & Alerts</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive updates via email
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Desktop Notifications</p>
              <p className="text-sm text-muted-foreground">
                Show browser notifications
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </Card>



      {/* Billing & Subscription */}
      <Card className="space-y-4 p-6">
        <h2 className="text-lg font-semibold">Billing & Subscription</h2>

        <div className="flex flex-col rounded-md border p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-medium">Current Plan</p>
            <p className="text-green-600">Free</p>
            <div className="flex items-center gap-2">
              <Image src={atmCard} alt="atm card" />
              <p className="text-sm text-muted-foreground">
                Billing cycle: Monthly
              </p>
            </div>
          </div>
          <Button className="mt-2 rounded-sm bg-green-600 text-white hover:bg-green-700 md:mt-0">
            Upgrade Plan
          </Button>
        </div>

        {paymentMethodsData?.data && paymentMethodsData.data.length > 0 ? (
          paymentMethodsData.data.map((pm: any) => (
            <div key={pm._id} className="flex items-center justify-between rounded-md border p-4">
              <div>
                <p className="text-sm text-muted-foreground">Payment Method {pm.is_default && "(Default)"}</p>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <p className="font-medium">
                    {pm.type === "bank_account"
                      ? `${pm.bank.account_name} •••• ${pm.bank.account_number_last4}`
                      : `${pm.card.brand} •••• ${pm.card.last4}`}
                  </p>
                </div>
              </div>
              <a href="/admin/billing-subscription" className="font-medium text-green-600">Edit</a>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-between rounded-md border p-4">
            <div>
              <p className="text-sm text-muted-foreground">Payment Method</p>
              <p className="font-medium">No payment method added</p>
            </div>
            <a href="/admin/billing-subscription" className="font-medium text-green-600">Add</a>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Settings;

const WorkloadSection = () => {
  const { data: usersData } = useQuery({
    queryKey: ["allUsers"],
    queryFn: getAllUsers,
  });

  const { data: tasksData } = useQuery({
    queryKey: ["all-tasks"],
    queryFn: getAllTasks,
  });

  const { data: workloadData } = useQuery({
    queryKey: ["workloads"],
    queryFn: getWorkloads,
    staleTime: 60 * 1000,
  });

  const users = usersData?.users || [];
  const summary = workloadData?.summary || {};
  const tasksByUser = useMemo(() => {
    const map: Record<string, number> = {};
    const tasks = tasksData || [];
    tasks.forEach((t: any) => {
      const ownerId = t?.owner?._id || t?.owner || "";
      if (!ownerId) return;
      map[ownerId] = (map[ownerId] || 0) + 1;
    });
    return map;
  }, [tasksData]);

  const items = useMemo(() => {
    return users.map((u: any) => {
      const s = summary[u._id] || { totalPoints: 0 };
      const tasksCount = tasksByUser[u._id] || 0;
      return { user: u, totalPoints: s.totalPoints || 0, tasksCount };
    });
  }, [users, summary, tasksByUser]);

  const [selectedUser, setSelectedUser] = useState<string>("");
  const [limit, setLimit] = useState<string>("");

  const { data: currentLimit } = useQuery({
    queryKey: ["workload-limit", selectedUser],
    queryFn: () => getUserWorkloadLimit(selectedUser),
    enabled: !!selectedUser,
  });

  const queryClient = useQueryClient();
  const { mutate: updateLimit, isPending: updating } = useMutation({
    mutationFn: (val: number) => updateUserWorkloadLimit(selectedUser, val),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workload-limit", selectedUser] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <UserWorkloadCard key={item.user._id} user={item.user} tasksCount={item.tasksCount} />
        ))}
      </div>

      <div className="space-y-3">
        <p className="font-medium">Set max active tasks per user</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <select
            className="rounded-md border px-2 py-2 text-sm bg-white"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">Select user</option>
            {users.map((u: any) => (
              <option key={u._id} value={u._id}>
                {u.full_name || u.email}
              </option>
            ))}
          </select>
          <Input
            placeholder="Limit"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            type="number"
          />
          <Button
            className="rounded-sm bg-green-600 text-white"
            disabled={!selectedUser || !limit || updating}
            onClick={() => updateLimit(Number(limit))}
          >
            {updating ? "Updating..." : "Update"}
          </Button>
        </div>
        {selectedUser && (
          <p className="text-sm text-muted-foreground">
            Current limit: {currentLimit?.limit ?? "Not set"}
          </p>
        )}
      </div>
    </div>
  );
};

const UserWorkloadCard = ({ user, tasksCount }: { user: any; tasksCount: number }) => {
  const { data: limitData } = useQuery({
    queryKey: ["workload-limit", user._id],
    queryFn: () => getUserWorkloadLimit(user._id),
    staleTime: 5 * 60 * 1000,
  });

  const limit = typeof limitData?.limit === "number" ? limitData.limit : null;
  const progress = limit && limit > 0 ? Math.min(Math.round((tasksCount / limit) * 100), 100) : Math.min(tasksCount * 10, 100);

  return (
    <div className="space-y-2 rounded-sm border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="font-medium">{user.full_name || user.email}</p>
        <p className="text-sm text-muted-foreground">{tasksCount} tasks</p>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div className="h-full bg-[#4CAF50]" style={{ width: `${progress}%` }} />
      </div>
      {limit !== null && (
        <p className="text-xs text-muted-foreground">Limit: {limit}</p>
      )}
    </div>
  );
};

const BanksSection = () => {
  const { data: banks } = useQuery({ queryKey: ["banks"], queryFn: listBanks });
  const queryClient = useQueryClient();

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState<{ open: boolean; bank?: any }>({ open: false });
  const [openDelete, setOpenDelete] = useState<{ open: boolean; bankId?: string }>({ open: false });

  const [bankName, setBankName] = useState("");

  const { mutate: createMut, isPending: creating } = useMutation({
    mutationFn: (data: any) => createBank(data),
    onSuccess: () => {
      setOpenCreate(false);
      setBankName("");
      queryClient.invalidateQueries({ queryKey: ["banks"] });
    },
  });

  const { mutate: updateMut, isPending: updating } = useMutation({
    mutationFn: (payload: { id: string; data: any }) => updateBank(payload.id, payload.data),
    onSuccess: () => {
      setOpenEdit({ open: false });
      queryClient.invalidateQueries({ queryKey: ["banks"] });
    },
  });

  const { mutate: deleteMut, isPending: deleting } = useMutation({
    mutationFn: (id: string) => deleteBank(id),
    onSuccess: () => {
      setOpenDelete({ open: false });
      queryClient.invalidateQueries({ queryKey: ["banks"] });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Manage supported banks</p>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button className="rounded-sm bg-green-600 text-white">Add Bank</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Bank</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Bank Name" value={bankName} onChange={(e) => setBankName(e.target.value)} />
            </div>
            <DialogFooter>
              <Button disabled={!bankName || creating} variant='outline' onClick={() => createMut({ bankName })}>{creating ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(banks || []).map((b: any) => (
          <div key={b._id} className="flex items-center justify-between rounded-sm border bg-white p-3">
            <div>
              <p className="font-medium">{b.bankName}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpenEdit({ open: true, bank: b })}>Edit</Button>
              <Button variant="outline" className="text-red-600" onClick={() => setOpenDelete({ open: true, bankId: b._id })}>Delete</Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={openEdit.open} onOpenChange={(o) => setOpenEdit({ open: o, bank: openEdit.bank })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Bank</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Bank Name" defaultValue={openEdit.bank?.bankName} onChange={(e) => setBankName(e.target.value)} />
          </div>
          <DialogFooter>
            <Button disabled={updating} onClick={() => updateMut({ id: openEdit.bank?._id, data: { bankName: bankName || openEdit.bank?.bankName } })}>{updating ? "Updating..." : "Update"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openDelete.open} onOpenChange={(o) => setOpenDelete({ open: o, bankId: openDelete.bankId })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Bank</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDelete({ open: false })}>Cancel</Button>
            <Button className="bg-red-600 text-white" disabled={deleting} onClick={() => deleteMut(openDelete.bankId!)}>{deleting ? "Deleting..." : "Delete"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
