"use client";
import { PaymentCard } from "@/components/PaymentCard";
import PaymentNav from "@/components/PaymentNav";
import React, { useMemo, useState, useEffect } from "react";
import hourglass from "@/public/icons/hour-glass.svg";
import nairaImg from "@/public/icons/naira.svg";
import time from "@/public/icons/time.svg";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWeeklyTimeSheet, getTimesheets } from "@/lib/actions/timesheet.actions";
import { getBillingInfo, listPayrolls, createTeamBillingInfo, listBanks, updateBillingInfo } from "@/lib/actions/billing.actions";
import { useUserStore } from "@/store/userStore";
import { getTimeSheet } from "@/lib/actions/timer.actions";
import { getUserById } from "@/lib/actions/user.actions";
import { Wallet } from "@/types";
import { format } from "date-fns";
import { Wallet as WalletIcon, Building2, CreditCard, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BillingInfo, BankInfo } from "@/types";
import { getUserId } from "@/lib/auth";
import toast from "react-hot-toast";

const useWeeklyHours = () => {
  const { data } = useQuery({ queryKey: ["weekly-timesheet"], queryFn: getTimeSheet });
  const hours = useMemo(() => {
    const entries = Array.isArray(data) ? (data as any[]) : [];
    const total = entries.reduce((sum, e) => sum + (e?.totalHours || 0), 0);
    return +total.toFixed(2);
  }, [data]);
  return hours;
};

