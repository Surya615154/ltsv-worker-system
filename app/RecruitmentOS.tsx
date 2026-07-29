"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

const attendanceQrLink =
  "https://ltsv-worker-system.suryawanshivishal625.chatgpt.site/#qr-attendance";
const attendanceQrImage =
  "https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=16&data=https%3A%2F%2Fltsv-worker-system.suryawanshivishal625.chatgpt.site%2F%23qr-attendance";
const officeStartTime = "10:00";

type Member = {
  id: string;
  name: string;
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
};

type OfficeState = {
  members: Member[];
  clients: Client[];
  requirements: Requirement[];
  candidates: Candidate[];
  followUps: FollowUp[];
  reports: DailyReport[];
  invoices: Invoice[];
  tasks: Task[];
  attendanceLogs: AttendanceLog[];
};

type LoginProfile = {
  memberId: string;
  pin: string;
  access: string[];
};

const seedState: OfficeState = {
  members: [
    {
      id: "m1",
      name: "Sagar Sonawane",
      role: "Director / Owner",
      desk: "Boss control",
      responsibility:
        "Check if everyone is working properly, assign roles, review activity, and take final decisions.",
      targetText: "Morning work allocation + evening review of every staff member",
      attendance: "On time",
      calls: 12,
      cv: 0,
      interviews: 2,
      target: 20,
    },
    {
      id: "m2",
      name: "Sonali Shingre Ma'am",
      role: "HR Head / Admin",
      desk: "HR and candidate handling",
      responsibility:
        "Candidate handling, calling, vacancy finding, admin coordination, and HR process discipline.",
      targetText: "40 candidate/client coordination calls + vacancy update sheet",
      attendance: "On time",
      calls: 38,
      cv: 8,
      interviews: 3,
      target: 50,
    },
    {
      id: "m3",
      name: "Vishwatej Suryawanshi",
      role: "BDO",
      desk: "Company approach",
      responsibility:
        "Company approach, permission calls, meeting scheduling, client visits, agreements, and business follow-up.",
      attendance: "On time",
      targetText: "35 company calls + 5 hot follow-ups + 1 meeting/visit pipeline",
      calls: 32,
      cv: 0,
      interviews: 0,
      target: 35,
    },
    {
      id: "m4",
      name: "Rohan Dongre",
      role: "Recruiter",
      desk: "Sourcing to joining",
      responsibility:
        "Screening, sourcing, interview scheduling, candidate follow-up, joining confirmation, and invoice generation.",
      targetText: "50 sourcing calls + 10 screened CVs + interview/joining follow-up",
      attendance: "On time",
      calls: 46,
      cv: 10,
      interviews: 5,
      target: 60,
    },
    {
      id: "m5",
      name: "Laxmi",
      role: "Coordinator",
      desk: "Candidate application calling",
      responsibility:
        "Cold calling candidates, collecting applications, updating basic details, and forwarding interested candidates.",
      targetText: "80 candidate cold calls + 20 application entries",
      attendance: "On time",
      calls: 72,
      cv: 14,
      interviews: 0,
      target: 85,
    },
    {
      id: "m6",
      name: "Preeti",
      role: "Coordinator",
      desk: "Candidate application calling",
      responsibility:
        "Cold calling candidates, collecting applications, updating basic details, and forwarding interested candidates.",
      targetText: "80 candidate cold calls + 20 application entries",
      attendance: "On time",
      calls: 68,
      cv: 12,
      interviews: 0,
      target: 85,
    },
  ],
  clients: [
    {
      id: "cl1",
      company: "Press Metal Industries",
      contact: "HR / Plant Admin",
      city: "Nashik",
      industry: "Manufacturing",
      status: "Active",
      model: "8.33% Annual CTC",
      owner: "Vishwatej Suryawanshi",
      nextFollowUp: "Today 4:30 PM",
    },
    {
      id: "cl2",
      company: "NMD",
      contact: "HR Team",
      city: "Nashik",
      industry: "Multi-sector",
      status: "Active",
      model: "10% Monthly",
      owner: "Sagar Sonawane",
      nextFollowUp: "Tomorrow",
    },
    {
      id: "cl3",
      company: "Biolaxi Enzymes",
      contact: "HR / Operations",
      city: "Nashik",
      industry: "Pharma / Biotech",
      status: "Agreement Sent",
      model: "60% One Month Salary",
      owner: "Vishwatej Suryawanshi",
      nextFollowUp: "This week",
    },
  ],
  requirements: [
    {
      id: "r1",
      title: "Production Operator",
      company: "Press Metal Industries",
      positions: 10,
      salary: "As per company budget",
      priority: "High",
      status: "Interview",
      owner: "Rohan Dongre",
    },
    {
      id: "r2",
      title: "Helper / Worker",
      company: "NMD",
      positions: 15,
      salary: "As per requirement",
      priority: "Medium",
      status: "Sourcing",
      owner: "Laxmi",
    },
    {
      id: "r3",
      title: "Lab Assistant",
      company: "Biolaxi Enzymes",
      positions: 3,
      salary: "18k-25k",
      priority: "High",
      status: "Vacancy Found",
      owner: "Sonali Shingre Ma'am",
    },
  ],
  candidates: [
    {
      id: "ca1",
      name: "Sample Candidate 1",
      role: "Production Operator",
      phone: "98xxxxxx10",
      city: "Nashik",
      stage: "Interview Scheduled",
      owner: "Rohan Dongre",
      company: "Press Metal Industries",
    },
    {
      id: "ca2",
      name: "Sample Candidate 2",
      role: "Helper / Worker",
      phone: "90xxxxxx22",
      city: "Nashik",
      stage: "Application",
      owner: "Preeti",
      company: "NMD",
    },
  ],
  followUps: [
    {
      id: "f1",
      type: "Client",
      title: "Follow up with Biolaxi Enzymes for agreement confirmation",
      owner: "Vishwatej Suryawanshi",
      due: "Today",
      status: "Pending",
    },
    {
      id: "f2",
      type: "Joining",
      title: "Confirm Press Metal interview schedule",
      owner: "Rohan Dongre",
      due: "Today",
      status: "Pending",
    },
    {
      id: "f3",
      type: "Payment",
      title: "Prepare invoice status after joining confirmation",
      owner: "Rohan Dongre",
      due: "Tomorrow",
      status: "Pending",
    },
    {
      id: "f4",
      type: "Candidate",
      title: "Cold calling application batch update",
      owner: "Laxmi / Preeti",
      due: "Today",
      status: "Pending",
    },
  ],
  reports: [
    {
      id: "d1",
      member: "Vishwatej Suryawanshi",
      date: getTodayDate(),
      completed: "Company calls, permission follow-ups, and meeting pipeline updated",
      stuck: "Need decision on next client visit priority",
      tomorrow: "Push agreement follow-up and schedule one client meeting",
    },
  ],
  invoices: [
    {
      id: "i1",
      company: "Press Metal Industries",
      candidate: "Sample Candidate 1",
      amount: 12500,
      owner: "Rohan Dongre",
      status: "Draft",
      due: "After joining",
    },
    {
      id: "i2",
      company: "NMD",
      candidate: "Joining batch",
      amount: 18000,
      owner: "Sagar Sonawane",
      status: "Payment Pending",
      due: "This week",
    },
  ],
  tasks: [
    {
      id: "t1",
      title: "Confirm Press Metal interview batch",
      owner: "Rohan Dongre",
      assignedBy: "Sagar Sonawane",
      due: "Today 3:00 PM",
      priority: "High",
      status: "In Progress",
      notes: "Candidate calls and timing confirmation before client update.",
    },
    {
      id: "t2",
      title: "Schedule Biolaxi agreement follow-up",
      owner: "Vishwatej Suryawanshi",
      assignedBy: "Sagar Sonawane",
      due: "Today",
      priority: "High",
      status: "Assigned",
      notes: "Move from agreement sent to agreement signed.",
    },
    {
      id: "t3",
      title: "Collect 20 fresh application entries",
      owner: "Laxmi",
      assignedBy: "Sonali Shingre Ma'am",
      due: "Today 5:00 PM",
      priority: "Medium",
      status: "Assigned",
      notes: "Focus on production/helper roles.",
    },
  ],
  attendanceLogs: [
    {
      id: "a1",
      member: "Sagar Sonawane",
      date: getTodayDate(),
      checkIn: "09:50",
      checkOut: "",
      status: "On time",
      lateMinutes: 0,
    },
    {
      id: "a2",
      member: "Vishwatej Suryawanshi",
      date: getTodayDate(),
      checkIn: "09:58",
      checkOut: "",
      status: "On time",
      lateMinutes: 0,
    },
    {
      id: "a3",
      member: "Rohan Dongre",
      date: getTodayDate(),
      checkIn: "10:11",
      checkOut: "",
      status: "Late",
      lateMinutes: 11,
    },
  ],
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
    pin: "1001",
    access: [
      "Launch",
      "CEO",
      "Control",
      "Pipeline",
      "Clients",
      "Team",
      "Tasks",
      "Attendance",
      "Money",
      "Reports",
    ],
  },
  {
    memberId: "m2",
    pin: "1002",
    access: [
      "Launch",
      "CEO",
      "Control",
      "Pipeline",
      "Clients",
      "Team",
      "Tasks",
      "Attendance",
      "Money",
      "Reports",
    ],
  },
  {
    memberId: "m3",
    pin: "1003",
    access: ["Launch", "Control", "Pipeline", "Clients", "Tasks", "Attendance", "Money", "Reports"],
  },
  {
    memberId: "m4",
    pin: "1004",
    access: ["Launch", "Control", "Pipeline", "Tasks", "Attendance", "Money", "Reports"],
  },
  {
    memberId: "m5",
    pin: "1005",
    access: ["Launch", "Pipeline", "Tasks", "Attendance", "Reports"],
  },
  {
    memberId: "m6",
    pin: "1006",
    access: ["Launch", "Pipeline", "Tasks", "Attendance", "Reports"],
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
  "Money",
  "Reports",
];

