import board from "@/public/icons/board-regular.svg";
import calendar from "@/public/icons/calender.svg";
import cautionSign from "@/public/icons/caution-sign.svg";
import time from "@/public/icons/time-regular.svg";
import notepad from "@/public/icons/notepad-regular.svg";
import activeBoard from "@/public/icons/active-board.svg";
import activeCalendar from "@/public/icons/active-calender.svg";
import activeCautionSign from "@/public/icons/active-caution-sign.svg";
import activeTime from "@/public/icons/active-time.svg";
import activeNote from "@/public/icons/active-notepad.svg";
import SummaryComp from "@/components/teamDashboard/SummaryComp";

export const sidebarLinks = [
  {
    activeImgURL: "/icons/mynaui_home.svg",
    imgURL: "/icons/dashboard_inactive.svg",
    route: "/team/dashboard",
    label: "Dashboard",
  },
  {
    imgURL: "/icons/octicon_project-24.svg",
    route: "/team/time-tracking",
    label: "Time tracking",
    activeImgURL: "/icons/tracking_active.svg",
  },
  {
    imgURL: "/icons/pepicons-pencil_people.svg",
    activeImgURL: "/icons/task_active.svg",
    route: "/team/tasks",
    label: "My task",
    subRoutes: [
      {
        label: "Activity Log",
        route: "/team/tasks/activity-log",
      },
      // {
      //   label: "Assigned Tasks",
      //   route: "/team/tasks/assigned",
      // },
    ],
  },
  {
    imgURL: "/icons/stash_billing-info.svg",
    activeImgURL: "/icons/payment_active.svg",
    route: "/team/payment",
    label: "Payments",
  },
  {
    imgURL: "/icons/iconamoon_location-light.svg",
    activeImgURL: "/icons/notification_active.svg",
    route: "/team/notifications",
    label: "Notification & Alerts",
  },
  {
    activeImgURL: "/icons/settings_active.svg",
    imgURL: "/icons/solar_settings-linear.svg",
    route: "/team/settings",
    label: "Settings",
  },
];

export const adminSidebarLinks = [
  {
    activeImgURL: "/icons/mynaui_home.svg",
    imgURL: "/icons/dashboard_inactive.svg",
    route: "/admin/dashboard",
    label: "Dashboard",
  },
  {
    activeImgURL: "/icons/project_active.svg",
    imgURL: "/icons/octicon_project-24.svg",
    route: "/admin/project-management",
    label: "Project Management",
  },
  {
    activeImgURL: "/icons/people_active.svg",
    imgURL: "/icons/pepicons-pencil_people.svg",
    route: "/admin/people",
    label: "People",
    // subRoutes: [
    //   {
    //     label: "Activity Log",
    //     route: "/admin/tasks/activity-log",
    //   },
    // {
    //   label: "Assigned Tasks",
    //   route: "/team/tasks/assigned",
    // },
    // ],
  },
  {
    activeImgURL: "/icons/report_active.svg",
    imgURL: "/icons/stash_billing-info.svg",
    route: "/admin/reporting-payroll",
    label: "Reporting and payroll",
  },
  {
    activeImgURL: "/icons/activity_active.svg",
    imgURL: "/icons/activity.svg",
    route: "/admin/activity",
    label: "Activity",
  },
  {
    activeImgURL: "/icons/time_active.svg",
    imgURL: "/icons/time_sheet.svg",
    route: "/admin/time-sheet",
    label: "Time Sheet",
  },
  {
    activeImgURL: "/icons/billing_active.svg",
    imgURL: "/icons/billing.svg",
    route: "/admin/billing-subscription",
    label: "Billing & Premium",
  },
  {
    activeImgURL: "/icons/settings_active.svg",
    imgURL: "/icons/solar_settings-linear.svg",
    route: "/admin/settings",
    label: "Settings",
  },
];

export const mainTabs = [
  {
    name: "Summary",
    value: "/",
    icon: notepad,
    activeIcon: activeNote,
  },
  {
    name: "Board",
    value: "/board",
    icon: board,
    activeIcon: activeBoard,
  },
  {
    name: "Calendar",
    value: "/calendar",
    icon: calendar,
    activeIcon: activeCalendar,
  },
  {
    name: "Issues",
    value: "/issues",
    icon: cautionSign,
    activeIcon: activeCautionSign,
  },
  {
    name: "Live Timer Widget",
    value: "/widgets",
    icon: time,
    activeIcon: activeTime,
  },
];

export const settingsTabs = [
  { name: "Profile", value: "/", icon: notepad, activeIcon: activeNote },
  {
    name: "Email",
    value: "/calendar",
    icon: calendar,
    activeIcon: activeCalendar,
  },
  {
    name: "Security",
    value: "/issues",
    icon: cautionSign,
    activeIcon: activeCautionSign,
  },
  {
    name: "Account preferences",
    value: "/widgets",
    icon: time,
    activeIcon: activeTime,
  },
];

export const dropdownTabs = [
  {
    name: "Live Timer Widget",
    value: "/widgets",
    icon: time,
    activeIcon: activeTime,
    content: SummaryComp,
  },
];
