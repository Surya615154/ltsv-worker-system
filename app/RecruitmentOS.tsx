"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

const attendanceQrPath = "/?attendance=qr";
const officeStartTime = "09:45";

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  desk: string;
  responsibility: string;
  targetText: string;
  attendance: "On time" | "Late" | "Absent";
  calls: number;
  cv: number;
  interviews: number;
  target: number;
};

type Client = {
  id: string;
  company: string;
  contact: string;
  city: string;
  industry: string;
  status:
    | "Prospect"
    | "Permission"
    | "Meeting"
    | "Agreement"
    | "Agreement Sent"
    | "Agreement Signed"
    | "Active"
    | "Payment";
  model: string;
  owner: string;
  nextFollowUp: string;
};

type Requirement = {
  id: string;
  title: string;
  company: string;
  positions: number;
  salary: string;
  priority: "High" | "Medium" | "Low";
  status:
    | "Vacancy Found"
    | "Sourcing"
    | "CV Submitted"
    | "Interview"
    | "Offer"
    | "Joined"
    | "Invoice"
    | "Closed";
  owner: string;
};

type Candidate = {
  id: string;
  name: string;
  role: string;
  phone: string;
  city: string;
  stage:
    | "Application"
    | "Calling"
    | "Screening"
    | "Shortlisted"
    | "CV Submitted"
    | "Interview Scheduled"
    | "Interview Done"
    | "Selected"
    | "Documents"
    | "Joined"
    | "Invoice"
    | "Rejected";
  owner: string;
  company: string;
};

type FollowUp = {
  id: string;
  type: "Client" | "Candidate" | "Payment" | "Joining";
  title: string;
  owner: string;
  due: string;
  status: "Pending" | "Done";
};

type DailyReport = {
  id: string;
  member: string;
  date: string;
  completed: string;
  stuck: string;
  tomorrow: string;
};

type Invoice = {
  id: string;
  company: string;
  candidate: string;
  amount: number;
  owner: string;
  status: "Draft" | "Sent" | "Payment Pending" | "Paid";
  due: string;
};

type Task = {
  id: string;
  title: string;
  owner: string;
  assignedBy: string;
  due: string;
  priority: "High" | "Medium" | "Low";
  status: "Assigned" | "In Progress" | "Blocked" | "Done";
  notes: string;
};

type AttendanceLog = {
  id: string;
  member: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: "On time" | "Late" | "Absent" | "Half day";
  lateMinutes: number;
  method?: "QR Scan" | "Manual";
  verification?: "Pending" | "Verified" | "Rejected";
  locationText?: string;
  mapLink?: string;
  alertText?: string;
};

type LeaveRequest = {
  id: string;
  member: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: "Pending" | "Granted" | "Rejected";
  requestedOn: string;
  decidedBy: string;
};

type GatePassRequest = {
  id: string;
  member: string;
  destination: string;
  reason: string;
  outTime: string;
  expectedReturn: string;
  status: "Pending" | "Granted" | "Rejected";
  requestedOn: string;
  decidedBy: string;
};

type SalarySlipAdjustment = {
  id: string;
  memberId: string;
  month: string;
  advanceAmount: number;
  incentive: number;
  specialAllowance: number;
  otherAllowance: number;
  manualLopDays: number;
  notes: string;
};

type OfficeState = {
  resetVersion: string;
  members: Member[];
  clients: Client[];
  requirements: Requirement[];
  candidates: Candidate[];
  followUps: FollowUp[];
  reports: DailyReport[];
  invoices: Invoice[];
  tasks: Task[];
  attendanceLogs: AttendanceLog[];
  leaveRequests: LeaveRequest[];
  gatePassRequests: GatePassRequest[];
  salaryAdjustments: SalarySlipAdjustment[];
};

type LoginProfile = {
  memberId: string;
  access: string[];
};

type ExportRow = Record<string, string | number>;

type SalaryProfile = {
  memberId: string;
  salaryName: string;
  designation: string;
  department: string;
  location: string;
  dob: string;
  doj: string;
  aadhaarMasked: string;
  basicSalary: number;
  hra: number;
};

const companyPayrollInfo = {
  name: "LTSV PVT LTD",
  address: "3rd Floor, Classic Arcade, Upendra Nagar, Bus Stop, Cidco Nashik-422010",
  phone: "+91 95614 18247",
  email: "innashik.in@gmail.com",
  footer: "LTSV Pvt. Ltd. | Nashik, Maharashtra | +91 95614 18247 | innashik.in@gmail.com",
  authorizedSignatory: "SAGAR SONAWANE",
};

const renamedClientCompany = "R&D THERM INDIA PVT LTD";
const renamedClientModel = "5% Annual CTC";
const officialLaunchDate = "2026-08-01";
const freshStartResetVersion = "fresh-start-2026-08-01-v2";

const salaryProfiles: SalaryProfile[] = [
  {
    memberId: "m2",
    salaryName: "Sonali Omkar Shingre",
    designation: "HR Manager",
    department: "HR DEPARTMENT",
    location: "NASHIK",
    dob: "28/07/1986",
    doj: "01/06/2019",
    aadhaarMasked: "XXXX XXXX 6009",
    basicSalary: 18000,
    hra: 0,
  },
  {
    memberId: "m3",
    salaryName: "VISHWATEJ VISHAL SURYAWANSHI",
    designation: "BDO",
    department: "Business Development",
    location: "NASHIK",
    dob: "21/03/2006",
    doj: "26/06/2026",
    aadhaarMasked: "XXXX XXXX 7613",
    basicSalary: 8000,
    hra: 0,
  },
  {
    memberId: "m4",
    salaryName: "ROHAN SUNIL DANGLE",
    designation: "HR Recruiter",
    department: "HR",
    location: "CIDCO",
    dob: "30/06/1999",
    doj: "01/07/2026",
    aadhaarMasked: "XXXX XXXX 8853",
    basicSalary: 15000,
    hra: 0,
  },
  {
    memberId: "m5",
    salaryName: "Laxmi Namdev Manmothe",
    designation: "Coordinator",
    department: "HR",
    location: "CIDCO",
    dob: "13/06/2006",
    doj: "28/07/2025",
    aadhaarMasked: "XXXX XXXX 6560",
    basicSalary: 6000,
    hra: 0,
  },
  {
    memberId: "m6",
    salaryName: "Priti Sheshrao Dawande",
    designation: "Coordinator",
    department: "HR",
    location: "Nashik",
    dob: "23/09/2002",
    doj: "05/12/2022",
    aadhaarMasked: "To be updated",
    basicSalary: 6000,
    hra: 0,
  },
  {
    memberId: "m7",
    salaryName: "SATISH SHESHRAO KHILLARE",
    designation: "BDM",
    department: "DSA",
    location: "NASHIK",
    dob: "20/07/2004",
    doj: "17/04/2023",
    aadhaarMasked: "XXXX XXXX 5563",
    basicSalary: 13000,
    hra: 0,
  },
  {
    memberId: "m8",
    salaryName: "VAISHNAVI NANDRAM BORHADE",
    designation: "BRE",
    department: "DSA",
    location: "NASHIK",
    dob: "03/06/2005",
    doj: "14/07/2026",
    aadhaarMasked: "XXXX XXXX 8026",
    basicSalary: 6000,
    hra: 0,
  },
  {
    memberId: "m9",
    salaryName: "PAWAR GAYATRI KAILAS",
    designation: "CRE",
    department: "DSA",
    location: "NASHIK",
    dob: "21/07/1999",
    doj: "15/07/2026",
    aadhaarMasked: "XXXX XXXX 0960",
    basicSalary: 9000,
    hra: 0,
  },
];

const seedState: OfficeState = {
  resetVersion: freshStartResetVersion,
  members: [
    {
      id: "m1",
      name: "Sagar Sonawane",
      email: "innashik.in@gmail.com",
      role: "Director / Owner",
      desk: "Boss control",
      responsibility:
        "Check if everyone is working properly, assign roles, review activity, and take final decisions.",
      targetText: "Morning work allocation + evening review of every staff member",
      attendance: "Absent",
      calls: 0,
      cv: 0,
      interviews: 0,
      target: 20,
    },
    {
      id: "m2",
      name: "Sonali Shingre Ma'am",
      email: "shingresonali29@gmail.com",
      role: "HR Head / Admin",
      desk: "HR and candidate handling",
      responsibility:
        "Candidate handling, calling, vacancy finding, admin coordination, and HR process discipline.",
      targetText: "40 candidate/client coordination calls + vacancy update sheet",
      attendance: "Absent",
      calls: 0,
      cv: 0,
      interviews: 0,
      target: 50,
    },
    {
      id: "m3",
      name: "Vishwatej Suryawanshi",
      email: "suryawanshivishal625@gmail.com",
      role: "BDO",
      desk: "Company approach",
      responsibility:
        "Company approach, permission calls, meeting scheduling, client visits, agreements, and business follow-up.",
      attendance: "Absent",
      targetText: "35 company calls + 5 hot follow-ups + 1 meeting/visit pipeline",
      calls: 0,
      cv: 0,
      interviews: 0,
      target: 35,
    },
    {
      id: "m4",
      name: "Rohan Dangle",
      email: "hr.rohandangeltsv@gmail.com",
      role: "Recruiter",
      desk: "Sourcing to joining",
      responsibility:
        "Screening, sourcing, interview scheduling, candidate follow-up, joining confirmation, and invoice generation.",
      targetText: "50 sourcing calls + 10 screened CVs + interview/joining follow-up",
      attendance: "Absent",
      calls: 0,
      cv: 0,
      interviews: 0,
      target: 60,
    },
    {
      id: "m5",
      name: "Laxmi",
      email: "hr.laxmimanmotheltsv@gmail.com",
      role: "Coordinator",
      desk: "Candidate application calling",
      responsibility:
        "Cold calling candidates, collecting applications, updating basic details, and forwarding interested candidates.",
      targetText: "80 candidate cold calls + 20 application entries",
      attendance: "Absent",
      calls: 0,
      cv: 0,
      interviews: 0,
      target: 85,
    },
    {
      id: "m6",
      name: "Priti",
      email: "hr.pritidawandeltsv@gmail.com",
      role: "Coordinator",
      desk: "Candidate application calling",
      responsibility:
        "Cold calling candidates, collecting applications, updating basic details, and forwarding interested candidates.",
      targetText: "80 candidate cold calls + 20 application entries",
      attendance: "Absent",
      calls: 0,
      cv: 0,
      interviews: 0,
      target: 85,
    },
    {
      id: "m7",
      name: "Satish Khillare",
      email: "satishkhillare770@gmail.com",
      role: "BDM",
      desk: "Business development",
      responsibility:
        "Client development, company approach, meeting pipeline, and business relationship follow-up.",
      targetText: "35 company calls + 5 hot follow-ups + 1 active client movement",
      attendance: "Absent",
      calls: 0,
      cv: 0,
      interviews: 0,
      target: 35,
    },
    {
      id: "m8",
      name: "Vaishnavi Borhade",
      email: "vaishnaviborhade50@gmail.com",
      role: "BRE",
      desk: "Business relationship",
      responsibility:
        "Relationship follow-up, client coordination, requirement tracking, and daily communication discipline.",
      targetText: "35 relationship calls + client follow-up updates",
      attendance: "Absent",
      calls: 0,
      cv: 0,
      interviews: 0,
      target: 35,
    },
    {
      id: "m9",
      name: "Gayatri Pawar",
      email: "gp303326@gmail.com",
      role: "CRE",
      desk: "Customer relationship",
      responsibility:
        "Candidate/client response handling, coordination calls, status updates, and service follow-up.",
      targetText: "45 coordination calls + daily status update",
      attendance: "Absent",
      calls: 0,
      cv: 0,
      interviews: 0,
      target: 45,
    },
  ],
  clients: [],
  requirements: [],
  candidates: [],
  followUps: [],
  reports: [],
  invoices: [],
  tasks: [],
  attendanceLogs: [],
  leaveRequests: [],
  gatePassRequests: [],
  salaryAdjustments: [],
};

const stages: Candidate["stage"][] = [
  "Application",
  "Calling",
  "Screening",
  "Shortlisted",
  "CV Submitted",
  "Interview Scheduled",
  "Interview Done",
  "Selected",
  "Documents",
  "Joined",
  "Invoice",
  "Rejected",
];

const requirementStatuses: Requirement["status"][] = [
  "Vacancy Found",
  "Sourcing",
  "CV Submitted",
  "Interview",
  "Offer",
  "Joined",
  "Invoice",
  "Closed",
];

const clientStatuses: Client["status"][] = [
  "Prospect",
  "Permission",
  "Meeting",
  "Agreement Sent",
  "Agreement Signed",
  "Active",
  "Payment",
];

const invoiceStatuses: Invoice["status"][] = [
  "Draft",
  "Sent",
  "Payment Pending",
  "Paid",
];

const taskStatuses: Task["status"][] = [
  "Assigned",
  "In Progress",
  "Blocked",
  "Done",
];

const loginProfiles: LoginProfile[] = [
  {
    memberId: "m1",
    access: [
      "Launch",
      "CEO",
      "Control",
      "Pipeline",
      "Clients",
      "Team",
      "Tasks",
      "Attendance",
      "Leave",
      "Gate Pass",
      "Money",
      "Reports",
      "Export",
      "Salary Slip",
    ],
  },
  {
    memberId: "m2",
    access: [
      "Launch",
      "Control",
      "Pipeline",
      "Team",
      "Tasks",
      "Attendance",
      "Leave",
      "Gate Pass",
      "Money",
      "Reports",
      "Export",
      "Salary Slip",
    ],
  },
  {
    memberId: "m3",
    access: ["Launch", "Control", "Clients", "Tasks", "Attendance", "Leave", "Gate Pass", "Reports", "Export"],
  },
  {
    memberId: "m4",
    access: ["Launch", "Pipeline", "Tasks", "Attendance", "Leave", "Gate Pass", "Money", "Reports"],
  },
  {
    memberId: "m5",
    access: ["Launch", "Pipeline", "Tasks", "Attendance", "Leave", "Gate Pass", "Reports"],
  },
  {
    memberId: "m6",
    access: ["Launch", "Pipeline", "Tasks", "Attendance", "Leave", "Gate Pass", "Reports"],
  },
  {
    memberId: "m7",
    access: ["Launch", "Control", "Clients", "Tasks", "Attendance", "Leave", "Gate Pass", "Reports"],
  },
  {
    memberId: "m8",
    access: ["Launch", "Control", "Clients", "Tasks", "Attendance", "Leave", "Gate Pass", "Reports"],
  },
  {
    memberId: "m9",
    access: ["Launch", "Pipeline", "Tasks", "Attendance", "Leave", "Gate Pass", "Reports"],
  },
];

