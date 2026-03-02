import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import React from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { FeatureComparison } from "@/types";

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
    name: "Free Plan",
    tagline: "Perfect for individuals",
    price: "$0/month",
    features: [
      "1 Active Project",
      "Basic Milestone & Task Tracking",
      "Manual Time Logging",
      "Simple Dashboard & Alerts",
      "File Uploads (5 files max, 10MB each)",
      "1 Team Member",
    ],
    buttonText: "Start for free",
  },
  {
    name: "Basic Plan",
    tagline: "For growing teams",
    price: "$9.99/month",
    yearly: "or $99/year (save 17%)",
    features: [
      "Everything in Free PLUS:",
      "Up to 5 Projects",
      "Subtasks, Priorities, Dependencies",
      "Automated Time Tracking",
      "Admin Work Logs",
      "Performance Reports",
      "Up to 3 Team Members",
      "Custom Roles & Permissions",
    ],
    buttonText: "Choose Basic Plan",
  },
  {
    name: "Premium Plan",
    tagline: "For professional teams",
    price: "$19.99/month",
    yearly: "or $199/year (save 17%)",
    features: [
      "Everything in Basic PLUS:",
      "Unlimited Projects",
      "Task Automations",
      "Payroll-Ready Time Reports",
      "Client Feedback Integration",
      "Invoice & Payment Tracking",
      "Slack, Jira, Payroll Integrations",
      "Up to 5 Team Members",
      "Advanced Admin Controls",
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
      className={`max-w-md space-y-8 rounded-md bg-white p-6 py-12 ${
        isPaidPlan ? "shadow-xl" : ""
      }`}
    >
      <div className="mx-auto space-y-3 text-center">
        {isPremium && (
          <span className="rounded-full bg-[#EDE9FE] p-2 text-[12px] text-[#6D28D9]">
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
            className={`text-[12px] ${isPremium ? "text-[#6D28D9]" : "text-[#4CAF50]"}`}
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
              />
              <span className="text-sm text-[#333333]">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="w-full">
        <Button
          className={`w-full cursor-pointer rounded-sm py-4 font-semibold text-[#1F2937] ${isBasic ? "bg-[#4CAF50] text-white" : isPremium ? "bg-[#6D28D9] text-white" : "bg-[#F3F4F6]"}`}
        >
          {plan.buttonText}
        </Button>
      </div>
    </div>
  );
};

const Premium = () => {
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
      free: "Basic",
      basic: "Advanced",
      premium: "Premium",
    },
    {
      features: "Reporting",
      free: "Basic",
      basic: "Advanced",
      premium: "Custom",
    },
  ];

  return (
    <div className="space-y-12 px-4 py-5">
      <section className="mx-auto max-w-[480px] space-y-3 text-center">
        <h2 className="text-lg font-semibold text-[#333C33] md:text-xl lg:text-3xl">
          Choose Your Perfect Plan
        </h2>
        <p className="text-[#4B5563] text-base">
          Select the plan that best fits your team&apos;s needs and start
          managing projects more efficiently today.
        </p>
      </section>
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => (
          <PlanComp key={plan.name} plan={plan} />
        ))}
      </section>
      <section className="rounded-lg bg-white px-2 py-8">
        <p className="mx-auto mb-10 text-center text-xl font-semibold">
          Detailed Features Comparison
        </p>
        <DataTable columns={columns} data={tableData} />
      </section>
    </div>
  );
};

export default Premium;

