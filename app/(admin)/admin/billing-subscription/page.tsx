"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PaystackForm from "@/components/PaystackForm";
import toast from "react-hot-toast";
import {
    getUserProfile,
    editUserProfile,
} from "@/lib/actions/user.actions";
import {
    addPaymentMethod,
    listPaymentMethods,
    listBanks,
} from "@/lib/actions/billing.actions";
import { BillingInfo, FeatureComparison } from "@/types";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Check, CreditCard, FileText, Sparkles } from "lucide-react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUserId } from "@/lib/auth";

type Plan = {
    name: string;
    tagline: string;
    price: string;
    yearly?: string;
    features: string[];
    buttonText: string;
};

const plans: Plan[] = [
    {
        name: "Free Plan (Starter)",
        tagline: "Perfect for individuals or small teams looking to get started with basic project tracking.",
        price: "$0/month",
        features: [
            "1 Active Project",
            "Task Assignments",
            "Basic Milestone Tracking",
            "Manual Time Logging",
            "Basic Work Log Overview",
            "Project Overview Dashboard",
            "Task Completion Status",
            "Task Deadline Reminders",
            "5 Files per Project (Max 10MB each)",
            "Up to 1 Team Member",
            "Basic Roles (Admin, Member)",
        ],
        buttonText: "Current Plan",
    },
    {
        name: "Basic Plan",
        tagline: "Designed for growing teams that need better organization, automation, and time tracking.",
        price: "$9.99/month",
        yearly: "or $99/year (save 17%)",
        features: [
            "Everything in Free, PLUS:",
            "Up to 5 Active Projects",
            "Advanced Task (Subtasks, Dependencies)",
            "Unlimited Milestone Tracking",
            "Automated Time Tracking",
            "Work Log Review for Admins",
            "Performance Metrics for Each Member",
            "Detailed Task Completion Reports",
            "Automated Task & Deadline Alerts",
            "Project Progress Updates",
            "20 Files per Project (Max 50MB each)",
            "Up to 3 Team Members",
            "Custom User Roles & Permissions",
        ],
        buttonText: "Choose Basic Plan",
    },
    {
        name: "Premium Plan",
        tagline: "Built for fast-moving teams that need unlimited projects, automated workflows, and payment tracking.",
        price: "$19.99/month",
        yearly: "or $199/year (save 17%)",
        features: [
            "Everything in Basic, PLUS:",
            "Unlimited Active Projects",
            "Task Automations (Recurring, Bulk)",
            "Daily & Weekly Timesheet Reports",
            "Payroll-Ready Time Tracking",
            "Customizable Reports & Insights",
            "Client Feedback Integration",
            "Track Invoices & Approvals",
            "Automated Payment Reminders",
            "Slack & Email Alerts for Deadlines",
            "Client Feedback Notifications",
            "Unlimited File Uploads (Max 100MB each)",
            "Integrate Slack, Jira, & Payroll",
            "5 Team Members",
            "Advanced Permissions & Controls",
        ],
        buttonText: "Choose Premium Plan",
    },
];