const defaultViews = [
  "Launch",
  "CEO",
  "Control",
  "Pipeline",
  "Clients",
  "Team",
  "Tasks",
  "Attendance",
  "Leave",
  "Gate Pass",
  "Money",
  "Reports",
  "Export",
  "Salary Slip",
];

const launchChecklist = [
  "Every staff member logs in from their own phone before work starts.",
  "Office QR is pasted near the entrance and attendance starts through scan.",
  "Leave permission must be requested in the system and approved by Sagar sir.",
  "Gate pass must be requested before leaving office and approved by Sonali ma'am.",
  "Sagar sir assigns daily priorities from Control and Follow-ups.",
  "BDO updates client approach, permission, meeting, and agreement stages.",
  "Recruiter and coordinators update candidate stages before evening review.",
  "All staff submit the Daily Report before leaving office.",
  "Invoice/payment status is reviewed after every joining confirmation.",
  "Sagar sir reviews CEO dashboard before closing the office day.",
];

const operatingRhythm = [
  { time: "09:45 AM", action: "Office start and attendance cutoff", owner: "All team" },
  { time: "10:15 AM", action: "Company and candidate calling", owner: "All team" },
  { time: "02:30 PM", action: "Interview, vacancy, and agreement follow-up", owner: "BDO / HR / Recruiter" },
  { time: "05:30 PM", action: "Daily report and target update", owner: "Every staff member" },
  { time: "Saturday", action: "Performance, payment, and pipeline review", owner: "Boss + HR Head" },
];

const launchRules = [
  "Work not updated in the system is not counted.",
  "Every follow-up must have one owner and one due date.",
  "Candidate movement must follow the defined pipeline stages.",
  "Client status must move from approach to agreement to active account.",
  "Late, absent, weak target, and pending payment items are reviewed weekly.",
  "No leave is counted as approved until boss marks it Granted.",
  "No staff member leaves office without a Granted gate pass.",
];

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

function scoreMember(member: Member) {
  const activity = member.calls + member.cv * 3 + member.interviews * 5;
  return Math.min(100, Math.round((activity / Math.max(member.target, 1)) * 100));
}

function hasOfficeData(payload: OfficeState) {
  return (
    payload.members.length > 0 ||
    payload.clients.length > 0 ||
    payload.requirements.length > 0 ||
    payload.candidates.length > 0 ||
    payload.followUps.length > 0 ||
    payload.reports.length > 0
  );
}

function isOldSavedData(payload: OfficeState) {
  return payload.resetVersion !== freshStartResetVersion;
}

function isLegacyDemoData(payload: OfficeState) {
  const memberNames = payload.members.map((member) => member.name).join(" ");
  const clientNames = payload.clients.map((client) => client.company).join(" ");
  const recordText = JSON.stringify(payload);

  return (
    /Aarav|Sneha|Vikram/.test(memberNames) ||
    /Nashik Auto Components|Western Logistics Hub/.test(clientNames) ||
    /Sample Candidate|Confirm Press Metal interview batch|Office entry verified|Personal work for half day permission|Meeting follow-up with company HR/.test(
      recordText,
    )
  );
}

function normalizeStaffName(name: string) {
  return name.replace(/Rohan Dongre/g, "Rohan Dangle").replace(/Preeti/g, "Priti");
}

function normalizeClientCompany(company: string) {
  return company.trim().toLowerCase() === "konark global"
    ? renamedClientCompany
    : company;
}

function normalizeClientModel(company: string, model: string) {
  return company === renamedClientCompany ? renamedClientModel : model;
}

function getSeedMemberEmail(member: Member) {
  const normalizedName = normalizeStaffName(member.name).toLowerCase();
  const seedMember = seedState.members.find(
    (item) => item.id === member.id || item.name.toLowerCase() === normalizedName,
  );

  return member.email || seedMember?.email || "";
}

function mergeSeedMembers(members: Member[]) {
  const activeMemberIds = new Set(seedState.members.map((member) => member.id));
  const activeMemberNames = new Set(
    seedState.members.map((member) => member.name.toLowerCase()),
  );
  const loadedMembers = (members.length ? members : seedState.members)
    .map((member) => ({
      ...member,
      name: normalizeStaffName(member.name),
      email: getSeedMemberEmail(member),
    }))
    .filter(
      (member) =>
        activeMemberIds.has(member.id) ||
        activeMemberNames.has(member.name.toLowerCase()),
    );
  const existingIds = new Set(loadedMembers.map((member) => member.id));
  const existingNames = new Set(
    loadedMembers.map((member) => member.name.toLowerCase()),
  );
  const missingMembers = seedState.members.filter(
    (member) =>
      !existingIds.has(member.id) &&
      !existingNames.has(member.name.toLowerCase()),
  );

  return [...loadedMembers, ...missingMembers];
}

function isOnOrAfterLaunchDate(date: string) {
  return !date || date >= officialLaunchDate;
}

function normalizeOfficeState(payload: OfficeState): OfficeState {
  if (isOldSavedData(payload)) {
    return seedState;
  }

  const clients = payload.clients?.length ? payload.clients : seedState.clients;

  return {
    resetVersion: freshStartResetVersion,
    members: mergeSeedMembers(payload.members ?? []),
    clients: clients.map((client) => {
      const company = normalizeClientCompany(client.company);

      return {
        ...client,
        company,
        model: normalizeClientModel(company, client.model),
        status: client.status === "Agreement" ? "Agreement Sent" : client.status,
      };
    }),
    requirements: payload.requirements?.length
      ? payload.requirements.map((requirement) => ({
          ...requirement,
          owner: normalizeStaffName(requirement.owner),
        }))
      : seedState.requirements,
    candidates: payload.candidates?.length
      ? payload.candidates.map((candidate) => ({
          ...candidate,
          owner: normalizeStaffName(candidate.owner),
        }))
      : seedState.candidates,
    followUps: payload.followUps?.length
      ? payload.followUps.map((followUp) => ({
          ...followUp,
          owner: normalizeStaffName(followUp.owner),
        }))
      : seedState.followUps,
    reports: payload.reports?.length
      ? payload.reports.filter((report) => isOnOrAfterLaunchDate(report.date)).map((report) => ({
          ...report,
          member: normalizeStaffName(report.member),
        }))
      : seedState.reports,
    invoices: payload.invoices?.length
      ? payload.invoices.map((invoice) => ({
          ...invoice,
          owner: normalizeStaffName(invoice.owner),
        }))
      : seedState.invoices,
    tasks: payload.tasks?.length
      ? payload.tasks.map((task) => ({
          ...task,
          owner: normalizeStaffName(task.owner),
          assignedBy: normalizeStaffName(task.assignedBy),
        }))
      : seedState.tasks,
    attendanceLogs: payload.attendanceLogs?.length
      ? payload.attendanceLogs.filter((log) => isOnOrAfterLaunchDate(log.date)).map((log) => ({
          ...log,
          member: normalizeStaffName(log.member),
        }))
      : seedState.attendanceLogs,
    leaveRequests: payload.leaveRequests?.length
      ? payload.leaveRequests.filter((leave) => isOnOrAfterLaunchDate(leave.requestedOn)).map((leave) => ({
          ...leave,
          member: normalizeStaffName(leave.member),
          decidedBy: normalizeStaffName(leave.decidedBy),
        }))
      : seedState.leaveRequests,
    gatePassRequests: payload.gatePassRequests?.length
      ? payload.gatePassRequests.filter((pass) => isOnOrAfterLaunchDate(pass.requestedOn)).map((pass) => ({
          ...pass,
          member: normalizeStaffName(pass.member),
          decidedBy: normalizeStaffName(pass.decidedBy),
        }))
      : seedState.gatePassRequests,
    salaryAdjustments: payload.salaryAdjustments?.length ? payload.salaryAdjustments : seedState.salaryAdjustments,
  };
}

function getTodayDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDaysToDateString(dateString: string, days: number) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return getTodayDate(date);
}

function getAttendanceDisplayDate(date = new Date()) {
  return date.getHours() >= 23
    ? addDaysToDateString(getTodayDate(date), 1)
    : getTodayDate(date);
}

function findAttendanceLog(
  logs: AttendanceLog[],
  memberName: string,
  date: string,
  includeRejected = true,
) {
  return logs.find(
    (log) =>
      log.member === memberName &&
      log.date === date &&
      (includeRejected || log.verification !== "Rejected"),
  );
}

function buildDateWiseAttendanceRows(
  members: Member[],
  logs: AttendanceLog[],
  date: string,
) {
  return members.map((member) => {
    const existingLog = findAttendanceLog(logs, member.name, date);
    if (existingLog) return existingLog;

    return {
      id: `absent-${member.id}-${date}`,
      member: member.name,
      date,
      checkIn: "-",
      checkOut: "",
      status: "Absent",
      lateMinutes: 0,
      method: "Manual",
      verification: "Verified",
      locationText: "No attendance scan for this date.",
      mapLink: "",
      alertText: "",
    } as AttendanceLog;
  });
}

function getMemberAttendanceStatus(
  logs: AttendanceLog[],
  memberName: string,
  date: string,
) {
  const log = findAttendanceLog(logs, memberName, date, false);
  return log?.status ?? "Absent";
}

function getCurrentClockTime() {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getLateMinutes(checkIn: string) {
  const [startHour, startMinute] = officeStartTime.split(":").map(Number);
  const [checkHour, checkMinute] = checkIn.split(":").map(Number);

  if (
    Number.isNaN(startHour) ||
    Number.isNaN(startMinute) ||
    Number.isNaN(checkHour) ||
    Number.isNaN(checkMinute)
  ) {
    return 0;
  }

  return Math.max(0, checkHour * 60 + checkMinute - (startHour * 60 + startMinute));
}

function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getDaysInMonth(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(year, monthNumber, 0).getDate();
}

function getMonthLabel(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(year, monthNumber - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

function isDateInMonth(date: string, month: string) {
  return date.startsWith(month);
}

function countLeaveDays(fromDate: string, toDate: string, month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const monthStart = new Date(year, monthNumber - 1, 1);
  const monthEnd = new Date(year, monthNumber, 0);
  const from = new Date(fromDate);
  const to = new Date(toDate || fromDate);
  const start = from > monthStart ? from : monthStart;
  const end = to < monthEnd ? to : monthEnd;

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return 0;
  }

  let count = 0;
  const date = new Date(start);

  while (date <= end) {
    if (date.getDay() !== 0) count += 1;
    date.setDate(date.getDate() + 1);
  }

  return count;
}

function countSundaysInMonth(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const daysInMonth = getDaysInMonth(month);
  let count = 0;

  for (let day = 1; day <= daysInMonth; day += 1) {
    if (new Date(year, monthNumber - 1, day).getDay() === 0) count += 1;
  }

  return count;
}

function getPayrollCutoffDate(month: string, officeDate: string) {
  const officeMonth = officeDate.slice(0, 7);

  if (month < officeMonth) {
    return `${month}-${String(getDaysInMonth(month)).padStart(2, "0")}`;
  }

  if (month === officeMonth) {
    return officeDate;
  }

  return "";
}

function isSundayDate(dateString: string) {
  return new Date(dateString).getDay() === 0;
}

function isApprovedLeaveDate(
  dateString: string,
  memberName: string,
  leaveRequests: LeaveRequest[],
) {
  return leaveRequests.some(
    (leave) =>
      leave.member === memberName &&
      leave.status === "Granted" &&
      leave.fromDate <= dateString &&
      (leave.toDate || leave.fromDate) >= dateString,
  );
}

function countMissingAttendanceDays(
  memberName: string,
  month: string,
  logs: AttendanceLog[],
  leaveRequests: LeaveRequest[],
  cutoffDate: string,
) {
  if (!cutoffDate) return 0;

  const daysInMonth = getDaysInMonth(month);
  const cutoffDay = Number(cutoffDate.slice(-2));
  let count = 0;

  for (let day = 1; day <= Math.min(daysInMonth, cutoffDay); day += 1) {
    const date = `${month}-${String(day).padStart(2, "0")}`;
    if (isSundayDate(date)) continue;
    if (isApprovedLeaveDate(date, memberName, leaveRequests)) continue;
    if (findAttendanceLog(logs, memberName, date, false)) continue;

    count += 1;
  }

  return count;
}

function getLatePenaltyDays(lateCount: number) {
  if (lateCount >= 5) return 1;
  if (lateCount >= 3) return 0.5;
  return 0;
}

function formatMoney(amount: number) {
  return Math.round(amount).toLocaleString("en-IN");
}

function numberToWords(value: number) {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function belowThousand(number: number) {
    let text = "";
    if (number >= 100) {
      text += `${ones[Math.floor(number / 100)]} Hundred `;
      number %= 100;
    }
    if (number >= 20) {
      text += `${tens[Math.floor(number / 10)]} `;
      number %= 10;
    }
    if (number > 0) {
      text += `${ones[number]} `;
    }
    return text.trim();
  }

  let number = Math.round(value);
  if (number === 0) return "Zero Rupees only";

  const parts: string[] = [];
  const crore = Math.floor(number / 10000000);
  number %= 10000000;
  const lakh = Math.floor(number / 100000);
  number %= 100000;
  const thousand = Math.floor(number / 1000);
  number %= 1000;

  if (crore) parts.push(`${belowThousand(crore)} Crore`);
  if (lakh) parts.push(`${belowThousand(lakh)} Lakh`);
  if (thousand) parts.push(`${belowThousand(thousand)} Thousand`);
  if (number) parts.push(belowThousand(number));

  return `${parts.join(" ")} Rupees only`;
}

function csvEscape(value: string | number) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function rowsToCsv(columns: string[], rows: ExportRow[]) {
  return [
    columns.map(csvEscape).join(","),
    ...rows.map((row) => columns.map((column) => csvEscape(row[column] ?? "")).join(",")),
  ].join("\n");
}

function downloadTextFile(fileName: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function htmlEscape(value: string | number) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeAccessCode(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/@(\d{2})[-/](\d{2})[-/](\d{4})$/, "@$1$2$3");
}

async function authenticateMember(memberId: string, code: string) {
  const response = await fetch("/api/auth", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ memberId, code: normalizeAccessCode(code) }),
  });

  if (!response.ok) return false;
  const payload = (await response.json()) as { ok?: boolean };
  return Boolean(payload.ok);
}

