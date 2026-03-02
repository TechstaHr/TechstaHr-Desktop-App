"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PaystackForm from "@/components/PaystackForm";
import toast from "react-hot-toast";
import {
  createBillingInfo,
  getBillingInfo,
  updateBillingInfo,
  listBanks,
} from "@/lib/actions/billing.actions";
import { BillingInfo, BankInfo } from "@/types";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getUserId } from "@/lib/auth";

const Billing = () => {
  const [form, setForm] = useState<BillingInfo>({
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

  const queryClient = useQueryClient();
  const { data: banks = [] } = useQuery({ queryKey: ["banks"], queryFn: listBanks });

  const {
    data: billingData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["billing-info"],
    queryFn: getBillingInfo,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const isCreating = isError || !billingData;

  const createMutation = useMutation({
    mutationFn: createBillingInfo,
    onSuccess: (data) => {
      toast.success(data?.message || "Billing info created successfully");
      queryClient.invalidateQueries({ queryKey: ["billing-info"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to create billing info");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateBillingInfo,
    onSuccess: (data) => {
      toast.success(data?.message || "Billing info updated successfully");
      queryClient.invalidateQueries({ queryKey: ["billing-info"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to update billing info");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (["street", "city", "state", "postalCode", "country"].includes(id)) {
      setForm((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [id]: value,
        },
      }));
    } else if (["accountName", "accountNumber"].includes(id)) {
      setForm((prev) => ({
        ...prev,
        bankDetail: {
          ...prev.bankDetail!,
          [id]: value,
        },
      }));
    } else {
      setForm((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleBankSelect = (bankId: string) => {
    setForm((prev) => ({
      ...prev,
      bankDetail: {
        ...prev.bankDetail!,
        bankId,
      },
    }));
  };

  const handleCurrencySelect = (currency: string) => {
    setForm((prev) => ({
      ...prev,
      bankDetail: {
        ...prev.bankDetail!,
        currency,
      },
    }));
  };

  const handlePayRateSelect = (payRate: string) => {
    setForm((prev) => ({
      ...prev,
      payRate,
    }));
  };

  const handleSave = async () => {
    const userIdValue = getUserId();
    if (!userIdValue) {
      toast.error("User ID not found");
      return;
    }

    const billingData: BillingInfo = {
      ...form,
      userId: userIdValue,
    };

    if (isCreating) {
      createMutation.mutate(billingData);
    } else {
      updateMutation.mutate(billingData);
    }
  };

  useEffect(() => {
    if (billingData && !isError) {
      setForm({
        companyName: billingData.companyName || "",
        taxId: billingData.taxId || "",
        billingEmail: billingData.billingEmail || "",
        phoneNumber: billingData.phoneNumber || "",
        address: billingData.address || {
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
        },
        bankDetail: billingData.bankDetail || {
          currency: "NGN",
          accountName: "",
          accountNumber: "",
          bankId: "",
        },
        payRate: billingData.payRate || "monthly",
      });
    }
  }, [billingData, isError]);

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const getButtonText = () => {
    if (isSaving) {
      return isCreating ? "Creating..." : "Updating...";
    }
    return isCreating ? "Save Information" : "Update Information";
  };

  return (
    <div className="max-w-5xl space-y-8 px-4 py-6">
      {/* Payment Methods */}
      <PaystackForm />

      {/* Auto-Renewal */}
      <Card className="flex items-center justify-between bg-white p-4">
        <div>
          <h3 className="font-medium">Auto-Renewal</h3>
          <p className="text-sm text-muted-foreground">
            Your subscription will automatically renew on May 15, 2025
          </p>
        </div>
        <Switch defaultChecked className="data-[state=checked]:bg-[#4CAF50]" />
      </Card>

      {/* Billing Contact Information */}
      <Card className="space-y-6 bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Billing Contact Information</h2>
          {isLoading && (
            <div className="text-sm text-muted-foreground">Loading...</div>
          )}
          {isCreating && !isLoading && (
            <div className="text-sm text-blue-600">
              Creating new billing info
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={form.companyName}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="taxId">Tax ID/VAT Number</Label>
            <Input
              id="taxId"
              value={form.taxId}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="billingEmail">Billing Email</Label>
            <Input
              id="billingEmail"
              value={form.billingEmail}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-base font-semibold">Billing Address</Label>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Input
                id="street"
                value={form.address.street}
                onChange={handleChange}
                placeholder="Street Address"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Input
                id="city"
                value={form.address.city}
                onChange={handleChange}
                placeholder="City"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Input
                id="state"
                value={form.address.state}
                onChange={handleChange}
                placeholder="State/Province"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Input
                id="postalCode"
                value={form.address.postal_code}
                onChange={handleChange}
                placeholder="Postal Code"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Input
                id="country"
                value={form.address.country}
                onChange={handleChange}
                placeholder="Country"
                disabled={isLoading}
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
              <Select value={form.bankDetail?.currency} onValueChange={handleCurrencySelect}>
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
              <Select value={form.bankDetail?.bankId} onValueChange={handleBankSelect}>
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
                value={form.bankDetail?.accountName || ""}
                onChange={handleChange}
                placeholder="Enter account name"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                value={form.bankDetail?.accountNumber || ""}
                onChange={handleChange}
                placeholder="Enter account number"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Pay Rate */}
        <div className="space-y-2">
          <Label htmlFor="payRate">Pay Rate</Label>
          <Select value={form.payRate} onValueChange={handlePayRateSelect}>
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

        <div className="flex justify-end gap-4">
          <Button variant="outline" className="rounded-sm">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="rounded-sm bg-[#4CAF50] text-white hover:bg-green-700"
          >
            {getButtonText()}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Billing;