const launchChecklist = [
  "Every staff member logs in from their own phone before work starts.",
  "Office QR is pasted near the entrance and attendance starts through scan.",
  "Sagar sir assigns daily priorities from Control and Follow-ups.",
  "BDO updates client approach, permission, meeting, and agreement stages.",
  "Recruiter and coordinators update candidate stages before evening review.",
  "All staff submit the Daily Report before leaving office.",
  "Invoice/payment status is reviewed after every joining confirmation.",
  "Sagar sir reviews CEO dashboard before closing the office day.",
];

const operatingRhythm = [
  { time: "10:00 AM", action: "Morning allocation", owner: "Sagar sir" },
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

function isLegacyDemoData(payload: OfficeState) {
  const memberNames = payload.members.map((member) => member.name).join(" ");
  const clientNames = payload.clients.map((client) => client.company).join(" ");

  return (
    /Aarav|Sneha|Vikram/.test(memberNames) ||
    /Nashik Auto Components|Western Logistics Hub/.test(clientNames)
  );
}

function normalizeOfficeState(payload: OfficeState): OfficeState {
  const clients = payload.clients?.length ? payload.clients : seedState.clients;

  return {
    members: payload.members?.length ? payload.members : seedState.members,
    clients: clients.map((client) => ({
      ...client,
      status: client.status === "Agreement" ? "Agreement Sent" : client.status,
    })),
    requirements: payload.requirements?.length
      ? payload.requirements
      : seedState.requirements,
    candidates: payload.candidates?.length ? payload.candidates : seedState.candidates,
    followUps: payload.followUps?.length ? payload.followUps : seedState.followUps,
    reports: payload.reports?.length ? payload.reports : seedState.reports,
    invoices: payload.invoices?.length ? payload.invoices : seedState.invoices,
    tasks: payload.tasks?.length ? payload.tasks : seedState.tasks,
    attendanceLogs: payload.attendanceLogs?.length
      ? payload.attendanceLogs
      : seedState.attendanceLogs,
  };
}

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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

export default function RecruitmentOS() {
  const [state, setState] = useState<OfficeState>(seedState);
  const [activeView, setActiveView] = useState("Control");
  const [saveStatus, setSaveStatus] = useState("Ready");
  const [activeMemberId, setActiveMemberId] = useState("m3");
  const [loginMemberId, setLoginMemberId] = useState("m3");
  const [loggedInMemberId, setLoggedInMemberId] = useState<string | null>(null);
  const [loginPin, setLoginPin] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isQrAttendanceMode, setIsQrAttendanceMode] = useState(false);
  const [qrMemberId, setQrMemberId] = useState("m3");
  const [qrScanTime, setQrScanTime] = useState("10:00");
  const [qrMessage, setQrMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadState() {
      try {
        const response = await fetch("/api/state", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as OfficeState;
        if (!cancelled && hasOfficeData(payload) && !isLegacyDemoData(payload)) {
          setState(normalizeOfficeState(payload));
        }
      } catch {
        setSaveStatus("Offline sample mode");
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
    const handle = window.setTimeout(async () => {
      try {
        setSaveStatus("Saving");
        const response = await fetch("/api/state", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(state),
        });
        setSaveStatus(response.ok ? "Saved" : "Not saved");
      } catch {
        setSaveStatus("Offline sample mode");
      }
    }, 500);

    return () => window.clearTimeout(handle);
  }, [state]);

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

  const visibleViews = loggedInProfile?.access ?? defaultViews;

  useEffect(() => {
    if (!visibleViews.includes(activeView)) {
      setActiveView(visibleViews[0] ?? "Control");
    }
  }, [activeView, visibleViews]);

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
    const today = getTodayDate();
    const todayAttendance = state.attendanceLogs.filter(
      (item) => item.date === today,
    );
    const lateToday = todayAttendance.filter((item) => item.status === "Late");
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
    };
  }, [state]);

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
    ],
    [state.followUps, state.invoices, state.tasks],
  );

  function addClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState((current) => ({
      ...current,
      clients: [
        {
          id: makeId("client"),
          company: String(form.get("company") || "New company"),
          contact: String(form.get("contact") || "HR"),
          city: String(form.get("city") || "Nashik"),
          industry: String(form.get("industry") || "General"),
          status: "Prospect",
          model: String(form.get("model") || "8.33% Annual CTC"),
          owner: String(form.get("owner") || "BDO"),
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
          owner: String(form.get("owner") || activeMember?.name || "Team"),
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
          owner: String(form.get("owner") || "Rohan Dongre"),
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
          owner: String(form.get("owner") || "Laxmi"),
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
          member: String(form.get("member") || "Team"),
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
    setState((current) => ({
      ...current,
      invoices: current.invoices.map((item) =>
        item.id === id ? { ...item, status } : item,
      ),
    }));
  }

  function updateTaskStatus(id: string, status: Task["status"]) {
    setState((current) => ({
      ...current,
      tasks: current.tasks.map((item) =>
        item.id === id ? { ...item, status } : item,
      ),
    }));
  }

  function addInvoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState((current) => ({
      ...current,
      invoices: [
        {
          id: makeId("invoice"),
          company: String(form.get("company") || "Client"),
          candidate: String(form.get("candidate") || "Candidate"),
          amount: Number(form.get("amount") || 0),
          owner: String(form.get("owner") || activeMember?.name || "Team"),
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
          owner: String(form.get("owner") || activeMember?.name || "Team"),
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

  function recordAttendance(
    memberName: string,
    checkIn: string,
    checkOut: string,
    status: AttendanceLog["status"],
    lateMinutes: number,
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
    const form = new FormData(event.currentTarget);
    const memberName = String(form.get("member") || activeMember?.name);
    const status = String(form.get("status") || "On time") as AttendanceLog["status"];
    const checkIn = String(form.get("checkIn") || getCurrentClockTime());
    recordAttendance(
      memberName,
      checkIn,
      String(form.get("checkOut") || ""),
      status,
      Number(form.get("lateMinutes") || getLateMinutes(checkIn)),
    );
    event.currentTarget.reset();
  }

  function submitQrAttendance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const member = state.members.find((item) => item.id === qrMemberId) ?? activeMember;
    const checkIn = qrScanTime || getCurrentClockTime();
    const lateMinutes = getLateMinutes(checkIn);
    const status: AttendanceLog["status"] = lateMinutes > 0 ? "Late" : "On time";

    recordAttendance(member.name, checkIn, "", status, lateMinutes);
    setActiveMemberId(member.id);
    setQrMessage(
      `${member.name} attendance marked at ${checkIn} (${status}${
        lateMinutes ? `, ${lateMinutes} min late` : ""
      }).`,
    );
  }

  function quickUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const memberId = String(form.get("member") || activeMemberId);
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

  function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const profile = loginProfiles.find(
      (item) => item.memberId === loginMemberId && item.pin === loginPin,
    );

    if (!profile) {
      setLoginError("Wrong PIN. Check your name and try again.");
      return;
    }

    setLoggedInMemberId(profile.memberId);
    setActiveMemberId(profile.memberId);
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
            <label className="time-field">
              <span>Check-in time</span>
              <input
                aria-label="QR check-in time"
                onChange={(event) => setQrScanTime(event.target.value)}
                type="time"
                value={qrScanTime}
              />
            </label>
            <div className="scan-summary">
              <strong>{qrMember.name}</strong>
              <span>
                {qrStatus}
                {qrLateMinutes ? ` / ${qrLateMinutes} min late` : ""}
              </span>
            </div>
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
            Select your name and enter your office PIN to open your work dashboard.
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
              aria-label="PIN"
              inputMode="numeric"
              maxLength={4}
              onChange={(event) => setLoginPin(event.target.value)}
              placeholder="4 digit PIN"
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
          </div>
          <div className="topbar-actions">
            <select
              aria-label="Working as"
              value={activeMember?.id}
              onChange={(event) => setActiveMemberId(event.target.value)}
              disabled={loggedInMember?.role !== "Director / Owner"}
            >
              {state.members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} - {member.role}
                </option>
              ))}
            </select>
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
                  <input name="owner" placeholder="Owner" defaultValue={activeMember?.name} />
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
                <input name="owner" placeholder="Owner" />
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
                <input name="owner" placeholder="Owner" />
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
                <input name="owner" placeholder="Owner" />
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
                {state.members.map((member) => (
                  <div className="table-row" key={member.id}>
                    <span>
                      <strong>{member.name}</strong>
                      <small>{member.role} / {member.desk}</small>
                    </span>
                    <span className={`attendance ${member.attendance.toLowerCase().replace(" ", "-")}`}>
                      {member.attendance}
                    </span>
                    <span>{member.calls}</span>
                    <span>{member.cv}</span>
                    <span>{member.interviews}</span>
                    <span>{scoreMember(member)}%</span>
                  </div>
                ))}
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
                {state.tasks.map((task) => (
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
              <PanelHeader title="Assign Task" label="Owner, deadline, priority" />
              <form className="form-stack" onSubmit={addTask}>
                <input name="title" placeholder="Task title" />
                <select name="owner" aria-label="Task owner" defaultValue={activeMember?.name}>
                  {state.members.map((member) => (
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
            </div>
          </section>
        )}

        {activeView === "Attendance" && (
          <section className="board-grid">
            <div className="panel wide">
              <PanelHeader title="Attendance and Late Mark" label="Daily discipline" />
              <div className="data-table attendance-table">
                <div className="table-head">
                  <span>Staff</span>
                  <span>Date</span>
                  <span>In</span>
                  <span>Out</span>
                  <span>Status</span>
                  <span>Late</span>
                </div>
                {state.attendanceLogs.map((log) => (
                  <div className="table-row" key={log.id}>
                    <span><strong>{log.member}</strong></span>
                    <span>{log.date}</span>
                    <span>{log.checkIn}</span>
                    <span>{log.checkOut || "-"}</span>
                    <span className={`attendance ${log.status.toLowerCase().replace(" ", "-")}`}>
                      {log.status}
                    </span>
                    <span>{log.lateMinutes} min</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
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
                <button type="submit">Mark Attendance</button>
              </form>
            </div>
          </section>
        )}

        {activeView === "Money" && (
          <section className="board-grid">
            <div className="panel wide">
              <PanelHeader title="Invoice and Payment Tracker" label="Joining to collection" />
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
              <PanelHeader title="Create Invoice Entry" label="After joining" />
              <form className="form-stack" onSubmit={addInvoice}>
                <input name="company" placeholder="Client company" />
                <input name="candidate" placeholder="Candidate / joining batch" />
                <input name="amount" placeholder="Invoice amount" type="number" min="0" />
                <input name="owner" placeholder="Owner" defaultValue={activeMember?.name} />
                <input name="due" placeholder="Due / payment follow-up" />
                <button type="submit">Add Invoice</button>
              </form>
            </div>
          </section>
        )}

        {activeView === "Reports" && (
          <section className="board-grid">
            <div className="panel">
              <PanelHeader title="Daily Report" label="End of day" />
              <form className="form-stack" onSubmit={addDailyReport}>
                <input name="member" placeholder="Your name" />
                <textarea name="completed" placeholder="Completed today" rows={4} />
                <textarea name="stuck" placeholder="Stuck / support needed" rows={3} />
                <textarea name="tomorrow" placeholder="Tomorrow focus" rows={3} />
                <button type="submit">Submit Report</button>
              </form>
            </div>

            <div className="panel wide">
              <PanelHeader title="Report History" label="Boss review" />
              <div className="report-list">
                {state.reports.map((report) => (
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