const Payments = () => {
  const weeklyHours = useWeeklyHours();
  const { data: billing } = useQuery({ queryKey: ["billing-info"], queryFn: getBillingInfo });
  const user = useUserStore((state) => state.user);
  const userId = user?._id || "";
  const { data: payrolls = [] } = useQuery({ queryKey: ["payrolls"], queryFn: listPayrolls });
  const { data: banks = [] } = useQuery({ queryKey: ["banks"], queryFn: listBanks });
  const { data: userDetails } = useQuery({
    queryKey: ["user-details", userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
    staleTime: 30 * 1000, // Refresh every 30 seconds to get updated wallet
  });
  const queryClient = useQueryClient();

  const hasFlwCustomerId = !!user?.flw_customer_id;

  const [billingForm, setBillingForm] = useState<BillingInfo>({
    companyName: "",
    taxId: "",
    billingEmail: "",
    phoneNumber: "",
    address: {
      street: "",
      city: "",
      state: "",
      postal_code: "",
      country: "",
    },
    bankDetail: {
      currency: "NGN",
      accountName: "",
      accountNumber: "",
      bankId: "",
    },
    payRate: "monthly",
  });

  useEffect(() => {
    if (billing) {
      setBillingForm({
        companyName: billing.companyName || "",
        taxId: billing.taxId || "",
        billingEmail: billing.billingEmail || "",
        phoneNumber: billing.phoneNumber || "",
        address: billing.address || {
          street: "",
          city: "",
          state: "",
          postal_code: "",
          country: "",
        },
        bankDetail: billing.bankDetail || {
          currency: "NGN",
          accountName: "",
          accountNumber: "",
          bankId: "",
        },
        payRate: billing.payRate || "monthly",
      });
    }
  }, [billing]);

  const createBillingMutation = useMutation({
    mutationFn: createTeamBillingInfo,
    onSuccess: (data) => {
      toast.success(data?.message || "Billing info created successfully");
      queryClient.invalidateQueries({ queryKey: ["billing-info"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to create billing info");
    },
  });

  const updateBillingMutation = useMutation({
    mutationFn: updateBillingInfo,
    onSuccess: (data) => {
      toast.success(data?.message || "Billing info updated successfully");
      queryClient.invalidateQueries({ queryKey: ["billing-info"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to update billing info");
    },
  });

  const isCreating = !billing;
  const isSaving = createBillingMutation.isPending || updateBillingMutation.isPending;

  const userPayrolls = useMemo(() => {
    return (payrolls as any[]).filter((p) => {
      const uid = typeof p.userId === "string" ? p.userId : p.userId?._id;
      return uid === userId;
    });
  }, [payrolls, userId]);

  const currencyFmt = useMemo(() => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }), []);
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
  const totalForMonth = useMemo(() => {
    return userPayrolls
      .filter((p) => {
        const d = new Date(p.createdAt);
        return `${d.getFullYear()}-${d.getMonth()}` === monthKey;
      })
      .reduce((sum, p) => sum + (p.amount ?? p.paymentAmount ?? 0), 0);
  }, [userPayrolls, monthKey]);

  const latestStatus = useMemo(() => {
    const sorted = [...userPayrolls].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sorted[0]?.paymentStatus || (billing ? "Pending" : "Setup Required");
  }, [userPayrolls, billing]);

  const walletBalance = useMemo(() => {
    if (!userDetails?.wallets || userDetails.wallets.length === 0) return null;
    const total = userDetails.wallets.reduce((sum: number, wallet: Wallet) => {
      return sum + (wallet.balance || wallet.amount || 0);
    }, 0);
    const currency = userDetails.wallets[0]?.currency || "NGN";
    return { total, currency };
  }, [userDetails]);

  const sortedWallets = useMemo(() => {
    if (!userDetails?.wallets) return [];
    return [...userDetails.wallets].sort((a: Wallet, b: Wallet) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA; // Most recent first
    });
  }, [userDetails]);

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (["street", "city", "state", "postalCode", "country"].includes(id)) {
      setBillingForm((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [id]: value,
        },
      }));
    } else if (["accountName", "accountNumber"].includes(id)) {
      setBillingForm((prev) => ({
        ...prev,
        bankDetail: {
          ...prev.bankDetail!,
          [id]: value,
        },
      }));
    } else {
      setBillingForm((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleBankSelect = (bankId: string) => {
    setBillingForm((prev) => ({
      ...prev,
      bankDetail: {
        ...prev.bankDetail!,
        bankId,
      },
    }));
  };

  const handleCurrencySelect = (currency: string) => {
    setBillingForm((prev) => ({
      ...prev,
      bankDetail: {
        ...prev.bankDetail!,
        currency,
      },
    }));
  };

  const handlePayRateSelect = (payRate: string) => {
    setBillingForm((prev) => ({
      ...prev,
      payRate,
    }));
  };

  const handleBillingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userIdValue = getUserId();
    if (!userIdValue) {
      toast.error("User ID not found");
      return;
    }

    const billingData: BillingInfo = {
      ...billingForm,
      userId: userIdValue,
    };

    if (isCreating) {
      createBillingMutation.mutate(billingData);
    } else {
      updateBillingMutation.mutate(billingData);
    }
  };

  if (!hasFlwCustomerId) {
    return (
      <div className="space-y-10 px-4">
        <h2 className="text-2xl font-medium text-[#333333]">Payments</h2>
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-yellow-800">Payment Setup Required</h3>
            <p className="text-yellow-700">
              Your payment account is not yet set up. Please contact your administrator to enable payments.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-10 px-4">
      <h2 className="text-2xl font-medium text-[#333333]">Payments</h2>
      <PaymentNav />
      <div className="grid grid-cols-1 items-center justify-between gap-5 lg:grid-cols-3">
        <PaymentCard title="Total Hours Tracked" text={`${weeklyHours} hours`} picture={hourglass} />
        <PaymentCard title="This Month's Payroll" text={currencyFmt.format(totalForMonth)} picture={nairaImg} />
        <PaymentCard title="Payment Status" text={latestStatus} picture={time} />
      </div>

      {/* Wallet & Transaction History */}
      {userDetails && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Wallet Balance */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#333333]">Wallet Balance</h3>
                <WalletIcon className="h-5 w-5 text-[#4CAF50]" />
              </div>
              {walletBalance ? (
                <div className="rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#6B7280]">Total Available Balance</p>
                      <p className="text-3xl font-bold text-[#333333]">
                        {walletBalance.currency} {walletBalance.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="mt-1 text-xs text-[#6B7280]">
                        {userDetails.wallets?.length || 0} {userDetails.wallets?.length === 1 ? "wallet" : "wallets"}
                      </p>
                    </div>
                    <TrendingUp className="h-12 w-12 text-green-500" />
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border bg-gray-50 p-4 text-center">
                  <p className="text-sm text-[#6B7280]">No wallet balance yet</p>
                  <p className="mt-1 text-xs text-[#9CA3AF]">Your wallet will be updated after successful payments</p>
                </div>
              )}
            </div>
          </Card>

          {/* Bank Details */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#333333]">Bank Details</h3>
                <Building2 className="h-5 w-5 text-[#4CAF50]" />
              </div>
              {userDetails.bank ? (
                <div className="space-y-3 rounded-lg border bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#6B7280]">Bank Name</span>
                    <span className="font-medium text-[#333333]">{userDetails.bank.bankName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#6B7280]">Country</span>
                    <span className="font-medium text-[#333333]">{userDetails.bank.country}</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border bg-gray-50 p-4 text-center">
                  <CreditCard className="mx-auto h-8 w-8 text-[#9CA3AF]" />
                  <p className="mt-2 text-sm text-[#6B7280]">No bank details available</p>
                  <p className="mt-1 text-xs text-[#9CA3AF]">Set up your billing information below</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Transaction History */}
      {userDetails?.wallets && userDetails.wallets.length > 0 && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#333333]">Transaction History</h3>
              <button
                onClick={() => queryClient.invalidateQueries({ queryKey: ["user-details", userId] })}
                className="text-sm text-[#4CAF50] hover:underline"
              >
                Refresh
              </button>
            </div>
            <div className="space-y-2">
              {sortedWallets.length > 0 ? (
                sortedWallets.map((wallet: Wallet, index: number) => (
                  <div key={wallet._id || index} className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full p-2 ${wallet.status === "completed" || wallet.status === "success" ? "bg-green-100" : wallet.status === "pending" ? "bg-yellow-100" : "bg-gray-100"}`}>
                        <WalletIcon className={`h-4 w-4 ${wallet.status === "completed" || wallet.status === "success" ? "text-green-600" : wallet.status === "pending" ? "text-yellow-600" : "text-gray-600"}`} />
                      </div>
                      <div>
                        <p className="font-medium text-[#333333]">
                          {wallet.transactionType === "credit" ? "Payment Received" : wallet.transactionType === "debit" ? "Payment Sent" : wallet.transactionType || "Transaction"}
                        </p>
                        <p className="text-xs text-[#6B7280]">
                          {wallet.createdAt ? format(new Date(wallet.createdAt), "MMM dd, yyyy 'at' HH:mm") : "Date not available"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${wallet.transactionType === "credit" ? "text-green-600" : "text-[#333333]"}`}>
                        {wallet.transactionType === "credit" ? "+" : wallet.transactionType === "debit" ? "-" : ""}
                        {wallet.currency || "NGN"} {wallet.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || wallet.balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                      </p>
                      {wallet.status && (
                        <p className="text-xs capitalize text-[#6B7280]">{wallet.status}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border bg-gray-50 p-4 text-center">
                  <p className="text-sm text-[#6B7280]">No transactions yet</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Billing Information Section */}
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-[#333333]">Billing Information</h3>
            <p className="text-sm text-[#6B7280] mt-1">
              Set up your billing information to receive payments
            </p>
          </div>

          <form onSubmit={handleBillingSubmit} className="space-y-6">


            {/* Address */}
            <div className="space-y-4">
              <h4 className="font-medium text-[#333333]">Address</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={billingForm.address.street}
                    onChange={handleBillingChange}
                    placeholder="Enter street address"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={billingForm.address.city}
                    onChange={handleBillingChange}
                    placeholder="Enter city"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={billingForm.address.state}
                    onChange={handleBillingChange}
                    placeholder="Enter state"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={billingForm.address.postal_code}
                    onChange={handleBillingChange}
                    placeholder="Enter postal code"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={billingForm.address.country}
                    onChange={handleBillingChange}
                    placeholder="Enter country"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="space-y-4">
              <h4 className="font-medium text-[#333333]">Bank Details</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={billingForm.bankDetail?.currency} onValueChange={handleCurrencySelect}>
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
                  <Label htmlFor="bankId">Bank</Label>
                  <Select value={billingForm.bankDetail?.bankId} onValueChange={handleBankSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {(banks as BankInfo[]).map((bank) => (
                        <SelectItem key={bank._id} value={bank._id}>
                          {bank.bankName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    value={billingForm.bankDetail?.accountName || ""}
                    onChange={handleBillingChange}
                    placeholder="Enter account name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={billingForm.bankDetail?.accountNumber || ""}
                    onChange={handleBillingChange}
                    placeholder="Enter account number"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Pay Rate */}
            <div className="space-y-2">
              <Label htmlFor="payRate">Pay Rate</Label>
              <Select value={billingForm.payRate} onValueChange={handlePayRateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pay rate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="rounded-sm bg-[#4CAF50] text-white hover:bg-[#45A049]"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : isCreating ? "Save Billing Info" : "Update Billing Info"}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default Payments;