export default function RecruitmentOS() {
  const [state, setState] = useState<OfficeState>(seedState);
  const [activeView, setActiveView] = useState("Control");
  const [saveStatus, setSaveStatus] = useState("Ready");
  const [remoteLoaded, setRemoteLoaded] = useState(false);
  const lastSavedPayload = useRef("");
  const [activeMemberId, setActiveMemberId] = useState("m3");
  const [loginMemberId, setLoginMemberId] = useState("m3");
  const [loggedInMemberId, setLoggedInMemberId] = useState<string | null>(null);
  const [loginPin, setLoginPin] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isQrAttendanceMode, setIsQrAttendanceMode] = useState(false);
  const [qrMemberId, setQrMemberId] = useState("m3");
  const [qrScanTime, setQrScanTime] = useState("09:45");
  const [qrPin, setQrPin] = useState("");
  const [qrError, setQrError] = useState("");
  const [qrLocationText, setQrLocationText] = useState("Location not captured");
  const [qrMapLink, setQrMapLink] = useState("");
  const [qrLocationStatus, setQrLocationStatus] = useState("Tap location before marking attendance.");
  const [qrMessage, setQrMessage] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [attendanceHistoryDate, setAttendanceHistoryDate] = useState(getAttendanceDisplayDate());
  const [salaryMonth, setSalaryMonth] = useState(getMonthKey());
  const [salaryMemberId, setSalaryMemberId] = useState("m4");
  const attendanceQrLink = useMemo(() => {
    const origin =
      typeof window === "undefined"
        ? "https://ltsv-worker-system.suryawanshivishal625.chatgpt.site"
        : window.location.origin;

    return `${origin}${attendanceQrPath}`;
  }, []);
  const attendanceQrImage = useMemo(
    () =>
      `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=16&data=${encodeURIComponent(attendanceQrLink)}`,
    [attendanceQrLink],
  );

  useEffect(() => {
    let cancelled = false;
    async function loadState() {
      try {
        const response = await fetch("/api/state", { cache: "no-store" });
        if (!response.ok) {
          if (!cancelled) setRemoteLoaded(true);
          return;
        }
        const payload = (await response.json()) as OfficeState;
        if (!cancelled && hasOfficeData(payload) && !isLegacyDemoData(payload)) {
          const nextState = normalizeOfficeState(payload);
          lastSavedPayload.current = JSON.stringify(nextState);
          setState(nextState);
        }
        if (!cancelled) setRemoteLoaded(true);
      } catch {
        setSaveStatus("Offline sample mode");
        if (!cancelled) setRemoteLoaded(true);
      }
    }
    loadState();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const savedMemberId = window.sessionStorage.getItem("ltsv-login-member");
    if (savedMemberId && loginProfiles.some((profile) => profile.memberId === savedMemberId)) {
      setLoggedInMemberId(savedMemberId);
      setActiveMemberId(savedMemberId);
      setLoginMemberId(savedMemberId);
      setQrMemberId(savedMemberId);
    }
  }, []);

  useEffect(() => {
    function detectQrMode() {
      const params = new URLSearchParams(window.location.search);
      const qrMode =
        window.location.hash === "#qr-attendance" ||
        params.get("attendance") === "qr";

      setIsQrAttendanceMode(qrMode);
      if (qrMode) {
        setActiveView("Attendance");
        setQrScanTime(getCurrentClockTime());
      }
    }

    detectQrMode();
    window.addEventListener("hashchange", detectQrMode);

    return () => window.removeEventListener("hashchange", detectQrMode);
  }, []);

  useEffect(() => {
    if (!isQrAttendanceMode) return;

    const timer = window.setInterval(() => {
      setQrScanTime(getCurrentClockTime());
    }, 30000);

    return () => window.clearInterval(timer);
  }, [isQrAttendanceMode]);

  useEffect(() => {
    function tick() {
      setCurrentDateTime(
        new Date().toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
      );
    }

    tick();
    const timer = window.setInterval(tick, 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!remoteLoaded) return;

    const handle = window.setTimeout(async () => {
      try {
        const payload = JSON.stringify(state);
        if (payload === lastSavedPayload.current) return;

        setSaveStatus("Saving");
        const response = await fetch("/api/state", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: payload,
          keepalive: true,
        });
        if (response.ok) {
          lastSavedPayload.current = payload;
          setSaveStatus("Saved online");
        } else {
          setSaveStatus("Not saved");
        }
      } catch {
        setSaveStatus("Offline sample mode");
      }
    }, 100);

    return () => window.clearTimeout(handle);
  }, [remoteLoaded, state]);

  const attendanceDisplayDate = useMemo(
    () => getAttendanceDisplayDate(),
    [currentDateTime],
  );

  useEffect(() => {
    setAttendanceHistoryDate(attendanceDisplayDate);
  }, [attendanceDisplayDate]);

  const activeMember = useMemo(
    () =>
      state.members.find((member) => member.id === activeMemberId) ??
      state.members[0],
    [activeMemberId, state.members],
  );

  const loggedInMember = useMemo(
    () =>
      state.members.find((member) => member.id === loggedInMemberId) ??
      state.members.find((member) => member.id === loginMemberId),
    [loginMemberId, loggedInMemberId, state.members],
  );

  const loggedInProfile = useMemo(
    () => loginProfiles.find((profile) => profile.memberId === loggedInMemberId),
    [loggedInMemberId],
  );

  const isBoss = loggedInMemberId === "m1";
  const isSonali = loggedInMemberId === "m2";
  const isAdmin = loggedInMemberId === "m1" || loggedInMemberId === "m2";
  const canManageManualAttendance = loggedInMemberId === "m3";
  const canManageMoney = loggedInMemberId === "m4";
  const canViewMoney = isBoss || isSonali || canManageMoney;
  const canViewSalarySlip = isBoss || isSonali;
  const canEditSalarySlip = isSonali;
  const visibleViews = loggedInProfile?.access ?? defaultViews;
  const assignableMembers = isAdmin
    ? state.members
    : loggedInMember
      ? [loggedInMember]
      : [];
  const visibleTasks = isAdmin
    ? state.tasks
    : state.tasks.filter((task) => task.owner === loggedInMember?.name);
  const dateWiseAttendanceRows = useMemo(() => {
    const rows = buildDateWiseAttendanceRows(
      state.members,
      state.attendanceLogs,
      attendanceHistoryDate,
    );

    return isAdmin
      ? rows
      : rows.filter((log) => log.member === loggedInMember?.name);
  }, [
    attendanceHistoryDate,
    isAdmin,
    loggedInMember?.name,
    state.attendanceLogs,
    state.members,
  ]);
  const visibleReports = isAdmin
    ? state.reports
    : state.reports.filter((report) => report.member === loggedInMember?.name);
  const visibleLeaveRequests = isBoss
    ? state.leaveRequests
    : state.leaveRequests.filter((leave) => leave.member === loggedInMember?.name);
  const visibleGatePassRequests = isAdmin
    ? state.gatePassRequests
    : state.gatePassRequests.filter((pass) => pass.member === loggedInMember?.name);
  const attendanceAlerts = state.attendanceLogs.filter(
    (log) => log.method === "QR Scan" && log.verification === "Pending",
  );

  async function refreshOfficeData() {
    try {
      setSaveStatus("Refreshing");
      const response = await fetch("/api/state", { cache: "no-store" });
      if (!response.ok) {
        setSaveStatus("Refresh failed");
        return;
      }

      const payload = (await response.json()) as OfficeState;
      const nextState =
        hasOfficeData(payload) && !isLegacyDemoData(payload)
          ? normalizeOfficeState(payload)
          : seedState;
      lastSavedPayload.current = JSON.stringify(nextState);
      setState(nextState);
      setSaveStatus("Synced online");
    } catch {
      setSaveStatus("Refresh failed");
    }
  }

  function ownedName(form: FormData, field = "owner") {
    if (!isAdmin) return loggedInMember?.name || activeMember?.name || "Team";

    return String(form.get(field) || activeMember?.name || "Team");
  }

  function exportCsv(fileName: string, columns: string[], rows: ExportRow[]) {
    downloadTextFile(fileName, rowsToCsv(columns, rows), "text/csv;charset=utf-8");
  }

  function exportFullBackup() {
    downloadTextFile(
      `ltsv-full-backup-${getTodayDate()}.json`,
      JSON.stringify(state, null, 2),
      "application/json;charset=utf-8",
    );
  }

  function updateSalaryAdjustment(
    field: keyof Pick<
      SalarySlipAdjustment,
      "advanceAmount" | "incentive" | "specialAllowance" | "otherAllowance" | "manualLopDays" | "notes"
    >,
    value: string,
  ) {
    if (!canEditSalarySlip) return;

    setState((current) => {
      const existing = current.salaryAdjustments.find(
        (adjustment) =>
          adjustment.memberId === salaryProfile.memberId &&
          adjustment.month === salaryMonth,
      );
      const nextAdjustment: SalarySlipAdjustment = {
        id: existing?.id || makeId("salary"),
        memberId: salaryProfile.memberId,
        month: salaryMonth,
        advanceAmount: existing?.advanceAmount || 0,
        incentive: existing?.incentive || 0,
        specialAllowance: existing?.specialAllowance || 0,
        otherAllowance: existing?.otherAllowance || 0,
        manualLopDays: existing?.manualLopDays || 0,
        notes: existing?.notes || "",
        [field]: field === "notes" ? value : Number(value || 0),
      };

      return {
        ...current,
        salaryAdjustments: existing
          ? current.salaryAdjustments.map((adjustment) =>
              adjustment.id === existing.id ? nextAdjustment : adjustment,
            )
          : [nextAdjustment, ...current.salaryAdjustments],
      };
    });
  }

  function buildSalarySlipHtml() {
    const logoUrl =
      typeof window === "undefined"
        ? "/ltsv-logo.png"
        : `${window.location.origin}/ltsv-logo.png`;

    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${htmlEscape(companyPayrollInfo.name)} Salary Slip - ${htmlEscape(salarySlip.monthLabel)}</title>
  <style>
    body { color: #1f2933; font-family: Arial, sans-serif; margin: 0; }
    .slip { padding: 34px 44px; }
    .top-line { background: #0c2a56; height: 18px; border-bottom: 5px solid #c99a37; }
    .header { display: grid; grid-template-columns: 1fr 110px; gap: 24px; align-items: center; text-align: center; }
    .header h1 { color: #0c2a56; font-size: 30px; margin: 12px 0 10px; }
    .header p { color: #5f6b7a; font-weight: 700; line-height: 1.5; margin: 0; }
    .logo { height: 96px; object-fit: contain; width: 96px; }
    .title { background: #0c2a56; border-radius: 4px; color: #fff; margin: 24px 0 42px; padding: 10px; text-align: center; }
    .title h2 { margin: 0; }
    table { border-collapse: collapse; margin-bottom: 18px; width: 100%; }
    th, td { border: 1px solid #aeb8c7; font-size: 13px; padding: 10px; text-align: left; }
    th { background: #e8edf4; }
    .label { color: #2b1162; font-weight: 800; width: 22%; }
    .amount { text-align: right; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .summary td { font-weight: 800; }
    .sign { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-top: 44px; }
    .line { border-top: 2px solid #1f2933; padding-top: 10px; }
    .right { text-align: right; }
    .footer { border-top: 1px solid #cbd5e1; color: #5f6b7a; display: flex; justify-content: space-between; margin-top: 26px; padding-top: 14px; }
    .print { margin: 18px 44px; }
    @media print { .print { display: none; } }
  </style>
</head>
<body>
  <div class="top-line"></div>
  <button class="print" onclick="window.print()">Print / Save as PDF</button>
  <main class="slip">
    <section class="header">
      <div>
        <h1>${htmlEscape(companyPayrollInfo.name)}</h1>
        <p>${htmlEscape(companyPayrollInfo.address)}<br />${htmlEscape(companyPayrollInfo.phone)} | ${htmlEscape(companyPayrollInfo.email)}</p>
      </div>
      <img class="logo" src="${htmlEscape(logoUrl)}" alt="LTSV logo" />
    </section>
    <section class="title">
      <h2>PAY SLIP</h2>
      <strong>${htmlEscape(salarySlip.monthLabel)}</strong>
    </section>
    <table>
      <tr><td class="label">Name</td><td>${htmlEscape(salarySlip.profile.salaryName)}</td><td class="label">DOB</td><td>${htmlEscape(salarySlip.profile.dob)}</td></tr>
      <tr><td class="label">Designation</td><td>${htmlEscape(salarySlip.profile.designation)}</td><td class="label">DOJ</td><td>${htmlEscape(salarySlip.profile.doj)}</td></tr>
      <tr><td class="label">Location</td><td>${htmlEscape(salarySlip.profile.location)}</td><td class="label">Aadhaar</td><td>${htmlEscape(salarySlip.profile.aadhaarMasked)}</td></tr>
      <tr><td class="label">LOP</td><td>${salarySlip.lopDays}</td><td class="label">Department</td><td>${htmlEscape(salarySlip.profile.department)}</td></tr>
      <tr><td class="label">Payable Days</td><td>${salarySlip.payableDays}</td><td class="label">Days In Month</td><td>${salarySlip.daysInMonth}</td></tr>
      <tr><td class="label">Attendance Present</td><td>${salarySlip.attendancePresentDays}</td><td class="label">Paid Sundays</td><td>${salarySlip.paidSundayDays}</td></tr>
      <tr><td class="label">Unscanned Absents</td><td>${salarySlip.missingAttendanceDays}</td><td class="label">Approved Leave Days</td><td>${salarySlip.approvedLeaveDays}</td></tr>
      <tr><td class="label">Late Marks</td><td>${salarySlip.lateCount}</td><td class="label">Late Deduction Days</td><td>${salarySlip.latePenaltyDays}</td></tr>
    </table>
    <section class="grid">
      <table>
        <tr><th>Earnings</th><th class="amount">Rs.</th></tr>
        <tr><td>Basic</td><td class="amount">${formatMoney(salarySlip.basic)}</td></tr>
        <tr><td>House Rent Allowance</td><td class="amount">${formatMoney(salarySlip.hra)}</td></tr>
        <tr><td>Special Allowance</td><td class="amount">${formatMoney(salarySlip.specialAllowance)}</td></tr>
        <tr><td>Incentive</td><td class="amount">${formatMoney(salarySlip.incentive)}</td></tr>
        <tr><td>Other Allowance</td><td class="amount">${formatMoney(salarySlip.otherAllowance)}</td></tr>
        <tr><th>Total Earnings</th><th class="amount">${formatMoney(salarySlip.totalEarnings)}</th></tr>
      </table>
      <table>
        <tr><th>Deductions</th><th class="amount">Rs.</th></tr>
        <tr><td>Employee LWF / Leaves</td><td class="amount">${formatMoney(salarySlip.leaveDeduction + salarySlip.lateDeduction)}</td></tr>
        <tr><td>Employee PF Contribution</td><td class="amount">0</td></tr>
        <tr><td>Advance amount</td><td class="amount">${formatMoney(salarySlip.advanceAmount)}</td></tr>
        <tr><td>PT</td><td class="amount">0</td></tr>
        <tr><td>ESIC</td><td class="amount">0</td></tr>
        <tr><th>Total Deduction</th><th class="amount">${formatMoney(salarySlip.totalDeduction)}</th></tr>
      </table>
    </section>
    <table class="summary">
      <tr><td class="label">Advance Deduction</td><td class="amount">${formatMoney(salarySlip.advanceAmount)}</td><td class="label">In Hand</td><td class="amount">${formatMoney(salarySlip.inHand)}</td></tr>
      <tr><td class="label">In Words</td><td colspan="3">${htmlEscape(salarySlip.inWords)}</td></tr>
    </table>
    <section class="sign">
      <div><div class="line">${htmlEscape(salarySlip.profile.salaryName)}</div><strong>Signature</strong></div>
      <div class="right"><div class="line">${htmlEscape(companyPayrollInfo.authorizedSignatory)}</div><strong>Authorized Signatory</strong></div>
    </section>
    <section class="footer">
      <span>${htmlEscape(companyPayrollInfo.footer)}</span>
      <span>Generated ${htmlEscape(currentDateTime || new Date().toLocaleString("en-IN"))}</span>
    </section>
  </main>
</body>
</html>`;
  }

  function downloadSalarySlip() {
    const fileName = `salary-slip-${salarySlip.profile.salaryName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}-${salarySlip.month}.html`;

    downloadTextFile(fileName, buildSalarySlipHtml(), "text/html;charset=utf-8");
  }

  useEffect(() => {
    if (!visibleViews.includes(activeView)) {
      setActiveView(visibleViews[0] ?? "Control");
    }
  }, [activeView, visibleViews]);

  useEffect(() => {
    if (loggedInMemberId && !isBoss && activeMemberId !== loggedInMemberId) {
      setActiveMemberId(loggedInMemberId);
    }
  }, [activeMemberId, isBoss, loggedInMemberId]);

  const metrics = useMemo(() => {
    const openRequirements = state.requirements.filter(
      (item) => item.status !== "Closed",
    );
    const todayFollowUps = state.followUps.filter(
      (item) => item.status === "Pending" && item.due.toLowerCase().includes("today"),
    );
    const interviews = state.candidates.filter((item) =>
      ["Interview Scheduled", "Interview Done"].includes(item.stage),
    ).length;
    const joined = state.candidates.filter((item) => item.stage === "Joined").length;
    const pendingInvoices = state.invoices.filter(
      (item) => item.status !== "Paid",
    );
    const openTasks = state.tasks.filter((item) => item.status !== "Done");
    const blockedTasks = state.tasks.filter((item) => item.status === "Blocked");
    const todayAttendance = state.attendanceLogs.filter(
      (item) => item.date === attendanceDisplayDate,
    );
    const lateToday = todayAttendance.filter((item) => item.status === "Late");
    const pendingLeaves = state.leaveRequests.filter(
      (item) => item.status === "Pending",
    );
    const pendingGatePasses = state.gatePassRequests.filter(
      (item) => item.status === "Pending",
    );
    const pendingAttendance = state.attendanceLogs.filter(
      (item) => item.method === "QR Scan" && item.verification === "Pending",
    );
    const discipline =
      state.members.reduce((sum, member) => sum + scoreMember(member), 0) /
      Math.max(state.members.length, 1);

    return {
      openRequirements: openRequirements.length,
      totalPositions: openRequirements.reduce((sum, item) => sum + item.positions, 0),
      todayFollowUps: todayFollowUps.length,
      interviews,
      joined,
      discipline: Math.round(discipline),
      activeClients: state.clients.filter((item) => item.status === "Active").length,
      pendingInvoices: pendingInvoices.length,
      pendingAmount: pendingInvoices.reduce((sum, item) => sum + item.amount, 0),
      openTasks: openTasks.length,
      blockedTasks: blockedTasks.length,
      attendanceMarked: todayAttendance.length,
      lateToday: lateToday.length,
      pendingLeaves: pendingLeaves.length,
      pendingGatePasses: pendingGatePasses.length,
      pendingAttendance: pendingAttendance.length,
    };
  }, [attendanceDisplayDate, state]);

  const exportSets = useMemo(
    () => [
      {
        title: "Attendance Data",
        description: "Date-wise check-in, status, late minutes, verification, and location proof.",
        fileName: "ltsv-attendance-data.csv",
        columns: [
          "date",
          "member",
          "checkIn",
          "checkOut",
          "status",
          "lateMinutes",
          "method",
          "verification",
          "locationText",
          "mapLink",
        ],
        rows: state.attendanceLogs.map((log) => ({
          date: log.date,
          member: log.member,
          checkIn: log.checkIn,
          checkOut: log.checkOut,
          status: log.status,
          lateMinutes: log.lateMinutes,
          method: log.method || "",
          verification: log.verification || "",
          locationText: log.locationText || "",
          mapLink: log.mapLink || "",
        })),
      },
      {
        title: "Daily Reports",
        description: "Daily completed work, blockers, and next-day focus.",
        fileName: "ltsv-daily-reports.csv",
        columns: ["date", "member", "completed", "stuck", "tomorrow"],
        rows: state.reports.map((report) => ({
          date: report.date,
          member: report.member,
          completed: report.completed,
          stuck: report.stuck,
          tomorrow: report.tomorrow,
        })),
      },
      {
        title: "Task Data",
        description: "Task owner, due date, priority, status, notes, and assignment source.",
        fileName: "ltsv-task-data.csv",
        columns: ["title", "owner", "assignedBy", "due", "priority", "status", "notes"],
        rows: state.tasks.map((task) => ({
          title: task.title,
          owner: task.owner,
          assignedBy: task.assignedBy,
          due: task.due,
          priority: task.priority,
          status: task.status,
          notes: task.notes,
        })),
      },
      {
        title: "Leave Data",
        description: "Leave request dates, reasons, status, and boss decision history.",
        fileName: "ltsv-leave-data.csv",
        columns: ["requestedOn", "member", "fromDate", "toDate", "reason", "status", "decidedBy"],
        rows: state.leaveRequests.map((leave) => ({
          requestedOn: leave.requestedOn,
          member: leave.member,
          fromDate: leave.fromDate,
          toDate: leave.toDate,
          reason: leave.reason,
          status: leave.status,
          decidedBy: leave.decidedBy,
        })),
      },
      {
        title: "Gate Pass Data",
        description: "Office movement records with reason, timing, status, and approval.",
        fileName: "ltsv-gate-pass-data.csv",
        columns: [
          "requestedOn",
          "member",
          "destination",
          "reason",
          "outTime",
          "expectedReturn",
          "status",
          "decidedBy",
        ],
        rows: state.gatePassRequests.map((pass) => ({
          requestedOn: pass.requestedOn,
          member: pass.member,
          destination: pass.destination,
          reason: pass.reason,
          outTime: pass.outTime,
          expectedReturn: pass.expectedReturn,
          status: pass.status,
          decidedBy: pass.decidedBy,
        })),
      },
      {
        title: "Candidate Data",
        description: "Candidate pipeline records with stage, company, owner, and contact details.",
        fileName: "ltsv-candidate-data.csv",
        columns: ["name", "role", "phone", "city", "stage", "owner", "company"],
        rows: state.candidates.map((candidate) => ({
          name: candidate.name,
          role: candidate.role,
          phone: candidate.phone,
          city: candidate.city,
          stage: candidate.stage,
          owner: candidate.owner,
          company: candidate.company,
        })),
      },
      {
        title: "Client Data",
        description: "Client account pipeline, industry, city, owner, model, and next follow-up.",
        fileName: "ltsv-client-data.csv",
        columns: ["company", "contact", "city", "industry", "status", "model", "owner", "nextFollowUp"],
        rows: state.clients.map((client) => ({
          company: client.company,
          contact: client.contact,
          city: client.city,
          industry: client.industry,
          status: client.status,
          model: client.model,
          owner: client.owner,
          nextFollowUp: client.nextFollowUp,
        })),
      },
      {
        title: "Invoice Data",
        description: "Invoice and payment follow-up records.",
        fileName: "ltsv-invoice-data.csv",
        columns: ["company", "candidate", "amount", "owner", "status", "due"],
        rows: state.invoices.map((invoice) => ({
          company: invoice.company,
          candidate: invoice.candidate,
          amount: invoice.amount,
          owner: invoice.owner,
          status: invoice.status,
          due: invoice.due,
        })),
      },
      {
        title: "Salary Adjustments",
        description: "Monthly payroll advance, incentive, allowance, and manual LOP entries.",
        fileName: "ltsv-salary-adjustments.csv",
        columns: [
          "month",
          "employee",
          "advanceAmount",
          "incentive",
          "specialAllowance",
          "otherAllowance",
          "manualLopDays",
          "notes",
        ],
        rows: state.salaryAdjustments.map((adjustment) => {
          const profile = salaryProfiles.find(
            (item) => item.memberId === adjustment.memberId,
          );

          return {
            month: adjustment.month,
            employee: profile?.salaryName || adjustment.memberId,
            advanceAmount: adjustment.advanceAmount,
            incentive: adjustment.incentive,
            specialAllowance: adjustment.specialAllowance,
            otherAllowance: adjustment.otherAllowance,
            manualLopDays: adjustment.manualLopDays,
            notes: adjustment.notes,
          };
        }),
      },
    ],
    [state],
  );

  const salaryProfile = useMemo(
    () => salaryProfiles.find((profile) => profile.memberId === salaryMemberId) ?? salaryProfiles[0],
    [salaryMemberId],
  );
  const salaryMember = useMemo(
    () => state.members.find((member) => member.id === salaryProfile.memberId),
    [salaryProfile.memberId, state.members],
  );
  const salaryAdjustment = useMemo(
    () =>
      state.salaryAdjustments.find(
        (adjustment) =>
          adjustment.memberId === salaryProfile.memberId &&
          adjustment.month === salaryMonth,
      ) ?? {
        id: "",
        memberId: salaryProfile.memberId,
        month: salaryMonth,
        advanceAmount: 0,
        incentive: 0,
        specialAllowance: 0,
        otherAllowance: 0,
        manualLopDays: 0,
        notes: "",
      },
    [salaryMonth, salaryProfile.memberId, state.salaryAdjustments],
  );
  const salarySlip = useMemo(() => {
    const employeeName = salaryMember?.name ?? salaryProfile.salaryName;
    const monthLogs = state.attendanceLogs.filter(
      (log) =>
        log.member === employeeName &&
        isDateInMonth(log.date, salaryMonth) &&
        log.verification !== "Rejected",
    );
    const attendancePresentDays = monthLogs.reduce((sum, log) => {
      if (log.status === "Half day") return sum + 0.5;
      if (log.status === "On time" || log.status === "Late") return sum + 1;
      return sum;
    }, 0);
    const absentDays = monthLogs.filter((log) => log.status === "Absent").length;
    const lateCount = monthLogs.filter((log) => log.status === "Late").length;
    const approvedLeaveDays = state.leaveRequests
      .filter(
        (leave) =>
          leave.member === employeeName &&
          leave.status === "Granted" &&
          (isDateInMonth(leave.fromDate, salaryMonth) ||
            isDateInMonth(leave.toDate, salaryMonth)),
      )
      .reduce(
        (sum, leave) =>
          sum + countLeaveDays(leave.fromDate, leave.toDate, salaryMonth),
        0,
      );
    const daysInMonth = getDaysInMonth(salaryMonth);
    const paidSundayDays = countSundaysInMonth(salaryMonth);
    const presentDays = attendancePresentDays + paidSundayDays;
    const payrollCutoffDate = getPayrollCutoffDate(salaryMonth, attendanceDisplayDate);
    const missingAttendanceDays = countMissingAttendanceDays(
      employeeName,
      salaryMonth,
      state.attendanceLogs,
      state.leaveRequests,
      payrollCutoffDate,
    );
    const lopDays =
      absentDays +
      missingAttendanceDays +
      approvedLeaveDays +
      salaryAdjustment.manualLopDays;
    const latePenaltyDays = getLatePenaltyDays(lateCount);
    const payableDays = Math.max(0, daysInMonth - lopDays - latePenaltyDays);
    const totalEarnings =
      salaryProfile.basicSalary +
      salaryProfile.hra +
      salaryAdjustment.specialAllowance +
      salaryAdjustment.incentive +
      salaryAdjustment.otherAllowance;
    const perDaySalary = totalEarnings / Math.max(daysInMonth, 1);
    const leaveDeduction = perDaySalary * lopDays;
    const lateDeduction = perDaySalary * latePenaltyDays;
    const totalDeduction =
      leaveDeduction + lateDeduction + salaryAdjustment.advanceAmount;
    const inHand = Math.max(0, totalEarnings - totalDeduction);

    return {
      profile: salaryProfile,
      member: salaryMember,
      month: salaryMonth,
      monthLabel: getMonthLabel(salaryMonth),
      daysInMonth,
      attendancePresentDays,
      paidSundayDays,
      presentDays,
      payableDays,
      absentDays,
      missingAttendanceDays,
      approvedLeaveDays,
      manualLopDays: salaryAdjustment.manualLopDays,
      lopDays,
      lateCount,
      latePenaltyDays,
      perDaySalary,
      basic: salaryProfile.basicSalary,
      hra: salaryProfile.hra,
      specialAllowance: salaryAdjustment.specialAllowance,
      incentive: salaryAdjustment.incentive,
      otherAllowance: salaryAdjustment.otherAllowance,
      totalEarnings,
      leaveDeduction,
      lateDeduction,
      advanceAmount: salaryAdjustment.advanceAmount,
      totalDeduction,
      inHand,
      inWords: numberToWords(inHand),
      notes: salaryAdjustment.notes,
    };
  }, [
    attendanceDisplayDate,
    salaryAdjustment,
    salaryMember,
    salaryMonth,
    salaryProfile,
    state.attendanceLogs,
    state.leaveRequests,
  ]);

  const rankedMembers = useMemo(
    () =>
      [...state.members].sort(
        (first, second) => scoreMember(second) - scoreMember(first),
      ),
    [state.members],
  );

  const riskItems = useMemo(
    () => [
      ...state.followUps
        .filter((item) => item.status === "Pending")
        .slice(0, 4)
        .map((item) => ({
          label: item.type,
          title: item.title,
          owner: item.owner,
        })),
      ...state.tasks
        .filter((item) => item.status === "Blocked")
        .slice(0, 3)
        .map((item) => ({
          label: "Blocked",
          title: item.title,
          owner: item.owner,
        })),
      ...state.invoices
        .filter((item) => item.status === "Payment Pending")
        .slice(0, 3)
        .map((item) => ({
          label: "Payment",
          title: `${item.company} - Rs ${item.amount.toLocaleString("en-IN")}`,
          owner: item.owner,
        })),
      ...state.leaveRequests
        .filter((item) => item.status === "Pending")
        .slice(0, 3)
        .map((item) => ({
          label: "Leave",
          title: `${item.member}: ${item.fromDate} to ${item.toDate}`,
          owner: item.reason,
        })),
      ...state.gatePassRequests
        .filter((item) => item.status === "Pending")
        .slice(0, 3)
        .map((item) => ({
          label: "Gate Pass",
          title: `${item.member}: ${item.destination}`,
          owner: item.reason,
        })),
      ...attendanceAlerts.slice(0, 3).map((item) => ({
        label: "QR Alert",
        title: `${item.member} marked attendance at ${item.checkIn}`,
        owner: item.locationText || "Location not captured",
      })),
    ],
    [
      attendanceAlerts,
      state.followUps,
      state.gatePassRequests,
      state.invoices,
      state.leaveRequests,
      state.tasks,
    ],
  );

  function addClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const company = normalizeClientCompany(String(form.get("company") || "New company"));
    const commercialModel =
      String(form.get("customModel") || "").trim() ||
      String(form.get("model") || "8.33% Annual CTC");

    setState((current) => ({
      ...current,
      clients: [
        {
          id: makeId("client"),
          company,
          contact: String(form.get("contact") || "HR"),
          city: String(form.get("city") || "Nashik"),
          industry: String(form.get("industry") || "General"),
          status: "Prospect",
          model: normalizeClientModel(company, commercialModel),
          owner: ownedName(form),
          nextFollowUp: String(form.get("nextFollowUp") || "Tomorrow"),
        },
        ...current.clients,
      ],
    }));
    event.currentTarget.reset();
  }

  function addFollowUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState((current) => ({
      ...current,
      followUps: [
        {
          id: makeId("follow"),
          type: String(form.get("type") || "Client") as FollowUp["type"],
          title: String(form.get("title") || "New follow-up"),
          owner: ownedName(form),
          due: String(form.get("due") || "Today"),
          status: "Pending",
        },
        ...current.followUps,
      ],
    }));
    event.currentTarget.reset();
  }

  function addRequirement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState((current) => ({
      ...current,
      requirements: [
        {
          id: makeId("req"),
          title: String(form.get("title") || "New role"),
          company: String(form.get("company") || "Client"),
          positions: Number(form.get("positions") || 1),
          salary: String(form.get("salary") || "As per market"),
          priority: "High",
          status: "Vacancy Found",
          owner: ownedName(form),
        },
        ...current.requirements,
      ],
    }));
    event.currentTarget.reset();
  }

  function addCandidate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState((current) => ({
      ...current,
      candidates: [
        {
          id: makeId("cand"),
          name: String(form.get("name") || "Candidate"),
          role: String(form.get("role") || "Role"),
          phone: String(form.get("phone") || ""),
          city: String(form.get("city") || "Nashik"),
          stage: "Application",
          owner: ownedName(form),
          company: String(form.get("company") || "Pipeline"),
        },
        ...current.candidates,
      ],
    }));
    event.currentTarget.reset();
  }

  function addDailyReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState((current) => ({
      ...current,
      reports: [
        {
          id: makeId("report"),
          member: ownedName(form, "member"),
          date: getTodayDate(),
          completed: String(form.get("completed") || ""),
          stuck: String(form.get("stuck") || "No blocker"),
          tomorrow: String(form.get("tomorrow") || ""),
        },
        ...current.reports,
      ],
    }));
    event.currentTarget.reset();
  }

  function updateCandidateStage(id: string, stage: Candidate["stage"]) {
    setState((current) => ({
      ...current,
      candidates: current.candidates.map((item) =>
        item.id === id ? { ...item, stage } : item,
      ),
    }));
  }

  function updateRequirementStatus(id: string, status: Requirement["status"]) {
    setState((current) => ({
      ...current,
      requirements: current.requirements.map((item) =>
        item.id === id ? { ...item, status } : item,
      ),
    }));
  }

  function updateClientStatus(id: string, status: Client["status"]) {
    setState((current) => ({
      ...current,
      clients: current.clients.map((item) =>
        item.id === id ? { ...item, status } : item,
      ),
    }));
  }

  function updateInvoiceStatus(id: string, status: Invoice["status"]) {
    if (!canManageMoney) return;

    setState((current) => ({
      ...current,
      invoices: current.invoices.map((item) =>
        item.id === id ? { ...item, status } : item,
      ),
    }));
  }

  function updateTaskStatus(id: string, status: Task["status"]) {
    const task = state.tasks.find((item) => item.id === id);
    if (!isAdmin && task?.owner !== loggedInMember?.name) return;

    setState((current) => ({
      ...current,
      tasks: current.tasks.map((item) =>
        item.id === id ? { ...item, status } : item,
      ),
    }));
  }

  function addInvoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManageMoney) return;

    const form = new FormData(event.currentTarget);
    setState((current) => ({
      ...current,
      invoices: [
        {
          id: makeId("invoice"),
          company: String(form.get("company") || "Client"),
          candidate: String(form.get("candidate") || "Candidate"),
          amount: Number(form.get("amount") || 0),
          owner: loggedInMember?.name || "Rohan Dangle",
          status: "Draft",
          due: String(form.get("due") || "This week"),
        },
        ...current.invoices,
      ],
    }));
    event.currentTarget.reset();
  }

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState((current) => ({
      ...current,
      tasks: [
        {
          id: makeId("task"),
          title: String(form.get("title") || "New task"),
          owner: ownedName(form),
          assignedBy: loggedInMember?.name || "Sagar Sonawane",
          due: String(form.get("due") || "Today"),
          priority: String(form.get("priority") || "Medium") as Task["priority"],
          status: "Assigned",
          notes: String(form.get("notes") || ""),
        },
        ...current.tasks,
      ],
    }));
    event.currentTarget.reset();
  }

  function addLeaveRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState((current) => ({
      ...current,
      leaveRequests: [
        {
          id: makeId("leave"),
          member: ownedName(form, "member"),
          fromDate: String(form.get("fromDate") || getTodayDate()),
          toDate: String(form.get("toDate") || form.get("fromDate") || getTodayDate()),
          reason: String(form.get("reason") || "Leave permission requested."),
          status: "Pending",
          requestedOn: getTodayDate(),
          decidedBy: "",
        },
        ...current.leaveRequests,
      ],
    }));
    event.currentTarget.reset();
  }

  function updateLeaveStatus(id: string, status: LeaveRequest["status"]) {
    if (!isBoss) return;

    setState((current) => ({
      ...current,
      leaveRequests: current.leaveRequests.map((leave) =>
        leave.id === id
          ? {
              ...leave,
              status,
              decidedBy: loggedInMember?.name || "Sagar Sonawane",
            }
          : leave,
      ),
    }));
  }

  function addGatePassRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState((current) => ({
      ...current,
      gatePassRequests: [
        {
          id: makeId("gate"),
          member: ownedName(form, "member"),
          destination: String(form.get("destination") || "Outside office"),
          reason: String(form.get("reason") || "Gate pass requested."),
          outTime: String(form.get("outTime") || getCurrentClockTime()),
          expectedReturn: String(form.get("expectedReturn") || "Same day"),
          status: "Pending",
          requestedOn: getTodayDate(),
          decidedBy: "",
        },
        ...current.gatePassRequests,
      ],
    }));
    event.currentTarget.reset();
  }

  function updateGatePassStatus(id: string, status: GatePassRequest["status"]) {
    if (!isSonali) return;

    setState((current) => ({
      ...current,
      gatePassRequests: current.gatePassRequests.map((pass) =>
        pass.id === id
          ? {
              ...pass,
              status,
              decidedBy: loggedInMember?.name || "Sonali Shingre Ma'am",
            }
          : pass,
      ),
    }));
  }

  function updateAttendanceVerification(
    id: string,
    verification: NonNullable<AttendanceLog["verification"]>,
  ) {
    if (!isAdmin) return;

    setState((current) => ({
      ...current,
      attendanceLogs: current.attendanceLogs.map((log) =>
        log.id === id ? { ...log, verification } : log,
      ),
    }));
  }

  function captureQrLocation() {
    if (!navigator.geolocation) {
      setQrLocationStatus("Location is not available on this phone.");
      setQrLocationText("Location not available");
      setQrMapLink("");
      return;
    }

    setQrLocationStatus("Capturing phone location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const locationText = `Location captured (${Math.round(accuracy)}m accuracy)`;
        setQrLocationText(locationText);
        setQrMapLink(`https://www.google.com/maps?q=${latitude},${longitude}`);
        setQrLocationStatus("Location captured for Sagar sir and Sonali ma'am.");
      },
      () => {
        setQrLocationText("Location permission not shared");
        setQrMapLink("");
        setQrLocationStatus("Location not shared. Boss/admin must verify manually.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }

  function recordAttendance(
    memberName: string,
    checkIn: string,
    checkOut: string,
    status: AttendanceLog["status"],
    lateMinutes: number,
    details: Partial<AttendanceLog> = {},
  ) {
    const today = getTodayDate();
    setState((current) => ({
      ...current,
      attendanceLogs: (() => {
        const existingIndex = current.attendanceLogs.findIndex(
          (log) => log.member === memberName && log.date === today,
        );
        const nextLog: AttendanceLog = {
          id:
            existingIndex >= 0
              ? current.attendanceLogs[existingIndex].id
              : makeId("att"),
          member: memberName,
          date: today,
          checkIn,
          checkOut,
          status,
          lateMinutes,
          method: details.method || "Manual",
          verification: details.verification || "Verified",
          locationText: details.locationText || "Manual entry",
          mapLink: details.mapLink || "",
          alertText: details.alertText || "",
        };

        if (existingIndex >= 0) {
          return current.attendanceLogs.map((log, index) =>
            index === existingIndex ? nextLog : log,
          );
        }

        return [nextLog, ...current.attendanceLogs];
      })(),
      members: current.members.map((member) =>
        member.name === memberName && ["On time", "Late", "Absent"].includes(status)
          ? { ...member, attendance: status as Member["attendance"] }
          : member,
      ),
    }));
  }

  function markAttendance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManageManualAttendance) return;

    const form = new FormData(event.currentTarget);
    const memberName = String(form.get("member") || activeMember?.name || loggedInMember?.name || "Team");
    const status = String(form.get("status") || "On time") as AttendanceLog["status"];
    const checkIn = String(form.get("checkIn") || getCurrentClockTime());
    recordAttendance(
      memberName,
      checkIn,
      String(form.get("checkOut") || ""),
      status,
      Number(form.get("lateMinutes") || getLateMinutes(checkIn)),
      {
        method: "Manual",
        verification: "Verified",
        locationText: "Manual entry by Vishwatej",
      },
    );
    event.currentTarget.reset();
  }

  async function submitQrAttendance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const member = state.members.find((item) => item.id === qrMemberId) ?? activeMember;
    const isAllowed = await authenticateMember(member.id, qrPin);

    if (!isAllowed) {
      setQrError("Wrong attendance code. Select your own name and enter your code.");
      setQrMessage("");
      return;
    }

    const checkIn = getCurrentClockTime();
    const lateMinutes = getLateMinutes(checkIn);
    const status: AttendanceLog["status"] = lateMinutes > 0 ? "Late" : "On time";
    setQrScanTime(checkIn);

    recordAttendance(member.name, checkIn, "", status, lateMinutes, {
      method: "QR Scan",
      verification: "Pending",
      locationText: qrLocationText,
      mapLink: qrMapLink,
      alertText: `QR attendance alert sent inside system to Sagar sir (+91 95614 18247) and Sonali ma'am (91561 33718).`,
    });
    setActiveMemberId(member.id);
    setQrPin("");
    setQrError("");
    setQrMessage(
      `${member.name} attendance marked at ${checkIn} (${status}${
        lateMinutes ? `, ${lateMinutes} min late` : ""
      }).`,
    );
  }

  function quickUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const memberId = isAdmin
      ? String(form.get("member") || activeMemberId)
      : loggedInMemberId || activeMemberId;
    const attendance = String(form.get("attendance") || "On time") as Member["attendance"];
    setState((current) => ({
      ...current,
      members: current.members.map((member) =>
        member.id === memberId
          ? {
              ...member,
              attendance,
              calls: Number(form.get("calls") || member.calls),
              cv: Number(form.get("cv") || member.cv),
              interviews: Number(form.get("interviews") || member.interviews),
            }
          : member,
      ),
    }));
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const isAllowed = await authenticateMember(loginMemberId, loginPin);
    const profile = loginProfiles.find((item) => item.memberId === loginMemberId);

    if (!isAllowed || !profile) {
      setLoginError("Wrong code. Check your name and office code.");
      return;
    }

    setLoggedInMemberId(profile.memberId);
    setActiveMemberId(profile.memberId);
    setQrMemberId(profile.memberId);
    setActiveView(profile.access[0] ?? "Launch");
    setLoginPin("");
    setLoginError("");
    window.sessionStorage.setItem("ltsv-login-member", profile.memberId);
  }

  function logout() {
    window.sessionStorage.removeItem("ltsv-login-member");
    setLoggedInMemberId(null);
    setLoginPin("");
    setLoginError("");
    setActiveView("Launch");
  }

  function toggleFollowUp(id: string) {
    setState((current) => ({
      ...current,
      followUps: current.followUps.map((item) =>
        item.id === id
          ? { ...item, status: item.status === "Done" ? "Pending" : "Done" }
          : item,
      ),
    }));
  }

  if (isQrAttendanceMode) {
    const qrMember = state.members.find((member) => member.id === qrMemberId) ?? activeMember;
    const qrLateMinutes = getLateMinutes(qrScanTime);
    const qrStatus = qrLateMinutes > 0 ? "Late" : "On time";

    return (
      <main className="qr-shell">
        <section className="qr-card">
          <img
            alt="Life Time Success Vision logo"
            className="login-logo"
            src="/ltsv-logo.png"
          />
          <p className="eyebrow">QR Attendance</p>
          <h1>Mark Office Attendance</h1>
          <p className="login-copy">
            Scan time is taken from this phone. Select your name and mark your
            check-in for today.
          </p>
          <form className="form-stack" onSubmit={submitQrAttendance}>
            <select
              aria-label="Staff name for QR attendance"
              value={qrMemberId}
              onChange={(event) => setQrMemberId(event.target.value)}
            >
              {state.members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} - {member.role}
                </option>
              ))}
            </select>
            <div className="identity-lock form-lock">
              <span>Locked scan time</span>
              <strong>{qrScanTime}</strong>
            </div>
            <input
              aria-label="Attendance code"
              onChange={(event) => setQrPin(event.target.value)}
              placeholder="name@birthdate attendance code"
              type="password"
              value={qrPin}
            />
            <button
              className="secondary-button"
              onClick={captureQrLocation}
              type="button"
            >
              Capture Phone Location
            </button>
            <div className="scan-summary">
              <strong>Location proof</strong>
              <span>{qrLocationStatus}</span>
            </div>
            <div className="scan-summary">
              <strong>{qrMember.name}</strong>
              <span>
                {qrStatus}
                {qrLateMinutes ? ` / ${qrLateMinutes} min late` : ""}
              </span>
            </div>
            {qrError && <span className="login-error">{qrError}</span>}
            {qrMessage && <span className="success-message">{qrMessage}</span>}
            <button type="submit">Mark My Attendance</button>
            <button
              className="secondary-button"
              onClick={() => setQrScanTime(getCurrentClockTime())}
              type="button"
            >
              Refresh Current Time
            </button>
          </form>
          <button
            className="link-button"
            onClick={() => {
              window.location.hash = "";
              setIsQrAttendanceMode(false);
            }}
            type="button"
          >
            Open Staff Login
          </button>
        </section>
      </main>
    );
  }

  if (!loggedInMemberId) {
    return (
      <main className="login-shell">
        <section className="login-card">
          <img
            alt="Life Time Success Vision logo"
            className="login-logo"
            src="/ltsv-logo.png"
          />
          <p className="eyebrow">Life Time Success Vision</p>
          <h1>Staff Login</h1>
          <p className="login-copy">
            Select your name and enter your private name@birthdate office code.
          </p>
          <form className="form-stack" onSubmit={login}>
            <select
              aria-label="Staff name"
              value={loginMemberId}
              onChange={(event) => setLoginMemberId(event.target.value)}
            >
              {seedState.members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} - {member.role}
                </option>
              ))}
            </select>
            <input
              aria-label="Office access code"
              onChange={(event) => setLoginPin(event.target.value)}
              placeholder="name@birthdate office code"
              type="password"
              value={loginPin}
            />
            {loginError && <span className="login-error">{loginError}</span>}
            <button type="submit">Login</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Recruitment system navigation">
        <div className="brand-block">
          <img
            alt="Life Time Success Vision logo"
            className="brand-logo"
            src="/ltsv-logo.png"
          />
          <div>
            <p className="eyebrow">Life Time Success Vision</p>
            <h1>Office Control</h1>
          </div>
        </div>

        <nav className="nav-list">
          {visibleViews.map((view) => (
            <button
              className={activeView === view ? "nav-button active" : "nav-button"}
              key={view}
              onClick={() => setActiveView(view)}
              type="button"
            >
              <span aria-hidden="true">{view.slice(0, 1)}</span>
              {view}
            </button>
          ))}
        </nav>

        <div className="owner-panel">
          <p className="eyebrow">Logged In</p>
          <strong>{loggedInMember?.name}</strong>
          <span>{loggedInMember?.role}</span>
          <span>{isBoss ? "Full boss access" : "Personal access only"}</span>
          <button className="ghost-button" onClick={logout} type="button">
            Logout
          </button>
        </div>

        <div className="owner-panel compact">
          <p className="eyebrow">Boss View</p>
          <strong>{metrics.discipline}% discipline score</strong>
          <span>{saveStatus}</span>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">All-sector recruitment operating board</p>
            <h2>{activeView}</h2>
            <span className="brand-subline">We get to opportunity</span>
            <span className="clock-line">{currentDateTime}</span>
          </div>
          <div className="topbar-actions">
            <button className="ghost-button" type="button" onClick={refreshOfficeData}>
              Refresh Data
            </button>
            {isBoss ? (
              <select
                aria-label="Boss reviewing staff member"
                value={activeMember?.id}
                onChange={(event) => setActiveMemberId(event.target.value)}
              >
                {state.members.map((member) => (
                  <option key={member.id} value={member.id}>
                    Review {member.name} - {member.role}
                  </option>
                ))}
              </select>
            ) : (
              <div className="identity-lock">
                <span>Working as</span>
                <strong>{loggedInMember?.name}</strong>
              </div>
            )}
            <button type="button" onClick={() => setActiveView("Reports")}>
              Add Daily Report
            </button>
          </div>
        </header>

        {activeView === "Launch" && (
          <>
            <section className="launch-hero">
              <div>
                <p className="eyebrow">Final launch version</p>
                <h3>Life Time Success Vision Office System</h3>
                <p>
                  A daily control system for discipline, client development,
                  candidate pipeline, reports, and payment follow-up.
                </p>
              </div>
              <div className="launch-status">
                <span>Ready for office pilot</span>
                <strong>Today</strong>
              </div>
            </section>

            <section className="metric-grid" aria-label="Launch summary">
              <Metric label="Team logins" value={state.members.length} detail="staff profiles" />
              <Metric label="Client pipeline" value={state.clients.length} detail="accounts loaded" />
              <Metric label="Candidate stages" value={stages.length} detail="full workflow" />
              <Metric label="Daily reports" value={state.reports.length} detail="review history" />
              <Metric label="Money control" value={state.invoices.length} detail="invoice entries" />
              <Metric label="Discipline" value={`${metrics.discipline}%`} detail="target score" />
            </section>

            <section className="launch-grid">
              <div className="panel">
                <PanelHeader title="Launch Checklist" label="Day 1 activation" />
                <div className="check-list">
                  {launchChecklist.map((item, index) => (
                    <div className="check-row" key={item}>
                      <span>{index + 1}</span>
                      <strong>{item}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel">
                <PanelHeader title="Office Rhythm" label="Daily working system" />
                <div className="rhythm-list">
                  {operatingRhythm.map((item) => (
                    <article className="rhythm-row" key={item.time}>
                      <strong>{item.time}</strong>
                      <span>{item.action}</span>
                      <small>{item.owner}</small>
                    </article>
                  ))}
                </div>
              </div>

              <div className="panel wide">
                <PanelHeader title="Non-Negotiable Rules" label="Culture control" />
                <div className="rule-grid">
                  {launchRules.map((rule) => (
                    <article className="rule-card" key={rule}>
                      <span aria-hidden="true">OK</span>
                      <strong>{rule}</strong>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {activeView === "CEO" && (
          <>
            <section className="metric-grid" aria-label="CEO metrics">
              <Metric label="Discipline" value={`${metrics.discipline}%`} detail="team target score" />
              <Metric label="Open tasks" value={metrics.openTasks} detail={`${metrics.blockedTasks} blocked`} />
              <Metric label="Attendance" value={metrics.attendanceMarked} detail={`${metrics.lateToday} late today`} />
              <Metric label="Leave requests" value={metrics.pendingLeaves} detail="waiting for boss" />
              <Metric label="Gate passes" value={metrics.pendingGatePasses} detail="waiting for Sonali" />
              <Metric label="Active clients" value={metrics.activeClients} detail="live accounts" />
              <Metric label="Open positions" value={metrics.totalPositions} detail="to be closed" />
              <Metric label="Pending money" value={`Rs ${metrics.pendingAmount.toLocaleString("en-IN")}`} detail="not paid yet" />
            </section>

            <section className="ceo-grid">
              <div className="panel wide">
                <PanelHeader title="Performance Ranking" label="Target vs activity" />
                <div className="ranking-list">
                  {rankedMembers.map((member, index) => (
                    <article className="ranking-row" key={member.id}>
                      <span>{index + 1}</span>
                      <div>
                        <strong>{member.name}</strong>
                        <small>{member.role} / {member.targetText}</small>
                        <div className="progress-line wide-line" aria-hidden="true">
                          <i style={{ width: `${scoreMember(member)}%` }} />
                        </div>
                      </div>
                      <strong>{scoreMember(member)}%</strong>
                    </article>
                  ))}
                </div>
              </div>

              <div className="panel">
                <PanelHeader title="CEO Risk Queue" label="Needs decision" />
                <div className="risk-list">
                  {riskItems.length ? (
                    riskItems.map((item) => (
                      <article className="risk-card" key={`${item.label}-${item.title}`}>
                        <span className="tag payment">{item.label}</span>
                        <strong>{item.title}</strong>
                        <small>{item.owner}</small>
                      </article>
                    ))
                  ) : (
                    <article className="risk-card">
                      <span className="tag active">Clear</span>
                      <strong>No major risk pending</strong>
                      <small>Keep daily reporting strict.</small>
                    </article>
                  )}
                </div>
              </div>

              <div className="panel wide">
                <PanelHeader title="Business Movement" label="Client and vacancy health" />
                <div className="pipeline-bars">
                  {clientStatuses.map((status) => {
                    const count = state.clients.filter((client) => client.status === status).length;
                    return (
                      <div className="pipeline-bar" key={status}>
                        <span>{status}</span>
                        <div aria-hidden="true">
                          <i style={{ width: `${Math.min(100, count * 34)}%` }} />
                        </div>
                        <strong>{count}</strong>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="panel">
                <PanelHeader title="CEO Closing Routine" label="Evening review" />
                <div className="check-list">
                  {[
                    "Check late marks and weak target scores.",
                    "Grant or reject pending leave requests.",
                    "Check gate pass movement with Sonali ma'am.",
                    "Close or reassign blocked tasks.",
                    "Review pending invoices and payment calls.",
                    "Confirm tomorrow's top client and vacancy priorities.",
                  ].map((item, index) => (
                    <div className="check-row" key={item}>
                      <span>{index + 1}</span>
                      <strong>{item}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {activeView === "Control" && (
          <>
            <section className="metric-grid" aria-label="Office metrics">
              <Metric label="Active clients" value={metrics.activeClients} detail="signed or working" />
              <Metric label="Open roles" value={metrics.openRequirements} detail={`${metrics.totalPositions} positions`} />
              <Metric label="Interviews" value={metrics.interviews} detail="scheduled/done" />
              <Metric label="Today follow-ups" value={metrics.todayFollowUps} detail="pending only" />
              <Metric label="Joinings" value={metrics.joined} detail="confirmed records" />
              <Metric label="Pending invoices" value={metrics.pendingInvoices} detail={`Rs ${metrics.pendingAmount.toLocaleString("en-IN")}`} />
            </section>

            <section className="board-grid">
              <div className="panel wide">
                <PanelHeader title="Today Command Board" label="No verbal work - update here" />
                <div className="follow-list">
                  {state.followUps.map((item) => (
                    <button
                      className={item.status === "Done" ? "follow-row done" : "follow-row"}
                      key={item.id}
                      onClick={() => toggleFollowUp(item.id)}
                      type="button"
                    >
                      <span className={`tag ${item.type.toLowerCase()}`}>{item.type}</span>
                      <strong>{item.title}</strong>
                      <span>{item.owner}</span>
                      <span>{item.due}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="panel">
                <PanelHeader title="Team Pulse" label="Daily output" />
                <div className="team-stack">
                  {state.members.map((member) => (
                    <div className="member-line" key={member.id}>
                      <div>
                        <strong>{member.name}</strong>
                        <span>{member.role} / {member.desk}</span>
                        <div className="progress-line" aria-hidden="true">
                          <i style={{ width: `${scoreMember(member)}%` }} />
                        </div>
                      </div>
                      <div className="score-ring">{scoreMember(member)}%</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel wide">
                <PanelHeader title="Add Follow-up" label="Create work, assign owner" />
                <form className="form-grid" onSubmit={addFollowUp}>
                  <select name="type" aria-label="Follow-up type">
                    <option>Client</option>
                    <option>Candidate</option>
                    <option>Payment</option>
                    <option>Joining</option>
                  </select>
                  <input name="title" placeholder="Follow-up work" />
                  {isAdmin ? (
                    <select name="owner" aria-label="Follow-up owner" defaultValue={activeMember?.name}>
                      {assignableMembers.map((member) => (
                        <option key={member.id}>{member.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="identity-lock form-lock">
                      <span>Owner</span>
                      <strong>{loggedInMember?.name}</strong>
                    </div>
                  )}
                  <input name="due" placeholder="Due date/time" defaultValue="Today" />
                  <button type="submit">Add Follow-up</button>
                </form>
              </div>
            </section>
          </>
        )}

        {activeView === "Pipeline" && (
          <section className="board-grid">
            <div className="panel wide">
              <PanelHeader title="Open Requirements" label="Recruitment delivery" />
              <div className="data-table requirements-table">
                <div className="table-head">
                  <span>Role</span>
                  <span>Client</span>
                  <span>Openings</span>
                  <span>Status</span>
                </div>
                {state.requirements.map((item) => (
                  <div className="table-row" key={item.id}>
                    <span><strong>{item.title}</strong><small>{item.salary}</small></span>
                    <span>{item.company}</span>
                    <span>{item.positions}</span>
                    <select
                      aria-label={`Status for ${item.title}`}
                      value={item.status}
                      onChange={(event) =>
                        updateRequirementStatus(item.id, event.target.value as Requirement["status"])
                      }
                    >
                      {requirementStatuses.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <PanelHeader title="New Requirement" label="Client intake" />
              <form className="form-stack" onSubmit={addRequirement}>
                <input name="title" placeholder="Role title" />
                <input name="company" placeholder="Company" />
                <input name="positions" placeholder="Positions" type="number" min="1" />
                <input name="salary" placeholder="Salary range" />
                {isAdmin ? (
                  <select name="owner" aria-label="Requirement owner" defaultValue={activeMember?.name}>
                    {assignableMembers.map((member) => (
                      <option key={member.id}>{member.name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="identity-lock form-lock">
                    <span>Owner</span>
                    <strong>{loggedInMember?.name}</strong>
                  </div>
                )}
                <button type="submit">Add Requirement</button>
              </form>
            </div>

            <div className="panel wide">
              <PanelHeader title="Candidate Tracker" label="Stage movement" />
              <div className="candidate-grid">
                {state.candidates.map((item) => (
                  <div className="candidate-card" key={item.id}>
                    <div>
                      <strong>{item.name}</strong>
                      <span>{item.role} / {item.city}</span>
                      <small>{item.company} / {item.phone}</small>
                    </div>
                    <select
                      aria-label={`Stage for ${item.name}`}
                      value={item.stage}
                      onChange={(event) =>
                        updateCandidateStage(item.id, event.target.value as Candidate["stage"])
                      }
                    >
                      {stages.map((stage) => (
                        <option key={stage}>{stage}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <PanelHeader title="Add Candidate" label="Shared database" />
              <form className="form-stack" onSubmit={addCandidate}>
                <input name="name" placeholder="Candidate name" />
                <input name="role" placeholder="Role" />
                <input name="phone" placeholder="Phone" />
                <input name="city" placeholder="City" />
                <input name="company" placeholder="Target company" />
                {isAdmin ? (
                  <select name="owner" aria-label="Candidate owner" defaultValue={activeMember?.name}>
                    {assignableMembers.map((member) => (
                      <option key={member.id}>{member.name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="identity-lock form-lock">
                    <span>Owner</span>
                    <strong>{loggedInMember?.name}</strong>
                  </div>
                )}
                <button type="submit">Add Candidate</button>
              </form>
            </div>
          </section>
        )}

        {activeView === "Clients" && (
          <section className="board-grid">
            <div className="panel wide">
              <PanelHeader title="Client Accounts" label="BDO control" />
              <div className="client-list">
                {state.clients.map((client) => (
                  <article className="client-card" key={client.id}>
                    <div>
                      <span className="tag active">{client.status}</span>
                      <h3>{client.company}</h3>
                      <p>{client.industry} / {client.city}</p>
                    </div>
                    <div>
                      <strong>{client.contact}</strong>
                      <span>{client.model}</span>
                    </div>
                    <div>
                      <strong>{client.owner}</strong>
                      <span>{client.nextFollowUp}</span>
                      <select
                        aria-label={`Client status for ${client.company}`}
                        value={client.status}
                        onChange={(event) =>
                          updateClientStatus(client.id, event.target.value as Client["status"])
                        }
                      >
                        {clientStatuses.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="panel">
              <PanelHeader title="Add Client" label="New business" />
              <form className="form-stack" onSubmit={addClient}>
                <input name="company" placeholder="Company name" />
                <input name="contact" placeholder="HR/contact person" />
                <input name="city" placeholder="City" />
                <input name="industry" placeholder="Industry" />
                <select name="model" aria-label="Commercial model">
                  <option>8.33% Annual CTC</option>
                  <option>10% Monthly</option>
                  <option>60% One Month Salary</option>
                </select>
                <input
                  name="customModel"
                  placeholder="Custom negotiated model, e.g. 5% Annual CTC"
                />
                {isAdmin ? (
                  <select name="owner" aria-label="Client owner" defaultValue={activeMember?.name}>
                    {assignableMembers.map((member) => (
                      <option key={member.id}>{member.name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="identity-lock form-lock">
                    <span>Owner</span>
                    <strong>{loggedInMember?.name}</strong>
                  </div>
                )}
                <input name="nextFollowUp" placeholder="Next follow-up" />
                <button type="submit">Add Client</button>
              </form>
            </div>
          </section>
        )}

        {activeView === "Team" && (
          <section className="board-grid">
            <div className="panel wide">
              <PanelHeader title="Staff Discipline Sheet" label="Attendance and activity" />
              <div className="data-table team-table">
                <div className="table-head">
                  <span>Name</span>
                  <span>Attendance</span>
                  <span>Calls</span>
                  <span>CVs</span>
                  <span>Interviews</span>
                  <span>Score</span>
                </div>
                {state.members.map((member) => {
                  const sameDayStatus = getMemberAttendanceStatus(
                    state.attendanceLogs,
                    member.name,
                    attendanceDisplayDate,
                  );

                  return (
                    <div className="table-row" key={member.id}>
                      <span>
                        <strong>{member.name}</strong>
                        <small>{member.role} / {member.desk}</small>
                        <small>{member.email}</small>
                      </span>
                      <span className={`attendance ${sameDayStatus.toLowerCase().replace(" ", "-")}`}>
                        {sameDayStatus}
                      </span>
                      <span>{member.calls}</span>
                      <span>{member.cv}</span>
                      <span>{member.interviews}</span>
                      <span>{scoreMember(member)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="panel">
              <PanelHeader title="Quick Staff Update" label="Attendance and target" />
              <form className="form-stack" onSubmit={quickUpdate}>
                <select name="member" aria-label="Staff member" defaultValue={activeMember?.id}>
                  {state.members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
                <select name="attendance" aria-label="Attendance">
                  <option>On time</option>
                  <option>Late</option>
                  <option>Absent</option>
                </select>
                <input name="calls" placeholder="Calls completed" type="number" min="0" />
                <input name="cv" placeholder="CVs / applications" type="number" min="0" />
                <input name="interviews" placeholder="Interviews scheduled" type="number" min="0" />
                <button type="submit">Update Staff</button>
              </form>
            </div>

            <div className="panel wide">
              <PanelHeader title="Role Playbook" label="Who does what" />
              <div className="role-list">
              {state.members.map((member) => (
                <article className="role-card" key={`${member.id}-role`}>
                  <strong>{member.name}</strong>
                  <span>{member.role}</span>
                  <small>{member.email}</small>
                  <p>{member.responsibility}</p>
                  <small>Target: {member.targetText}</small>
                </article>
              ))}
              </div>
            </div>
          </section>
        )}

        {activeView === "Tasks" && (
          <section className="board-grid">
            <div className="panel wide">
              <PanelHeader title="Task Assignment Board" label="Boss to staff execution" />
              <div className="data-table task-table">
                <div className="table-head">
                  <span>Task</span>
                  <span>Owner</span>
                  <span>Due</span>
                  <span>Priority</span>
                  <span>Status</span>
                </div>
                {visibleTasks.map((task) => (
                  <div className="table-row" key={task.id}>
                    <span>
                      <strong>{task.title}</strong>
                      <small>{task.notes || `Assigned by ${task.assignedBy}`}</small>
                    </span>
                    <span>{task.owner}</span>
                    <span>{task.due}</span>
                    <span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
                    <select
                      aria-label={`Task status for ${task.title}`}
                      value={task.status}
                      onChange={(event) =>
                        updateTaskStatus(task.id, event.target.value as Task["status"])
                      }
                    >
                      {taskStatuses.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              {isAdmin ? (
                <>
                  <PanelHeader title="Assign Task" label="Owner, deadline, priority" />
                  <form className="form-stack" onSubmit={addTask}>
                    <input name="title" placeholder="Task title" />
                    <select name="owner" aria-label="Task owner" defaultValue={activeMember?.name}>
                      {assignableMembers.map((member) => (
                        <option key={member.id}>{member.name}</option>
                      ))}
                    </select>
                    <input name="due" placeholder="Due date/time" defaultValue="Today" />
                    <select name="priority" aria-label="Priority">
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                    <textarea name="notes" placeholder="Notes / expected output" rows={3} />
                    <button type="submit">Assign Task</button>
                  </form>
                </>
              ) : (
                <>
                  <PanelHeader title="My Task Access" label="Personal work only" />
                  <div className="access-note">
                    <strong>{loggedInMember?.name}</strong>
                    <span>You can update only tasks assigned to your name.</span>
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {activeView === "Attendance" && (
          <section className="board-grid">
            <div className="panel wide">
              <PanelHeader title="Attendance and Late Mark" label="Date-wise discipline history" />
              <div className="salary-controls">
                <label className="time-field">
                  <span>Attendance date</span>
                  <input
                    type="date"
                    value={attendanceHistoryDate}
                    onChange={(event) => setAttendanceHistoryDate(event.target.value)}
                  />
                </label>
                <div className="identity-lock">
                  <span>Today board resets at</span>
                  <strong>11:00 PM</strong>
                </div>
              </div>
              <div className="data-table attendance-table">
                <div className="table-head">
                  <span>Staff</span>
                  <span>Date</span>
                  <span>In</span>
                  <span>Status</span>
                  <span>Verify</span>
                  <span>Proof</span>
                </div>
                {dateWiseAttendanceRows.map((log) => (
                  <div className="table-row" key={log.id}>
                    <span><strong>{log.member}</strong></span>
                    <span>{log.date}</span>
                    <span>{log.checkIn}</span>
                    <span className={`attendance ${log.status.toLowerCase().replace(" ", "-")}`}>
                      {log.status}
                    </span>
                    <span className={`permission ${(log.verification || "Verified").toLowerCase()}`}>
                      {log.verification || "Verified"}
                    </span>
                    <span>
                      {log.mapLink ? (
                        <a href={log.mapLink} target="_blank" rel="noreferrer">
                          Map proof
                        </a>
                      ) : (
                        <small>{log.locationText || `${log.lateMinutes} min late`}</small>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              {isAdmin && (
                <div className="alert-panel">
                  <PanelHeader title="Attendance Alerts" label="Sagar + Sonali" />
                  {attendanceAlerts.length ? (
                    attendanceAlerts.map((log) => (
                      <article className="alert-card" key={`${log.id}-alert`}>
                        <strong>{log.member}</strong>
                        <span>{log.checkIn} / {log.locationText || "Location not captured"}</span>
                        {log.mapLink && (
                          <a href={log.mapLink} target="_blank" rel="noreferrer">
                            Open map proof
                          </a>
                        )}
                        <small>{log.alertText || "QR attendance alert pending."}</small>
                        <div className="decision-actions">
                          <button
                            className="grant-button"
                            onClick={() => updateAttendanceVerification(log.id, "Verified")}
                            type="button"
                          >
                            Verify
                          </button>
                          <button
                            className="reject-button"
                            onClick={() => updateAttendanceVerification(log.id, "Rejected")}
                            type="button"
                          >
                            Reject
                          </button>
                        </div>
                      </article>
                    ))
                  ) : (
                    <article className="alert-card">
                      <strong>No QR alert pending</strong>
                      <span>New scans will appear here for checking.</span>
                    </article>
                  )}
                </div>
              )}
              <PanelHeader title="Mark Attendance" label="Phone check-in entry" />
              <div className="qr-print-card">
                <img
                  alt="Office attendance QR code"
                  className="qr-code"
                  src={attendanceQrImage}
                />
                <div>
                  <strong>Office QR Code</strong>
                  <span>Paste this at the office entrance.</span>
                  <a href={attendanceQrLink} target="_blank" rel="noreferrer">
                    Open scan page
                  </a>
                </div>
              </div>
              {canManageManualAttendance ? (
                <form className="form-stack" onSubmit={markAttendance}>
                  <select name="member" aria-label="Attendance member" defaultValue={activeMember?.name}>
                    {state.members.map((member) => (
                      <option key={member.id}>{member.name}</option>
                    ))}
                  </select>
                  <input name="checkIn" placeholder="Check-in time, e.g. 09:55" />
                  <input name="checkOut" placeholder="Check-out time, optional" />
                  <select name="status" aria-label="Attendance status">
                    <option>On time</option>
                    <option>Late</option>
                    <option>Absent</option>
                    <option>Half day</option>
                  </select>
                  <input name="lateMinutes" placeholder="Late minutes" type="number" min="0" />
                  <button type="submit">Mark Manual Attendance</button>
                </form>
              ) : (
                <div className="access-note">
                  <strong>Manual entry locked</strong>
                  <span>Only Vishwatej can add manual attendance. Everyone else must use QR scan.</span>
                </div>
              )}
            </div>
          </section>
        )}

        {activeView === "Leave" && (
          <section className="board-grid">
            <div className="panel wide">
              <PanelHeader
                title="Leave Permission Board"
                label={isBoss ? "Boss approval queue" : "My leave requests"}
              />
              <div className="data-table leave-table">
                <div className="table-head">
                  <span>Staff</span>
                  <span>Dates</span>
                  <span>Reason</span>
                  <span>Status</span>
                  <span>Boss decision</span>
                </div>
                {visibleLeaveRequests.map((leave) => (
                  <div className="table-row" key={leave.id}>
                    <span>
                      <strong>{leave.member}</strong>
                      <small>Requested {leave.requestedOn}</small>
                    </span>
                    <span>{leave.fromDate} to {leave.toDate}</span>
                    <span>{leave.reason}</span>
                    <span className={`permission ${leave.status.toLowerCase()}`}>
                      {leave.status}
                    </span>
                    <span>
                      {isBoss && leave.status === "Pending" ? (
                        <div className="decision-actions">
                          <button
                            className="grant-button"
                            onClick={() => updateLeaveStatus(leave.id, "Granted")}
                            type="button"
                          >
                            Grant
                          </button>
                          <button
                            className="reject-button"
                            onClick={() => updateLeaveStatus(leave.id, "Rejected")}
                            type="button"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <small>{leave.decidedBy || "Waiting for Sagar sir"}</small>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <PanelHeader title="Request Leave" label="Send to boss" />
              <form className="form-stack" onSubmit={addLeaveRequest}>
                {isBoss ? (
                  <select name="member" aria-label="Leave request member" defaultValue={activeMember?.name}>
                    {state.members.map((member) => (
                      <option key={member.id}>{member.name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="identity-lock form-lock">
                    <span>Request by</span>
                    <strong>{loggedInMember?.name}</strong>
                  </div>
                )}
                <label className="time-field">
                  <span>From date</span>
                  <input name="fromDate" type="date" />
                </label>
                <label className="time-field">
                  <span>To date</span>
                  <input name="toDate" type="date" />
                </label>
                <textarea
                  name="reason"
                  placeholder="Reason for leave permission"
                  rows={4}
                />
                <button type="submit">Submit Leave Request</button>
              </form>
              {!isBoss && (
                <div className="access-note">
                  <strong>Approval rule</strong>
                  <span>Your leave is pending until Sagar sir marks it Granted.</span>
                </div>
              )}
            </div>
          </section>
        )}

        {activeView === "Gate Pass" && (
          <section className="board-grid">
            <div className="panel wide">
              <PanelHeader
                title="Gate Pass Board"
                label={isSonali ? "Sonali approval queue" : "Office movement control"}
              />
              <div className="data-table gate-table">
                <div className="table-head">
                  <span>Staff</span>
                  <span>Destination</span>
                  <span>Out / Return</span>
                  <span>Status</span>
                  <span>Approval</span>
                </div>
                {visibleGatePassRequests.map((pass) => (
                  <div className="table-row" key={pass.id}>
                    <span>
                      <strong>{pass.member}</strong>
                      <small>Requested {pass.requestedOn}</small>
                    </span>
                    <span>
                      <strong>{pass.destination}</strong>
                      <small>{pass.reason}</small>
                    </span>
                    <span>{pass.outTime} / {pass.expectedReturn}</span>
                    <span className={`permission ${pass.status.toLowerCase()}`}>
                      {pass.status}
                    </span>
                    <span>
                      {isSonali && pass.status === "Pending" ? (
                        <div className="decision-actions">
                          <button
                            className="grant-button"
                            onClick={() => updateGatePassStatus(pass.id, "Granted")}
                            type="button"
                          >
                            Grant
                          </button>
                          <button
                            className="reject-button"
                            onClick={() => updateGatePassStatus(pass.id, "Rejected")}
                            type="button"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <small>{pass.decidedBy || "Waiting for Sonali ma'am"}</small>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <PanelHeader title="Request Gate Pass" label="Before leaving office" />
              <form className="form-stack" onSubmit={addGatePassRequest}>
                {isAdmin ? (
                  <select name="member" aria-label="Gate pass member" defaultValue={activeMember?.name}>
                    {state.members.map((member) => (
                      <option key={member.id}>{member.name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="identity-lock form-lock">
                    <span>Request by</span>
                    <strong>{loggedInMember?.name}</strong>
                  </div>
                )}
                <input name="destination" placeholder="Where are you going?" />
                <textarea name="reason" placeholder="Reason for gate pass" rows={3} />
                <input name="outTime" placeholder="Out time, e.g. 03:30 PM" />
                <input name="expectedReturn" placeholder="Expected return, e.g. 05:30 PM" />
                <button type="submit">Submit Gate Pass</button>
              </form>
              <div className="access-note">
                <strong>Approval rule</strong>
                <span>Gate pass is valid only after Sonali ma'am marks it Granted.</span>
              </div>
            </div>
          </section>
        )}

        {activeView === "Money" && canViewMoney && (
          <section className="board-grid">
            <div className="panel wide">
              <PanelHeader
                title="Invoice and Payment Tracker"
                label={canManageMoney ? "Rohan payment control" : "View only"}
              />
              <div className="data-table money-table">
                <div className="table-head">
                  <span>Client</span>
                  <span>Candidate</span>
                  <span>Amount</span>
                  <span>Owner</span>
                  <span>Status</span>
                </div>
                {state.invoices.map((invoice) => (
                  <div className="table-row" key={invoice.id}>
                    <span>
                      <strong>{invoice.company}</strong>
                      <small>{invoice.due}</small>
                    </span>
                    <span>{invoice.candidate}</span>
                    <span>Rs {invoice.amount.toLocaleString("en-IN")}</span>
                    <span>{invoice.owner}</span>
                    <select
                      aria-label={`Invoice status for ${invoice.company}`}
                      disabled={!canManageMoney}
                      value={invoice.status}
                      onChange={(event) =>
                        updateInvoiceStatus(invoice.id, event.target.value as Invoice["status"])
                      }
                    >
                      {invoiceStatuses.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <PanelHeader
                title="Create Invoice Entry"
                label={canManageMoney ? "After joining" : "Rohan only"}
              />
              {canManageMoney ? (
                <form className="form-stack" onSubmit={addInvoice}>
                  <input name="company" placeholder="Client company" />
                  <input name="candidate" placeholder="Candidate / joining batch" />
                  <input name="amount" placeholder="Invoice amount" type="number" min="0" />
                  <div className="identity-lock form-lock">
                    <span>Money handled by</span>
                    <strong>{loggedInMember?.name || "Rohan Dangle"}</strong>
                  </div>
                  <input name="due" placeholder="Due / payment follow-up" />
                  <button type="submit">Add Invoice</button>
                </form>
              ) : (
                <div className="access-note">
                  <strong>Money access is view only</strong>
                  <span>Invoice and payment entries are handled only by Rohan sir.</span>
                </div>
              )}
            </div>
          </section>
        )}

        {activeView === "Reports" && (
          <section className="board-grid">
            <div className="panel">
              <PanelHeader title="Daily Report" label="End of day" />
              <form className="form-stack" onSubmit={addDailyReport}>
                {isAdmin ? (
                  <select name="member" aria-label="Report member" defaultValue={activeMember?.name}>
                    {assignableMembers.map((member) => (
                      <option key={member.id}>{member.name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="identity-lock form-lock">
                    <span>Report by</span>
                    <strong>{loggedInMember?.name}</strong>
                  </div>
                )}
                <textarea name="completed" placeholder="Completed today" rows={4} />
                <textarea name="stuck" placeholder="Stuck / support needed" rows={3} />
                <textarea name="tomorrow" placeholder="Tomorrow focus" rows={3} />
                <button type="submit">Submit Report</button>
              </form>
            </div>

            <div className="panel wide">
              <PanelHeader title="Report History" label="Boss review" />
              <div className="report-list">
                {visibleReports.map((report) => (
                  <article className="report-card" key={report.id}>
                    <header>
                      <strong>{report.member}</strong>
                      <span>{report.date}</span>
                    </header>
                    <p>{report.completed}</p>
                    <small>Blocker: {report.stuck}</small>
                    <small>Next: {report.tomorrow}</small>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeView === "Salary Slip" && canViewSalarySlip && (
          <section className="board-grid">
            <div className="panel wide">
              <PanelHeader
                title="Salary Slip"
                label={canEditSalarySlip ? "Sonali payroll control" : "Boss payroll view"}
              />
              <div className="salary-controls">
                <label className="time-field">
                  <span>Salary month</span>
                  <input
                    type="month"
                    value={salaryMonth}
                    onChange={(event) => setSalaryMonth(event.target.value)}
                  />
                </label>
                <label className="time-field">
                  <span>Employee</span>
                  <select
                    value={salaryMemberId}
                    onChange={(event) => setSalaryMemberId(event.target.value)}
                  >
                    {salaryProfiles.map((profile) => (
                      <option key={profile.memberId} value={profile.memberId}>
                        {profile.salaryName} - {profile.designation}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="button" onClick={downloadSalarySlip}>
                  Download Salary Slip
                </button>
              </div>

              <div className="salary-slip-preview">
                <div className="salary-slip-head">
                  <div>
                    <h3>{companyPayrollInfo.name}</h3>
                    <span>{companyPayrollInfo.address}</span>
                    <span>
                      {companyPayrollInfo.phone} | {companyPayrollInfo.email}
                    </span>
                  </div>
                  <img alt="LTSV logo" src="/ltsv-logo.png" />
                </div>
                <div className="salary-slip-title">
                  <strong>PAY SLIP</strong>
                  <span>{salarySlip.monthLabel}</span>
                </div>
                <div className="salary-info-grid">
                  <div><strong>Name</strong><span>{salarySlip.profile.salaryName}</span></div>
                  <div><strong>DOB</strong><span>{salarySlip.profile.dob}</span></div>
                  <div><strong>Designation</strong><span>{salarySlip.profile.designation}</span></div>
                  <div><strong>DOJ</strong><span>{salarySlip.profile.doj}</span></div>
                  <div><strong>Location</strong><span>{salarySlip.profile.location}</span></div>
                  <div><strong>Aadhaar</strong><span>{salarySlip.profile.aadhaarMasked}</span></div>
                  <div><strong>Department</strong><span>{salarySlip.profile.department}</span></div>
                  <div><strong>Days in Month</strong><span>{salarySlip.daysInMonth}</span></div>
                  <div><strong>Present Days</strong><span>{salarySlip.presentDays}</span></div>
                  <div><strong>Attendance Present</strong><span>{salarySlip.attendancePresentDays}</span></div>
                  <div><strong>Paid Sundays</strong><span>{salarySlip.paidSundayDays}</span></div>
                  <div><strong>Payable Days</strong><span>{salarySlip.payableDays}</span></div>
                  <div><strong>LOP Days</strong><span>{salarySlip.lopDays}</span></div>
                  <div><strong>Unscanned Absents</strong><span>{salarySlip.missingAttendanceDays}</span></div>
                  <div><strong>Late Marks</strong><span>{salarySlip.lateCount}</span></div>
                  <div><strong>Late Deduction</strong><span>{salarySlip.latePenaltyDays} day</span></div>
                </div>

                <div className="salary-columns">
                  <div className="salary-box">
                    <h4>Earnings</h4>
                    <div><span>Basic</span><strong>Rs {formatMoney(salarySlip.basic)}</strong></div>
                    <div><span>House Rent Allowance</span><strong>Rs {formatMoney(salarySlip.hra)}</strong></div>
                    <div><span>Special Allowance</span><strong>Rs {formatMoney(salarySlip.specialAllowance)}</strong></div>
                    <div><span>Incentive</span><strong>Rs {formatMoney(salarySlip.incentive)}</strong></div>
                    <div><span>Other Allowance</span><strong>Rs {formatMoney(salarySlip.otherAllowance)}</strong></div>
                    <div className="salary-total"><span>Total Earnings</span><strong>Rs {formatMoney(salarySlip.totalEarnings)}</strong></div>
                  </div>
                  <div className="salary-box">
                    <h4>Deductions</h4>
                    <div><span>Leave + Late Deduction</span><strong>Rs {formatMoney(salarySlip.leaveDeduction + salarySlip.lateDeduction)}</strong></div>
                    <div><span>Employee PF Contribution</span><strong>Rs 0</strong></div>
                    <div><span>Advance Amount</span><strong>Rs {formatMoney(salarySlip.advanceAmount)}</strong></div>
                    <div><span>PT</span><strong>Rs 0</strong></div>
                    <div><span>ESIC</span><strong>Rs 0</strong></div>
                    <div className="salary-total"><span>Total Deduction</span><strong>Rs {formatMoney(salarySlip.totalDeduction)}</strong></div>
                  </div>
                </div>

                <div className="salary-net">
                  <span>In Hand</span>
                  <strong>Rs {formatMoney(salarySlip.inHand)}</strong>
                  <small>{salarySlip.inWords}</small>
                </div>
              </div>
            </div>

            <div className="panel">
              <PanelHeader
                title="Monthly Adjustments"
                label={canEditSalarySlip ? "Editable by Sonali ma'am" : "View only"}
              />
              <div className="form-stack">
                <label className="time-field">
                  <span>Advance cash</span>
                  <input
                    disabled={!canEditSalarySlip}
                    min="0"
                    onChange={(event) => updateSalaryAdjustment("advanceAmount", event.target.value)}
                    type="number"
                    value={salaryAdjustment.advanceAmount}
                  />
                </label>
                <label className="time-field">
                  <span>Incentive</span>
                  <input
                    disabled={!canEditSalarySlip}
                    min="0"
                    onChange={(event) => updateSalaryAdjustment("incentive", event.target.value)}
                    type="number"
                    value={salaryAdjustment.incentive}
                  />
                </label>
                <label className="time-field">
                  <span>Special allowance</span>
                  <input
                    disabled={!canEditSalarySlip}
                    min="0"
                    onChange={(event) => updateSalaryAdjustment("specialAllowance", event.target.value)}
                    type="number"
                    value={salaryAdjustment.specialAllowance}
                  />
                </label>
                <label className="time-field">
                  <span>Other allowance</span>
                  <input
                    disabled={!canEditSalarySlip}
                    min="0"
                    onChange={(event) => updateSalaryAdjustment("otherAllowance", event.target.value)}
                    type="number"
                    value={salaryAdjustment.otherAllowance}
                  />
                </label>
                <label className="time-field">
                  <span>Manual extra LOP days</span>
                  <input
                    disabled={!canEditSalarySlip}
                    min="0"
                    onChange={(event) => updateSalaryAdjustment("manualLopDays", event.target.value)}
                    step="0.5"
                    type="number"
                    value={salaryAdjustment.manualLopDays}
                  />
                </label>
                <textarea
                  disabled={!canEditSalarySlip}
                  onChange={(event) => updateSalaryAdjustment("notes", event.target.value)}
                  placeholder="Payroll notes"
                  rows={3}
                  value={salaryAdjustment.notes}
                />
              </div>
              <div className="access-note">
                <strong>Calculation rule</strong>
                <span>
                  Salary is divided by days in month. Sundays are paid weekly
                  off days and do not need QR attendance. Non-paid leave/absent
                  days are LOP. 3-4 late marks deduct half day; 5 or more late
                  marks deduct one full day.
                </span>
              </div>
            </div>
          </section>
        )}

        {activeView === "Export" && (
          <section className="board-grid">
            <div className="panel wide">
              <PanelHeader title="Export Data" label="Saved office records" />
              <div className="export-intro">
                <strong>Use this when Sagar sir asks for old records.</strong>
                <span>
                  Download CSV files for Excel, or download one full backup file for complete
                  system data.
                </span>
              </div>
              <div className="export-grid">
                {exportSets.map((set) => (
                  <article className="export-card" key={set.fileName}>
                    <div>
                      <strong>{set.title}</strong>
                      <span>{set.description}</span>
                      <small>{set.rows.length} saved records</small>
                    </div>
                    <button
                      type="button"
                      onClick={() => exportCsv(set.fileName, set.columns, set.rows)}
                    >
                      Download CSV
                    </button>
                  </article>
                ))}
              </div>
            </div>

            <div className="panel">
              <PanelHeader title="Full Backup" label="Complete system copy" />
              <div className="access-note">
                <strong>For monthly safety</strong>
                <span>
                  This downloads one full file containing staff, clients, candidates,
                  attendance, reports, leave, gate pass, tasks, and money records.
                </span>
              </div>
              <button type="button" onClick={exportFullBackup}>
                Download Full Backup
              </button>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function PanelHeader({ title, label }: { title: string; label: string }) {
  return (
    <header className="panel-header">
      <div>
        <p className="eyebrow">{label}</p>
        <h3>{title}</h3>
      </div>
    </header>
  );
}
