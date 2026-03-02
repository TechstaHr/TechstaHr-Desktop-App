declare type _user = {
  _id: string;
  full_name: string;
  email: string;
  password: string;
  role: string;
  role_title?: string;

  region?: string;
  local_time?: string;

  avatar: string;
  first_name?: string;
  last_name?: string;
  isOnline: true;
  createdAt?: string;
  updatedAt?: string;
  __v: 0;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  flw_customer_id?: string;
  wallets?: Wallet[];
  bank?: {
    _id: string;
    bankName: string;
    code: string;
    currency: string;
    country: string;
    createdAt: string;
    updatedAt: string;
  };
  billingEmail?: string;
  companyName?: string;
  payRate?: string;
  phoneNumber?: string;
  taxId?: string;
};

export interface Wallet {
  _id?: string;
  amount?: number;
  currency?: string;
  balance?: number;
  transactionType?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SelectOption = _user & {
  label: string;
  value: string;
};

declare type userResponse = {
  users: _user;
};

declare interface signInProps {
  email?: string;
  password?: string;
  team_name?: string;
  keepMeLoggedIn?: boolean;
}

declare interface createUserProps {
  full_name: string;
  email: string;
  password: string;
  role: string;
  role_title: string;
}

declare interface InviteUserProps {
  full_name: string;
  email: string;
  role: string;
  frontend_url: string;
  role_title?: string;
}

declare interface resetPasswordProps {
  email?: string;
  otp?: string;
  newPassword?: string;
  currentPassword?: string;
}

declare interface createAdminProps {
  email: string;
  role_title: string;
  password: string;
  full_name: string;
}

declare interface TaskPayload {
  _id?: string;
  title: string;
  description: string;
  deadline: string;
  priority_tag: string;
  task_link: string;
  status: string;
  project: string;
}

declare interface updateTaskPayload {
  _id?: string;
  title?: string;
  description?: string;
  deadline?: string;
  priority_tag?: string;
  task_link?: string;
  status?: string;
  project?: string;
}

declare interface NotificationPreferences {
  email_notification: boolean;
  comment_notification: boolean;
  task_assigned_notification: boolean;
  project_invitation_notification: boolean;
}

declare interface NotificationPayload {
  recipientId: string;
  type: string;
  message: string;
  link: string;
}

declare interface NotificationActions {
  label: string;
  url: string;
  _id: string;
}

declare interface NotificationProps {
  _id: string;
  actions: NotificationActions[];
  recipient: string;
  type: "task_assigned" | "comment" | "project_invitation" | string; // extend as needed
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
}

declare interface FeatureComparison {
  features: string;
  free: string;
  basic: string;
  premium: string;
}

export type ColumnType = "to_do" | "in_progress" | "done";

// export interface Task {
//   id: string;
//   title: string;
//   description: string;
//   tag: string;
//   due: string;
//   tagColor: string;
//   blocked?: boolean;
// }

export interface TaskProps {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  priority_tag: string;
  status: string;
  owner: any;
  task_link: string;
  createdAt: string;
  updatedAt: string;
  screenshotIntervalMinutes: number;
  enableScreenshot: boolean;
}

export type Columns = Record<ColumnType, Task[]>;

// Payload type for project creation
export interface ProjectPayload {
  name: string;
  description: string;
  deadline: string;
  teamMembers: string[];
}

declare interface ProductivityProps {
  userId: string;
  productivity: {
    Monday: number;
    Tuesday: number;
    Wednesday: number;
    Thursday: number;
    Friday: number;
  };
}

type SidebarProps = {
  activeImgURL: string;
  imgURL: string;
  route: string;
  label: string;
  subRoutes?: {
    label: string;
    route: string;
  }[];
};

export interface TeamMember {
  _id: string;
  full_name: string;
  avatar: string;
  email: string;
  role: string;
  status: string;
  user: _user;
}

export interface Issue {
  title: string;
  description: string;
  status: string;
  raisedBy: string;
  message: string;
  resolved: boolean;
  _id: string;
  priority: string;
  createdAt: string;
}

export interface createIssueProps {
  title: string;
  description: string;
  message: string;
  priority: string;
  raisedBy: string;
}

export interface ProjectProps {
  _id: string;
  name: string;
  description: string;
  teamMembers: TeamMember[];
  createdBy: string;
  status: string;
  progress: number;
  issues: Issue[];
  deadline: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProjectProps {
  message: string;
  projects: ProjectProps[];
}

export interface TeamMemberProps {
  teamMembers: TeamMember[];
}

// For common screenshot type
export type Screenshot = {
  _id: string;
  imageUrl: string;
  user: string;
  project: string;
  timeLog: string;
  takenAt: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

// For logs inside weekly data
export type TimesheetLog = {
  logId: string;
  start: string;
  end: string;
  screenshots: Screenshot[];
  link: string;
};

// Map of day (e.g. "Fri") to array of logs
export type LogsByDay = {
  [day: string]: TimesheetLog[];
};

// Timesheet entry for each project
export type TimesheetProjectEntry = {
  projectName: string;
  logsByDay: LogsByDay;
};

// Weekly timesheet structure
export type TimesheetData = {
  weekStart: string;
  weekEnd: string;
  timesheet: {
    [projectId: string]: TimesheetProjectEntry;
  };
};

export type SubmittedLog = {
  logId: string;
  user: {
    _id: string;
    full_name: string;
    email: string;
  };
  project: {
    _id: string;
    name: string;
    id: string;
  };
  start: string;
  end: string;
  screenshots: Screenshot[];
  link: string;
};

export type SubmittedLogsResponse = {
  submittedLogs: SubmittedLog[];
};

export interface ClockInEntry {
  user: string;
  project: string;
  date: string;
  startTime: string;
  endTime: string | null;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ClockInResponse {
  message: string;
  entry: ClockInEntry;
}

export interface ClockOutEntry {
  totalHours: string;
  regularHours: string;
  overtimeHours: string;
  endTime: string;
}

export interface ClockOutResponse {
  message: string;
  timeEntry: ClockOutEntry;
}

export interface BillingInfo {
  userId?: string;
  companyName: string;
  taxId: string;
  billingEmail: string;
  phoneNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  bankDetail?: {
    currency: string;
    accountName: string;
    accountNumber: string;
    bankId: string;
  };
  payRate?: string;
}

export interface BankInfo {
  _id: string;
  bankName: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollRecord {
  _id: string;
  userId: string;
  amount: number;
  currency: string;
  bankId?: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

export type WorkloadStatus = "Pending" | "In Progress" | "Completed" | string;

export interface WorkloadEntry {
  _id: string;
  user: string | { _id: string; full_name: string; email: string };
  task: string | { _id: string; title: string };
  assignedBy: string | { _id: string; full_name: string; email: string };
  workloadPoints: number;
  status: WorkloadStatus;
  createdAt: string;
  updatedAt: string;
}

export type WorkloadSummaryItem = {
  totalPoints: number;
  tasks: number;
  items: WorkloadEntry[];
};

export type WorkloadSummaryResponse = {
  workloads: WorkloadEntry[];
  summary: Record<string, WorkloadSummaryItem>;
};

export type WorkloadLimitResponse = {
  userId: string;
  limit: number | null;
};

export type WorkloadLimitUpdateResponse = {
  message: string;
  setting: { userId: string; maxTasksPerUser: number };
};
