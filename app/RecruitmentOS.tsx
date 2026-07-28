"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

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
  status: "Prospect" | "Agreement" | "Active" | "Payment";
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

type OfficeState = {
  members: Member[];
  clients: Client[];
  requirements: Requirement[];
  candidates: Candidate[];
  followUps: FollowUp[];
  reports: DailyReport[];
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
      status: "Agreement",
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
      date: new Date().toISOString().slice(0, 10),
      completed: "Company calls, permission follow-ups, and meeting pipeline updated",
      stuck: "Need decision on next client visit priority",
      tomorrow: "Push agreement follow-up and schedule one client meeting",
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

export default function RecruitmentOS() {
  const [state, setState] = useState<OfficeState>(seedState);
  const [activeView, setActiveView] = useState("Control");
  const [saveStatus, setSaveStatus] = useState("Ready");

  useEffect(() => {
    let cancelled = false;
    async function loadState() {
      try {
        const response = await fetch("/api/state", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as OfficeState;
        if (!cancelled && hasOfficeData(payload) && !isLegacyDemoData(payload)) {
          setState(payload);
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
    };
  }, [state]);

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
          date: new Date().toISOString().slice(0, 10),
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
          {["Control", "Pipeline", "Clients", "Team", "Reports"].map((view) => (
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
            <select aria-label="Viewing role">
              <option>Boss / Director</option>
              <option>HR Head / Admin</option>
              <option>BDO</option>
              <option>Recruiter</option>
              <option>Coordinator</option>
            </select>
            <button type="button" onClick={() => setActiveView("Reports")}>
              Add Daily Report
            </button>
          </div>
        </header>

        {activeView === "Control" && (
          <>
            <section className="metric-grid" aria-label="Office metrics">
              <Metric label="Active clients" value={metrics.activeClients} detail="signed or working" />
              <Metric label="Open roles" value={metrics.openRequirements} detail={`${metrics.totalPositions} positions`} />
              <Metric label="Interviews" value={metrics.interviews} detail="scheduled/done" />
              <Metric label="Today follow-ups" value={metrics.todayFollowUps} detail="pending only" />
              <Metric label="Joinings" value={metrics.joined} detail="confirmed records" />
              <Metric label="Discipline" value={`${metrics.discipline}%`} detail="activity vs target" />
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
                      </div>
                      <div className="score-ring">{scoreMember(member)}%</div>
                    </div>
                  ))}
                </div>
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