const PlanComp = ({ plan }: { plan: Plan }) => {
    const isPaidPlan = plan.name === "Basic Plan" || plan.name === "Premium Plan";
    const isPremium = plan.name === "Premium Plan";
    const isBasic = plan.name === "Basic Plan";

    return (
        <div
            className={`max-w-md space-y-8 rounded-lg bg-white p-6 py-12 transition-all hover:shadow-2xl ${isPaidPlan ? "shadow-xl" : "shadow-md"
                }`}
        >
            <div className="mx-auto space-y-3 text-center">
                {isPremium && (
                    <span className="inline-block rounded-full bg-[#EDE9FE] px-3 py-1 text-[12px] font-medium text-[#6D28D9]">
                        Most Popular
                    </span>
                )}
                <p className="text-xl font-semibold">{plan.name}</p>
                <p className="text-base text-[#6B7280]">{plan.tagline}</p>
                <p className="text-[#6B7280]">
                    <span className="text-3xl font-bold text-black">{plan.price}</span>
                </p>
                {plan.yearly && (
                    <p
                        className={`text-[12px] font-medium ${isPremium ? "text-[#6D28D9]" : "text-[#4CAF50]"}`}
                    >
                        {plan.yearly}
                    </p>
                )}
            </div>

            <div>
                <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                            <Check
                                stroke={`${isPremium ? "#6D28D9" : "#10B981"}`}
                                size={16}
                                className="flex-shrink-0"
                            />
                            <span className="text-sm text-[#333333]">{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="w-full">
                <Button
                    className={`w-full cursor-pointer rounded-sm py-4 font-semibold transition-all ${isBasic
                        ? "bg-[#4CAF50] text-white hover:bg-[#45A049]"
                        : isPremium
                            ? "bg-[#6D28D9] text-white hover:bg-[#5B21B6]"
                            : "bg-[#F3F4F6] text-[#1F2937] hover:bg-[#E5E7EB]"
                        }`}
                >
                    {plan.buttonText}
                </Button>
            </div>
        </div>
    );
};

const BillingSubscription = () => {
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
    });

    const [bankForm, setBankForm] = useState({
        name: "",
        number: "",
        bank_code: "",
    });

    const queryClient = useQueryClient();

    const {
        data: billingData,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["user-profile"],
        queryFn: getUserProfile,
        staleTime: 5 * 60 * 1000,
        retry: false,
    });

    const { data: paymentMethodsData, isLoading: isLoadingPaymentMethods } = useQuery({
        queryKey: ["payment-methods"],
        queryFn: listPaymentMethods,
    });

    const { data: banks } = useQuery({
        queryKey: ["banks"],
        queryFn: listBanks,
    });

    const isCreating = isError || !billingData;

    const mutation = useMutation({
        mutationFn: editUserProfile,
        onSuccess: (data) => {
            toast.success(data.message || "Information updated successfully");
            queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to update information");
        },
    });

    const addPaymentMethodMutation = useMutation({
        mutationFn: addPaymentMethod,
        onSuccess: (data) => {
            toast.success(data.message || "Payment method added successfully");
            setBankForm({ name: "", number: "", bank_code: "" });
            queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to add payment method");
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        if (["street", "city", "state", "postal_code", "country"].includes(id)) {
            setForm((prev) => ({
                ...prev,
                address: {
                    ...prev.address,
                    [id]: value,
                },
            }));
        } else {
            setForm((prev) => ({ ...prev, [id]: value }));
        }
    };

    const handleSave = async () => {
        const formData = new FormData();
        formData.append("companyName", form.companyName);
        formData.append("taxId", form.taxId);
        formData.append("billingEmail", form.billingEmail);
        formData.append("phoneNumber", form.phoneNumber);
        formData.append("address[street]", form.address.street);
        formData.append("address[city]", form.address.city);
        formData.append("address[state]", form.address.state);
        formData.append("address[postal_code]", form.address.postal_code);
        formData.append("address[country]", form.address.country);

        mutation.mutate(formData);
    };

    const handleAddBank = () => {
        if (!bankForm.name || !bankForm.number || !bankForm.bank_code) {
            toast.error("Please fill in all bank details");
            return;
        }

        addPaymentMethodMutation.mutate({
            type: "bank_account",
            bank_account: {
                name: bankForm.name,
                number: bankForm.number,
                bank_code: bankForm.bank_code,
            },
            is_default: true,
        });
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
                    postal_code: "",
                    country: "",
                },
            });
        }
    }, [billingData, isError]);

    const isSaving = mutation.isPending;
    const getButtonText = () => {
        if (isSaving) {
            return "Saving...";
        }
        return "Save Information";
    };

    const tableData: FeatureComparison[] = [
        {
            features: "Active Projects",
            free: "1",
            basic: "5",
            premium: "Unlimited",
        },
        {
            features: "Team Members",
            free: "1",
            basic: "3",
            premium: "5",
        },
        {
            features: "File Storage",
            free: "5 Files (10MB)",
            basic: "20 Files (50MB)",
            premium: "Unlimited (100MB)",
        },
        {
            features: "Time Tracking",
            free: "Manual",
            basic: "Automated",
            premium: "Payroll-Ready",
        },
        {
            features: "Reporting",
            free: "Basic Dashboard",
            basic: "Performance Reports",
            premium: "Custom Insights",
        },
    ];

    return (
        <div className="space-y-8 px-4 py-6">
            {/* Page Header */}
            <div className="space-y-2">
                <h1 className="text-2xl font-bold text-[#333C33] md:text-3xl">
                    Billing & Subscription
                </h1>
                <p className="text-base text-[#6B7280]">
                    Manage your subscription plans, payment methods, and billing information
                </p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="plans" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
                    <TabsTrigger value="plans" className="gap-2">
                        <Sparkles className="h-4 w-4" />
                        <span className="hidden sm:inline">Subscription Plans</span>
                        <span className="sm:hidden">Plans</span>
                    </TabsTrigger>
                    <TabsTrigger value="payment" className="gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span className="hidden sm:inline">Payment Methods</span>
                        <span className="sm:hidden">Payment</span>
                    </TabsTrigger>
                    <TabsTrigger value="billing" className="gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="hidden sm:inline">Billing Information</span>
                        <span className="sm:hidden">Billing</span>
                    </TabsTrigger>
                </TabsList>

                {/* Subscription Plans Tab */}
                <TabsContent value="plans" className="space-y-8 mt-8">
                    <div className="mx-auto max-w-[580px] space-y-3 text-center">
                        <h2 className="text-xl font-semibold text-[#333C33] md:text-2xl">
                            Choose Your Perfect Plan
                        </h2>
                        <p className="text-base text-[#6B7280]">
                            Select the plan that best fits your team&apos;s needs and start
                            managing projects more efficiently today.
                        </p>
                    </div>

                    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                        {plans.map((plan) => (
                            <PlanComp key={plan.name} plan={plan} />
                        ))}
                    </div>


                </TabsContent>

                {/* Payment Methods Tab */}
                <TabsContent value="payment" className="space-y-8 mt-8">
                    <div className="mx-auto max-w-[580px] space-y-3 text-center">
                        <h2 className="text-xl font-semibold text-[#333C33] md:text-2xl">
                            Payment Methods
                        </h2>
                        <p className="text-base text-[#6B7280]">
                            Manage your payment methods and subscription settings
                        </p>
                    </div>

                    <div className="mx-auto max-w-3xl space-y-6">
                        <Card className="bg-white p-6 shadow-sm space-y-4">
                            <h3 className="text-lg font-semibold text-[#333333]">Add Bank Account</h3>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="bank_name">Account Name</Label>
                                    <Input
                                        id="bank_name"
                                        value={bankForm.name}
                                        onChange={(e) => setBankForm(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Enter account name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bank_number">Account Number</Label>
                                    <Input
                                        id="bank_number"
                                        value={bankForm.number}
                                        onChange={(e) => setBankForm(prev => ({ ...prev, number: e.target.value }))}
                                        placeholder="Enter account number"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bank_code">Select Bank</Label>
                                    <Select
                                        value={bankForm.bank_code}
                                        onValueChange={(val) => setBankForm(prev => ({ ...prev, bank_code: val }))}
                                    >
                                        <SelectTrigger id="bank_code">
                                            <SelectValue placeholder="Select bank" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {banks?.map((bank: any) => (
                                                <SelectItem key={bank._id || bank.code} value={bank.code}>
                                                    {bank.bankName || bank.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button
                                onClick={handleAddBank}
                                disabled={addPaymentMethodMutation.isPending}
                                className="w-full md:w-auto bg-[#4CAF50] text-white hover:bg-[#45A049]"
                            >
                                {addPaymentMethodMutation.isPending ? "Adding..." : "Add Bank Account"}
                            </Button>
                        </Card>

                        {paymentMethodsData?.data && paymentMethodsData.data.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-[#333333]">Your Payment Methods</h3>
                                <div className="grid gap-4">
                                    {paymentMethodsData.data.map((pm: any) => (
                                        <Card key={pm._id} className="bg-white p-4 shadow-sm flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="rounded-full bg-[#F3F4F6] p-2">
                                                    <CreditCard className="h-5 w-5 text-[#6B7280]" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">
                                                        {pm.type === "bank_account"
                                                            ? `${pm.bank.bank_code} •••• ${pm.bank.account_number_last4}`
                                                            : `${pm.card.brand} •••• ${pm.card.last4}`}
                                                    </p>
                                                    <p className="text-sm text-[#6B7280]">
                                                        {pm.type === "bank_account" ? pm.bank.account_name : pm.card.card_holder_name}
                                                    </p>
                                                </div>
                                            </div>
                                            {pm.is_default && (
                                                <span className="rounded-full bg-[#E8F5E9] px-2 py-1 text-xs font-medium text-[#2E7D32]">
                                                    Default
                                                </span>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* <PaystackForm />

                        <Card className="flex items-center justify-between bg-white p-6 shadow-sm">
                            <div className="space-y-1">
                                <h3 className="font-semibold">Auto-Renewal</h3>
                                <p className="text-sm text-muted-foreground">
                                    Your subscription will automatically renew on May 15, 2025
                                </p>
                            </div>
                            <Switch
                                defaultChecked
                                className="data-[state=checked]:bg-[#4CAF50]"
                            />
                        </Card> */}
                    </div>
                </TabsContent>

                {/* Billing Information Tab */}
                <TabsContent value="billing" className="space-y-8 mt-8">
                    <div className="mx-auto max-w-[580px] space-y-3 text-center">
                        <h2 className="text-xl font-semibold text-[#333C33] md:text-2xl">
                            Billing Contact Information
                        </h2>
                        <p className="text-base text-[#6B7280]">
                            Update your company details and billing address
                        </p>
                    </div>

                    <Card className="mx-auto max-w-3xl space-y-6 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-[#333333]">Billing Information</h3>
                            {isLoading && (
                                <div className="text-sm text-muted-foreground">Loading...</div>
                            )}
                        </div>

                        {/* <div className="space-y-4">
                            <h4 className="font-medium text-[#333333]">Company Details</h4>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="companyName">Company Name</Label>
                                    <Input
                                        id="companyName"
                                        value={form.companyName}
                                        onChange={handleChange}
                                        placeholder="Enter company name"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="taxId">Tax ID (Optional)</Label>
                                    <Input
                                        id="taxId"
                                        value={form.taxId}
                                        onChange={handleChange}
                                        placeholder="Enter Tax ID"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="billingEmail">Billing Email</Label>
                                    <Input
                                        id="billingEmail"
                                        type="email"
                                        value={form.billingEmail}
                                        onChange={handleChange}
                                        placeholder="Enter billing email"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber">Phone Number</Label>
                                    <Input
                                        id="phoneNumber"
                                        value={form.phoneNumber}
                                        onChange={handleChange}
                                        placeholder="Enter phone number"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </div> */}

                        <div className="space-y-4 pt-4 border-t">
                            <h4 className="font-medium text-[#333333]">Address</h4>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="street">Street Address</Label>
                                    <Input
                                        id="street"
                                        value={form.address.street}
                                        onChange={handleChange}
                                        placeholder="Enter street address"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        value={form.address.city}
                                        onChange={handleChange}
                                        placeholder="City"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="state">State/Province</Label>
                                    <Input
                                        id="state"
                                        value={form.address.state}
                                        onChange={handleChange}
                                        placeholder="State/Province"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="postal_code">Postal Code</Label>
                                    <Input
                                        id="postal_code"
                                        value={form.address.postal_code}
                                        onChange={handleChange}
                                        placeholder="Postal Code"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="country">Country</Label>
                                    <Select
                                        value={form.address.country}
                                        onValueChange={(val) => setForm(prev => ({
                                            ...prev,
                                            address: { ...prev.address, country: val }
                                        }))}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select country" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="NG">Nigeria</SelectItem>
                                            <SelectItem value="US">United States</SelectItem>
                                            <SelectItem value="UK">United Kingdom</SelectItem>
                                            <SelectItem value="CA">Canada</SelectItem>
                                            <SelectItem value="DE">Germany</SelectItem>
                                            <SelectItem value="FR">France</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || isLoading}
                                className="rounded-sm bg-[#4CAF50] text-white hover:bg-[#45A049]"
                            >
                                {getButtonText()}
                            </Button>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div >
    );
};

export default BillingSubscription;
