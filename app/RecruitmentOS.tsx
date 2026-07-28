"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Member = {
  id: string;
  name: string;
  role: string;
  desk: string;
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
  status: "New" | "Sourcing" | "Submitted" | "Interview" | "Offer" | "Closed";
  owner: string;
};

type Candidate = {
  id: string;
  name: string;
  role: string;
  phone: string;
  city: string;
  stage: "Screening" | "Submitted" | "Interview" | "Selected" | "Joined" | "Rejected";
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
      name: "Aarav",
      role: "Recruiter",
      desk: "Manufacturing",
      attendance: "On time",
      calls: 42,
      cv: 11,
      interviews: 4,
      target: 50,
    },
    {
      id: "m2",
      name: "Sneha",
      role: "BDO",
      desk: "Client acquisition",
      attendance: "Late",
      calls: 28,
      cv: 0,
      interviews: 0,
      target: 35,
    },
    {
      id: "m3",
      name: "Vikram",
      role: "Coordinator",
      desk: "Joining support",
      attendance: "On time",
      calls: 31,
      cv: 3,
      interviews: 7,
      target: 30,
    },
  ],
  clients: [
    {
      id: "cl1",
      company: "Nashik Auto Components",
      contact: "Mr. Patil",
      city: "Nashik",
      industry: "Manufacturing",
      status: "Active",
      model: "8.33% Annual CTC",
      owner: "Sneha",
      nextFollowUp: "Today 4:30 PM",
    },
    {
      id: "cl2",
      company: "Western Logistics Hub",
      contact: "HR Team",
      city: "Pune",
      industry: "Logistics",
      status: "Agreement",
      model: "10% Monthly",
      owner: "Aarav",
      nextFollowUp: "Tomorrow",
    },
  ],
  requirements: [
    {
      id: "r1",
      title: "CNC Operator",
      company: "Nashik Auto Components",
      positions: 12,
      salary: "18k-24k",
      priority: "High",
      status: "Interview",
      owner: "Aarav",
    },
    {
      id: "r2",
      title: "Warehouse Supervisor",
      company: "Western Logistics Hub",
      positions: 4,
      salary: "28k-35k",
      priority: "Medium",
      status: "Sourcing",
      owner: "Vikram",
    },
  ],
  candidates: [
    {
      id: "ca1",
      name: "Rahul Jadhav",
      role: "CNC Operator",
      phone: "98xxxxxx10",
      city: "Sinnar",
      stage: "Interview",
      owner: "Aarav",
      company: "Nashik Auto Components",
    },
    {
      id: "ca2",
      name: "Priya More",
      role: "HR Executive",
      phone: "90xxxxxx22",
      city: "Nashik",
      stage: "Submitted",
      owner: "Sneha",
      company: "Pipeline",
    },
  ],
  followUps: [
    {
      id: "f1",
      type: "Client",
      title: "Agreement signature from Western Logistics Hub",
      owner: "Sneha",
      due: "Today",
      status: "Pending",
    },
    {
      id: "f2",
      type: "Joining",
      title: "Confirm Rahul interview timing",
      owner: "Aarav",
      due: "Today",
      status: "Pending",
    },
    {
      id: "f3",
      type: "Payment",
      title: "Invoice follow-up: May joining",
      owner: "Vikram",
      due: "Tomorrow",
      status: "Pending",
    },
  ],
  reports: [
    {
      id: "d1",
      member: "Aarav",
      date: new Date().toISOString().slice(0, 10),
      completed: "11 CVs sourced, 4 interviews fixed",
      stuck: "One candidate salary mismatch",
      tomorrow: "Close CNC shortlist",
    },
  ],
};

const stages: Candidate["stage"][] = [
  "Screening",
  "Submitted",
  "Interview",
  "Selected",
  "Joined",
  "Rejected",
];

const requirementStatuses: Requirement["status"][] = [
  "New",
  "Sourcing",
  "Submitted",
  "Interview",
  "Offer",
  "Closed",
];

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

function scoreMember(member: Member) {
  const activity = member.calls + member.cv * 3 + member.interviews * 5;
  return Math.min(100, Math.round((activity / Math.max(member.target, 1)) * 100));
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
        if (!cancelled) setState(payload);
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
    const interviews = state.candidates.filter(
      (item) => item.stage === "Interview",
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
          status: "New",
          owner: String(form.get("owner") || "Recruiter"),
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
          stage: "Screening",
          owner: String(form.get("owner") || "Recruiter"),
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
          <div className="brand-mark" aria-hidden="true">
            LS
          </div>
          <div>
            <p className="eyebrow">LTSV Worker System</p>
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
            <p className="eyebrow">Tuesday operating board</p>
            <h2>{activeView}</h2>
          </div>
          <div className="topbar-actions">
            <select aria-label="Viewing role">
              <option>Boss</option>
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
              <Metric label="Interviews" value={metrics.interviews} detail="candidate stage" />
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
          <section className="panel">
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
                  <span><strong>{member.name}</strong><small>{member.role}</small></span>
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
