"use client";
import React, { useMemo, useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import upcomingPayrollIcon from "@/public/icons/upcoming.png";
import totalPayrollIcon from "@/public/icons/total_payroll.png";
import pendingApproval from "@/public/icons/pending_approval.png";
import payrollSummary from "@/public/icons/summary.png";
import costAllocation from "@/public/icons/allocation.png";
import reportBuilder from "@/public/icons/builder.png";
import peopleConfig from "@/public/icons/people_config.png";
import systemSettings from "@/public/icons/system_settings.png";

import { PayrollStatCard } from "@/components/cards/PayrollStatCard";
import { ReportOptionCard } from "@/components/cards/ReportOptionCard";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllUsers, getUserById, getUserProfile } from "@/lib/actions/user.actions";
import { listBanks, createPayroll, getPayrollById, updatePayrollById, listPayrolls, createCharge, CreateChargePayload, getBillingInfo, triggerPayment, listPaymentMethods } from "@/lib/actions/billing.actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, CreditCard, ExternalLink, Send } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { PayrollRecord } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getUserEmailById } from "@/lib/actions/user.actions";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { getAssignedTeamMembersToProject } from "@/lib/actions/project.actions";
import toast from "react-hot-toast";

const ReportingPayroll = () => {
  const { data: usersData } = useQuery({ queryKey: ["allUsers"], queryFn: getAllUsers });
  const { data: banks } = useQuery({ queryKey: ["banks"], queryFn: listBanks });
  const { data: userData } = useQuery({ queryKey: ["user-profile"], queryFn: getUserProfile });
  const storeUser = useUserStore((state) => state.user);
  const user = userData || storeUser;
  const isAdmin = user?.role === "admin";
  const { data: employerBillingInfo } = useQuery({
    queryKey: ["billing-info"],
    queryFn: getBillingInfo,
    enabled: isAdmin,
  });

  const { data: paymentMethodsData } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: listPaymentMethods,
    enabled: isAdmin,
  });

  const users = usersData?.users || [];
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState<string>("USD");
  const [narration, setNarration] = useState<string>("Salary");
  const [payPeriodStart, setPayPeriodStart] = useState<string>(() => {
    // Set default to first day of current month
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  });
  const [payPeriodEnd, setPayPeriodEnd] = useState<string>(() => {
    // Set default to last day of current month
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  });

  // Fetch selected user details to get bankId from profile
  const { data: selectedUserDetails } = useQuery({
    queryKey: ["user-details", selectedUser],
    queryFn: () => getUserById(selectedUser),
    enabled: !!selectedUser,
  });

  const queryClient = useQueryClient();
  const [sessionPayrolls, setSessionPayrolls] = useState<PayrollRecord[]>([]);
  const { mutate: createPayrollMut, isPending: creating } = useMutation({
    mutationFn: (payload: Record<string, any>) => createPayroll(payload),
    onSuccess: (data: any) => {
      setAmount("");
      //setNote("");
      if (data) setSessionPayrolls((prev) => [...prev, data]);
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      toast.success(data?.message || "Payroll created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create payroll");
    },
  });

  const [payrollId, setPayrollId] = useState<string>("");
  const { data: payrollData } = useQuery({
    queryKey: ["payroll", payrollId],
    queryFn: () => getPayrollById(payrollId),
    enabled: !!payrollId,
  });
  const { data: payrollList = [] } = useQuery({ queryKey: ["payroll-list"], queryFn: listPayrolls });
  const [projectId, setProjectId] = useState<string | null>(null);
  React.useEffect(() => {
    try {
      const id = localStorage.getItem("currentProjectId");
      if (id) setProjectId(id);
    } catch { }
  }, []);

  const { data: assignedTeamMembers } = useQuery({
    queryKey: ["assignedTeamMembers", projectId],
    queryFn: () => getAssignedTeamMembersToProject(projectId!),
    enabled: !!projectId,
  });

  const teamUserIds = React.useMemo(() => {
    const members = assignedTeamMembers?.teamMembers || [];
    const ids = new Set<string>();
    members.forEach((m: any) => {
      if (m?.user?._id) ids.add(m.user._id);
      if (m?._id) ids.add(m._id);
    });
    return ids;
  }, [assignedTeamMembers]);

  const filteredPayrolls = React.useMemo(() => {
    if (!projectId) return [];
    if (!teamUserIds || teamUserIds.size === 0) return [];
    return (payrollList as any[]).filter((p) => {
      const uid = typeof p.userId === "string" ? p.userId : p.userId?._id;
      return uid ? teamUserIds.has(uid) : false;
    });
  }, [payrollList, teamUserIds, projectId]);
  const [emailByUserId, setEmailByUserId] = useState<Record<string, string>>({});
  React.useEffect(() => {
    const ids = Array.from(new Set((filteredPayrolls as any[]).map((p) => (typeof p.userId === "string" ? p.userId : p.userId?._id)).filter(Boolean)));
    if (!ids.length) return;
    (async () => {
      const results = await Promise.all(ids.map(async (id) => [id!, await getUserEmailById(id!)] as const));
      const map: Record<string, string> = {};
      results.forEach(([id, email]) => { if (email) map[id] = email; });
      setEmailByUserId((prev) => ({ ...prev, ...map }));
    })();
  }, [filteredPayrolls]);

  const [updateAmount, setUpdateAmount] = useState<string>("");
  const [updateStatus, setUpdateStatus] = useState<string>("");
  const { mutate: updatePayrollMut, isPending: updating } = useMutation({
    mutationFn: (payload: { id: string; data: Record<string, any> }) => updatePayrollById(payload.id, payload.data),
    onSuccess: (updated: any) => {
      if (updated?._id) {
        setSessionPayrolls((prev) => prev.map((p) => (p._id === updated._id ? { ...p, ...updated } : p)));
      }
      queryClient.invalidateQueries({ queryKey: ["payroll", payrollId] });
      toast.success(updated?.message || "Payroll updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update payroll");
    },
  });

  const currencyFmt = useMemo(() => new Intl.NumberFormat(undefined, { style: "currency", currency: "NGN" }), []);
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
  const stats = useMemo(() => {
    const all = filteredPayrolls as any[];
    const totalForMonth = all
      .filter((p) => {
        const d = new Date(p.createdAt);
        return `${d.getFullYear()}-${d.getMonth()}` === monthKey;
      })
      .reduce((sum, p) => sum + (p.amount ?? p.paymentAmount ?? 0), 0);
    const pendingCount = all.filter((p) => (p.paymentStatus || "").toLowerCase() === "pending").length;
    const upcoming = all.find((p) => (p.paymentStatus || "").toLowerCase() === "scheduled") || all[0] || null;
    return { totalForMonth, pendingCount, upcoming };
  }, [filteredPayrolls, monthKey]);

  React.useEffect(() => {
    const selected = (payrollList as any[]).find((p) => p._id === payrollId);
    if (selected) {
      setUpdateAmount(String(selected.amount ?? selected.paymentAmount ?? ""));
      setUpdateStatus(String(selected.paymentStatus ?? ""));
    }
  }, [payrollId, payrollList]);

  // Pay Employee State
  const [payEmployeeDialogOpen, setPayEmployeeDialogOpen] = useState(false);
  const [selectedEmployeeForPayment, setSelectedEmployeeForPayment] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentCurrency, setPaymentCurrency] = useState<string>("NGN");
  const [paymentReference, setPaymentReference] = useState<string>("");
  const [chargeResponse, setChargeResponse] = useState<any>(null);
  const [isCreatingCharge, setIsCreatingCharge] = useState(false);

  const { mutate: createChargeMut } = useMutation({
    mutationFn: (payload: CreateChargePayload) => createCharge(payload),
    onSuccess: (data) => {
      setChargeResponse(data);
      setIsCreatingCharge(false);
      toast.success("Charge created successfully. Please complete the payment.");
    },
    onError: (error: any) => {
      setIsCreatingCharge(false);
      toast.error(error?.response?.data?.message || error?.message || "Failed to create charge");
    },
  });

  const handlePayEmployee = (payroll: any) => {
    const userId = typeof payroll.userId === "string" ? payroll.userId : payroll.userId?._id;
    const userLabel = typeof payroll.userId === "object" && payroll.userId?.email ? payroll.userId.email : (emailByUserId[userId!] || userId || "-");
    setSelectedEmployeeForPayment({ ...payroll, userId, userLabel });
    setPaymentAmount(String(payroll.amount ?? payroll.paymentAmount ?? ""));
    setPaymentCurrency(payroll.currency || "NGN");
    setPaymentReference(`tshr-${Date.now()}`);
    setChargeResponse(null);
    setPayEmployeeDialogOpen(true);
  };

  const handleCreateCharge = () => {
    const amount = Number(paymentAmount);
    if (amount < 200) {
      toast.error("Minimum amount is 200. Please enter a valid amount.");
      return;
    }

    if (!selectedEmployeeForPayment?.userId || !user?.flw_customer_id) {
      toast.error("Employee or payment method not found");
      return;
    }

    // Get default payment method ID from payment methods list
    const defaultPaymentMethod = paymentMethodsData?.data?.find((pm: any) => pm.is_default);
    const paymentMethodId = defaultPaymentMethod?._id || employerBillingInfo?.payment_method_id;

    if (!paymentMethodId) {
      toast.error("Payment method not found. Please set up your bank details in Billing & Subscription first.");
      setIsCreatingCharge(false);
      return;
    }

    setIsCreatingCharge(true);
    const chargePayload: CreateChargePayload = {
      amount: amount * 100, // Convert to kobo/cents
      currency: paymentCurrency,
      reference: paymentReference,
      customer_id: user.flw_customer_id,
      payment_method_id: paymentMethodId,
      redirect_url: `${window.location.origin}/admin/reporting-payroll?payment_success=true`,
      recurring: false,
      order_id: selectedEmployeeForPayment._id,
      meta: {
        payrollId: selectedEmployeeForPayment._id,
        employeeId: selectedEmployeeForPayment.userId,
      },
      authorization: {
        otp: {},
        type: "otp",
      },
    };

    createChargeMut(chargePayload);
  };

  const handleCompletePayment = () => {
    if (chargeResponse?.next_action?.redirect_url?.url) {
      window.location.href = chargeResponse.next_action.redirect_url.url;
    }
  };

  // Trigger Payment State
  // const { mutate: triggerPaymentMut, isPending: isTriggering } = useMutation({
  //   mutationFn: triggerPayment,
  //   onSuccess: (data) => {
  //     toast.success(data?.message || "Payment triggered successfully. Transfer created.");
  //     queryClient.invalidateQueries({ queryKey: ["payroll-list"] });
  //     queryClient.invalidateQueries({ queryKey: ["payroll", triggeringPayrollId] });
  //     setTriggeringPayrollId(null);
  //   },
  //   onError: (error: any) => {
  //     toast.error(error?.response?.data?.message || error?.message || "Failed to trigger payment");
  //     setTriggeringPayrollId(null);
  //   },
  // });

  // const handleTriggerPayment = (payrollId: string) => {
  //   if (window.confirm("Are you sure you want to trigger this payment? The amount will be deducted from Techstahr's wallet and sent to the employee.")) {
  //     setTriggeringPayrollId(payrollId);
  //     triggerPaymentMut(payrollId);
  //   }
  // };

  // Trigger Payment State
  const [triggeringPayrollId, setTriggeringPayrollId] = useState<string | null>(null);
  const { mutate: triggerPaymentMut, isPending: isTriggering } = useMutation({
    mutationFn: triggerPayment,
    onSuccess: (data) => {
      toast.success(data?.message || "Payment triggered successfully. Transfer created.");
      queryClient.invalidateQueries({ queryKey: ["payroll-list"] });
      queryClient.invalidateQueries({ queryKey: ["payroll", triggeringPayrollId] });
      setTriggeringPayrollId(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to trigger payment");
      setTriggeringPayrollId(null);
    },
  });

  const handleTriggerPayment = (payrollId: string) => {
    if (window.confirm("Are you sure you want to trigger this payment? The amount will be deducted from Techstahr's wallet and sent to the employee.")) {
      setTriggeringPayrollId(payrollId);
      triggerPaymentMut(payrollId);
    }
  };

  return (
    <div className="space-y-8 px-4 py-2">
      <Suspense fallback={null}>
        <PaymentStatusHandler />
      </Suspense>

      {/* Top Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <PayrollStatCard
          icon={upcomingPayrollIcon}
          title="Upcoming Payroll"
          value={stats.upcoming ? currencyFmt.format(stats.upcoming.amount || 0) : "No data"}
          subtitle={stats.upcoming ? `Created on ${new Date(stats.upcoming.createdAt).toLocaleDateString()}` : "No scheduled payroll"}
        />
        <PayrollStatCard
          icon={totalPayrollIcon}
          title="Total Payroll"
          value={currencyFmt.format(stats.totalForMonth)}
          subtitle="Current month"
        />
        <PayrollStatCard
          icon={pendingApproval}
          title="Pending Approvals"
          value={String(stats.pendingCount)}
          subtitle="Requires attention"
        />
      </div>

      {/* Reporting Options */}
      {/* <div>
        <h2 className="mb-3 text-lg font-semibold">Reporting Options</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ReportOptionCard
            icon={payrollSummary}
            title="Payroll Summary"
            description="View comprehensive payroll reports and analytics"
            actionText="Generate Report"
          />
          <ReportOptionCard
            icon={costAllocation}
            title="Project Cost Allocation"
            description="Track project-wise cost distribution"
            actionText="View Allocation"
          />
          <ReportOptionCard
            icon={reportBuilder}
            title="Custom Report Builder"
            description="Create customized reports for your needs"
            actionText="Build Report"
          />
        </div>
      </div> */}

      {/* Create Payroll */}
      <div className="rounded-sm bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Payroll Actions</h2>
        <div className="space-y-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full h-12 rounded-md bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow hover:from-emerald-600 hover:to-green-700">
                <span className="mr-2 inline-flex items-center"><Plus className="h-5 w-5" /></span>
                Create Payroll • Add team payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Payroll</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="selectedUser">Team Member</Label>
                  <select
                    id="selectedUser"
                    className="w-full rounded-md border px-2 py-2 text-sm bg-white"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                  >
                    <option value="">Select team member</option>
                    {users.map((u: any) => (
                      <option key={u._id} value={u._id}>{u.full_name || u.email}</option>
                    ))}
                  </select>
                  {selectedUserDetails?.bank && (
                    <p className="text-xs text-green-600">
                      Bank: {selectedUserDetails.bank.bankName} ({selectedUserDetails.bank.currency})
                    </p>
                  )}
                  {selectedUser && !selectedUserDetails?.bank && (
                    <p className="text-xs text-yellow-600">
                      No bank found in user profile. Please select a bank manually.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="selectedBank">Bank (if not in profile)</Label>
                  <select
                    id="selectedBank"
                    className="w-full rounded-md border px-2 py-2 text-sm bg-white"
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    disabled={!!selectedUserDetails?.bank?._id}
                  >
                    <option value="">{selectedUserDetails?.bank?._id ? "Using bank from profile" : "Select bank"}</option>
                    {(banks || []).map((b: any) => (
                      <option key={b._id} value={b._id}>{b.bankName}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Payment Amount</Label>
                  <Input
                    id="amount"
                    placeholder="Amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    placeholder="Currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="narration">Narration</Label>
                  <Input
                    id="narration"
                    placeholder="Narration (e.g., Salary)"
                    value={narration}
                    onChange={(e) => setNarration(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payPeriodStart">Pay Period Start</Label>
                  <Input
                    id="payPeriodStart"
                    type="date"
                    value={payPeriodStart}
                    onChange={(e) => setPayPeriodStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payPeriodEnd">Pay Period End</Label>
                  <Input
                    id="payPeriodEnd"
                    type="date"
                    value={payPeriodEnd}
                    onChange={(e) => setPayPeriodEnd(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  className="h-11 rounded-sm bg-green-600 text-white"
                  disabled={!selectedUser || !amount || creating || (!selectedUserDetails?.bank?._id && !selectedBank)}
                  onClick={() => {
                    const bankId = selectedUserDetails?.bank?._id || selectedBank;
                    if (!bankId) {
                      toast.error("Please select a bank or ensure the user has a bank in their profile");
                      return;
                    }

                    // Format date as YYYY-MM-DD
                    const formatDate = (dateString: string) => {
                      if (!dateString) return new Date().toISOString().split('T')[0];
                      const date = new Date(dateString);
                      return date.toISOString().split('T')[0];
                    };

                    const payrollPayload = {
                      userId: selectedUser,
                      bankId: bankId,
                      narration: narration || "Salary",
                      paymentAmount: Number(amount),
                      payPeriodStart: formatDate(payPeriodStart),
                      payPeriodEnd: formatDate(payPeriodEnd),
                      paymentStatus: "scheduled",
                      paymentGateway: "flutterwave"
                    };

                    createPayrollMut(payrollPayload);
                  }}
                >
                  {creating ? "Creating..." : "Create Payroll"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full h-12 rounded-md bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow hover:from-sky-600 hover:to-blue-700">
                <span className="mr-2 inline-flex items-center"><Pencil className="h-5 w-5" /></span>
                Update Payroll • Adjust amount or status
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Payroll</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 md:grid-cols-2">
                <select className="rounded-md border px-2 py-2 text-sm bg-white" value={payrollId} onChange={(e) => setPayrollId(e.target.value)}>
                  <option value="">Select payroll</option>
                  {filteredPayrolls.map((p: any) => {
                    const id = typeof p.userId === "string" ? p.userId : p.userId?._id;
                    const email = typeof p.userId === "object" && p.userId?.email ? p.userId.email : (emailByUserId[id!] || id || "User");
                    const amt = p.amount ?? p.paymentAmount ?? 0;
                    return (
                      <option key={p._id} value={p._id}>
                        {p._id} • {email} • {p.currency} {amt}
                      </option>
                    );
                  })}
                </select>
                <Input placeholder="New Amount" type="number" value={updateAmount} onChange={(e) => setUpdateAmount(e.target.value)} />
                <Select value={updateStatus} onValueChange={setUpdateStatus}>
                  <SelectTrigger className="rounded-md">
                    <SelectValue placeholder="Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initiated">initiated</SelectItem>
                    <SelectItem value="completed">completed</SelectItem>
                    <SelectItem value="scheduled">scheduled</SelectItem>
                    <SelectItem value="failed">failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button className="h-11 rounded-sm bg-green-600 text-white" disabled={!payrollId || updating} onClick={() => updatePayrollMut({ id: payrollId, data: { paymentAmount: updateAmount ? Number(updateAmount) : undefined, paymentStatus: updateStatus || undefined } })}>{updating ? "Updating..." : "Update Payroll"}</Button>
              </DialogFooter>
              {payrollData && (
                <div className="mt-3 rounded-sm border bg-white p-3 text-sm">
                  <p><strong>ID:</strong> {payrollData?._id || payrollId}</p>
                  <p><strong>Status:</strong> {payrollData?.paymentStatus}</p>
                  <p><strong>Amount:</strong> {payrollData?.paymentAmount}</p>
                  <p><strong>Currency:</strong> {payrollData?.currency ? payrollData?.currency : "USD"}</p>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Update Payroll */}


      {/* All Payrolls */}
      <div className="rounded-sm bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">All Payrolls</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>ID</TableHead>
                {isAdmin && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {(filteredPayrolls as any[]).map((p) => {
                const userId = typeof p.userId === "string" ? p.userId : p.userId?._id;
                const userLabel = typeof p.userId === "object" && p.userId?.email ? p.userId.email : (emailByUserId[userId!] || userId || "-");
                const amt = p.amount ?? p.paymentAmount ?? 0;
                return (
                  <TableRow key={p._id}>
                    <TableCell>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "-"}</TableCell>
                    <TableCell className="truncate">{userLabel}</TableCell>
                    <TableCell>{amt}</TableCell>
                    <TableCell>{p.currency || "USD"}</TableCell>
                    <TableCell className="capitalize">{p.paymentStatus || "-"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p._id}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="rounded-sm bg-[#4CAF50] text-white hover:bg-[#45A049]"
                            onClick={() => handlePayEmployee(p)}
                            disabled={!user?.flw_customer_id}
                          >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Pay Employee
                          </Button>
                          {(p.paymentStatus === "scheduled" || p.paymentStatus === "pending" || !p.paymentStatus) && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-sm border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white"
                              onClick={() => handleTriggerPayment(p._id)}
                              disabled={isTriggering && triggeringPayrollId === p._id}
                            >
                              <Send className="mr-2 h-4 w-4" />
                              {isTriggering && triggeringPayrollId === p._id ? "Triggering..." : "Trigger Payment"}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pay Employee Dialog */}
      <Dialog open={payEmployeeDialogOpen} onOpenChange={setPayEmployeeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pay Employee</DialogTitle>
          </DialogHeader>
          {!chargeResponse ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Paying: <strong>{selectedEmployeeForPayment?.userLabel || "Employee"}</strong>
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentAmount">Amount</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  min="200"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount (minimum 200)"
                  required
                />
                {Number(paymentAmount) > 0 && Number(paymentAmount) < 200 && (
                  <p className="text-xs text-red-600">Minimum amount is 200</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentCurrency">Currency</Label>
                <Select value={paymentCurrency} onValueChange={setPaymentCurrency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NGN">NGN (Nigerian Naira)</SelectItem>
                    <SelectItem value="USD">USD (US Dollar)</SelectItem>
                    <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                    <SelectItem value="EUR">EUR (Euro)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentReference">Reference</Label>
                <Input
                  id="paymentReference"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="Payment reference"
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPayEmployeeDialogOpen(false);
                    setChargeResponse(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-[#4CAF50] text-white hover:bg-[#45A049]"
                  onClick={handleCreateCharge}
                  disabled={isCreatingCharge || Number(paymentAmount) < 200 || !paymentAmount}
                >
                  {isCreatingCharge ? "Creating Charge..." : "Create Charge"}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border bg-green-50 p-4">
                <p className="text-sm font-medium text-green-800 mb-2">
                  Charge created successfully!
                </p>
                <p className="text-xs text-green-700">
                  An OTP has been sent to your email. Click "Next" to complete the payment process.
                </p>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPayEmployeeDialogOpen(false);
                    setChargeResponse(null);
                    queryClient.invalidateQueries({ queryKey: ["payroll-list"] });
                  }}
                >
                  Close
                </Button>
                <Button
                  className="bg-[#4CAF50] text-white hover:bg-[#45A049]"
                  onClick={handleCompletePayment}
                  disabled={!chargeResponse?.next_action?.redirect_url?.url}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Next - Complete Payment
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};

const PaymentStatusHandler = () => {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const success = searchParams.get("payment_success");

  useEffect(() => {
    if (success === "true") {
      toast.success("Payment processed successfully!");
      // Refresh current payroll lists
      queryClient.invalidateQueries({ queryKey: ["payroll-list"] });
      queryClient.invalidateQueries({
        queryKey: ["payroll"]
      });

      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete("payment_success");
      window.history.replaceState({}, "", url.toString());
    }
  }, [success, queryClient]);

  return null;
};

export default ReportingPayroll;
