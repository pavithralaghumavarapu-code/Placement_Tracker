import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const emptyJob = {
  title: "",
  companyName: "",
  description: "",
  role: "",
  salary: "",
  location: "",
  deadline: "",
  minCgpa: 0,
  maxBacklogs: 0,
  requiredSkills: "",
  rounds: "",
  status: "open"
};

function apiRequest(path, { method = "GET", body, token, headers = {} } = {}) {
  const isFormData = body instanceof FormData;

  return fetch(`${API_URL}${path}`, {
    method,
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    body: isFormData ? body : body ? JSON.stringify(body) : undefined
  }).then(async (res) => {
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload.message || "Request failed");
    return payload;
  });
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("placementToken") || "");
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("placementUser");
    return saved ? JSON.parse(saved) : null;
  });
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [resume, setResume] = useState(null);
  const [view, setView] = useState("dashboard");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.role === "admin";

  const authedApi = useMemo(() => {
    return (path, options = {}) => apiRequest(path, { ...options, token });
  }, [token]);

  const flash = (message) => {
    setNotice(message);
    window.clearTimeout(window.__placementNotice);
    window.__placementNotice = window.setTimeout(() => setNotice(""), 3500);
  };

  const signIn = (authData) => {
    const nextToken = authData.token;
    const nextUser = authData.user;
    localStorage.setItem("placementToken", nextToken);
    localStorage.setItem("placementUser", JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
    setView("dashboard");
  };

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const profileResponse = await authedApi("/users/profile");
      const jobsResponse = await authedApi("/jobs/get-jobs");
      const companiesResponse = await authedApi("/companies/get-companies");
      const interviewsResponse = await authedApi("/interviews/get-interviews");
      const appsResponse = await authedApi(
        isAdmin ? "/applications/get-applications" : "/applications/my-applications"
      );

      setProfile(profileResponse.data);
      setUser(profileResponse.data.user);
      localStorage.setItem("placementUser", JSON.stringify(profileResponse.data.user));
      setJobs(jobsResponse.data || []);
      setCompanies(companiesResponse.data || []);
      setInterviews(interviewsResponse.data || []);
      setApplications(appsResponse.data || []);

      if (!isAdmin) {
        const resumeResponse = await authedApi("/resumes/get-resume-score").catch(() => null);
        setResume(resumeResponse?.data || null);
      }
    } catch (error) {
      flash(error.message);
      if (error.message.toLowerCase().includes("token")) logout(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token, isAdmin]);

  const logout = async (callApi = true) => {
    if (callApi && token) await authedApi("/auth/logout", { method: "POST" }).catch(() => {});
    localStorage.removeItem("placementToken");
    localStorage.removeItem("placementUser");
    setToken("");
    setUser(null);
    setProfile(null);
    setView("dashboard");
  };

  if (!user) {
    return <AuthScreen onAuth={signIn} flash={flash} notice={notice} />;
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Placement</p>
          <h1>Tracker</h1>
        </div>
        <nav>
          {["dashboard", "jobs", "companies", "applications", "interviews", "profile"].map((item) => (
            <button
              key={item}
              className={view === item ? "active" : ""}
              onClick={() => setView(item)}
            >
              {item}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <strong>{user.name}</strong>
          <span>{user.role}</span>
          <button onClick={() => logout()}>Sign out</button>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">{isAdmin ? "Admin console" : "Student workspace"}</p>
            <h2>{titleFor(view)}</h2>
          </div>
          <button onClick={loadData} disabled={loading}>{loading ? "Refreshing" : "Refresh"}</button>
        </header>

        {notice && <div className="notice">{notice}</div>}

        {view === "dashboard" && (
          <Dashboard
            profile={profile}
            jobs={jobs}
            applications={applications}
            interviews={interviews}
            resume={resume}
            isAdmin={isAdmin}
          />
        )}
        {view === "jobs" && (
          <Jobs
            jobs={jobs}
            companies={companies}
            isAdmin={isAdmin}
            authedApi={authedApi}
            reload={loadData}
            flash={flash}
          />
        )}
        {view === "companies" && (
          <Companies
            companies={companies}
            isAdmin={isAdmin}
            authedApi={authedApi}
            reload={loadData}
            flash={flash}
          />
        )}
        {view === "applications" && (
          <Applications
            applications={applications}
            isAdmin={isAdmin}
            authedApi={authedApi}
            reload={loadData}
            flash={flash}
          />
        )}
        {view === "interviews" && (
          <Interviews
            interviews={interviews}
            applications={applications}
            isAdmin={isAdmin}
            authedApi={authedApi}
            reload={loadData}
            flash={flash}
          />
        )}
        {view === "profile" && (
          <Profile
            profile={profile}
            resume={resume}
            isAdmin={isAdmin}
            authedApi={authedApi}
            reload={loadData}
            flash={flash}
          />
        )}
      </section>
    </main>
  );
}

function AuthScreen({ onAuth, flash, notice }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });

  const submit = async (event) => {
    event.preventDefault();
    try {
      const path = mode === "login" ? "/auth/login" : "/auth/register";
      const payload = mode === "login"
        ? { email: form.email, password: form.password }
        : form;
      const response = await apiRequest(path, { method: "POST", body: payload });
      onAuth(response.data);
    } catch (error) {
      flash(error.message);
    }
  };

  return (
    <main className="auth-screen">
      <section className="auth-panel">
        <div>
          <p className="eyebrow">Placement Tracker</p>
          <h1>Campus hiring, organized.</h1>
          <p>Track jobs, applications, interviews, resumes, and placement readiness in one place.</p>
        </div>
        <form onSubmit={submit}>
          <div className="segmented">
            <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Login</button>
            <button type="button" className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Register</button>
          </div>
          {mode === "register" && (
            <>
          <label>Name<input autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
              <label>Role
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            </>
          )}
          <label>Email<input autoComplete="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
          <label>Password<input autoComplete={mode === "login" ? "current-password" : "new-password"} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
          <button type="submit">{mode === "login" ? "Login" : "Create account"}</button>
          {notice && <div className="notice">{notice}</div>}
        </form>
      </section>
    </main>
  );
}

function Dashboard({ profile, jobs, applications, interviews, resume, isAdmin }) {
  const scores = profile?.scores || {};
  return (
    <div className="grid">
      <Metric label="Open jobs" value={jobs.filter((job) => job.status === "open").length} />
      <Metric label={isAdmin ? "Applications" : "My applications"} value={applications.length} />
      <Metric label="Interviews" value={interviews.length} />
      <Metric label="Profile score" value={`${scores.profileScore || profile?.profileCompletion || 0}%`} />
      {!isAdmin && <Metric label="Resume score" value={resume?.aiScore ?? "Pending"} />}
      <section className="panel wide">
        <h3>Recent jobs</h3>
        <div className="list">
          {jobs.slice(0, 5).map((job) => <JobCard key={job._id} job={job} />)}
          {!jobs.length && <p className="muted">No jobs yet.</p>}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <section className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </section>
  );
}

function Jobs({ jobs, companies, isAdmin, authedApi, reload, flash }) {
  const [form, setForm] = useState(emptyJob);

  const saveJob = async (event) => {
    event.preventDefault();
    try {
      await authedApi("/jobs/create-job", {
        method: "POST",
        body: {
          ...form,
          company: form.company || undefined,
          requiredSkills: form.requiredSkills,
          rounds: splitList(form.rounds)
        }
      });
      setForm(emptyJob);
      flash("Job created");
      reload();
    } catch (error) {
      flash(error.message);
    }
  };

  const apply = async (jobId) => {
    try {
      await authedApi("/applications/apply-job", { method: "POST", body: { jobId } });
      flash("Application submitted");
      reload();
    } catch (error) {
      flash(error.message);
    }
  };

  return (
    <div className="two-column">
      <section className="panel">
        <h3>Jobs</h3>
        <div className="list">
          {jobs.map((job) => <JobCard key={job._id} job={job} action={!isAdmin && job.status === "open" ? () => apply(job._id) : null} />)}
          {!jobs.length && <p className="muted">No jobs posted.</p>}
        </div>
      </section>
      {isAdmin && (
        <section className="panel">
          <h3>Create job</h3>
          <form onSubmit={saveJob} className="stack-form">
            <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <input placeholder="Company name" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
            <select value={form.company || ""} onChange={(e) => setForm({ ...form, company: e.target.value })}>
              <option value="">Link company record</option>
              {companies.map((company) => <option key={company._id} value={company._id}>{company.name}</option>)}
            </select>
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            <input placeholder="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            <input placeholder="Salary/package" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
            <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            <div className="inline-fields">
              <input type="number" step="0.1" placeholder="Min CGPA" value={form.minCgpa} onChange={(e) => setForm({ ...form, minCgpa: Number(e.target.value) })} />
              <input type="number" placeholder="Max backlogs" value={form.maxBacklogs} onChange={(e) => setForm({ ...form, maxBacklogs: Number(e.target.value) })} />
            </div>
            <input placeholder="Required skills, comma separated" value={form.requiredSkills} onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })} />
            <input placeholder="Rounds, comma separated" value={form.rounds} onChange={(e) => setForm({ ...form, rounds: e.target.value })} />
            <button type="submit">Create job</button>
          </form>
        </section>
      )}
    </div>
  );
}

function JobCard({ job, action }) {
  return (
    <article className="item-card">
      <div>
        <h4>{job.title}</h4>
        <p>{job.company?.name || job.companyName || "Company not set"} · {job.location || "Location pending"}</p>
      </div>
      <div className="chips">
        <span>{job.status}</span>
        {job.salary && <span>{job.salary}</span>}
        {job.minCgpa > 0 && <span>CGPA {job.minCgpa}+</span>}
      </div>
      <p className="muted">{job.description}</p>
      {action && <button onClick={action}>Apply</button>}
    </article>
  );
}

function Companies({ companies, isAdmin, authedApi, reload, flash }) {
  const [form, setForm] = useState({ name: "", website: "", description: "", packages: "", roles: "" });

  const saveCompany = async (event) => {
    event.preventDefault();
    try {
      await authedApi("/companies/add-company", {
        method: "POST",
        body: { ...form, packages: splitList(form.packages), roles: splitList(form.roles) }
      });
      setForm({ name: "", website: "", description: "", packages: "", roles: "" });
      flash("Company added");
      reload();
    } catch (error) {
      flash(error.message);
    }
  };

  return (
    <div className="two-column">
      <section className="panel">
        <h3>Companies</h3>
        <div className="list">
          {companies.map((company) => (
            <article className="item-card" key={company._id}>
              <h4>{company.name}</h4>
              <p>{company.website || "Website pending"}</p>
              <p className="muted">{company.description || "No description added."}</p>
              <div className="chips">
                {(company.roles || []).map((role) => <span key={role}>{role}</span>)}
                {(company.packages || []).map((pkg) => <span key={pkg}>{pkg}</span>)}
              </div>
            </article>
          ))}
        </div>
      </section>
      {isAdmin && (
        <section className="panel">
          <h3>Add company</h3>
          <form onSubmit={saveCompany} className="stack-form">
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input placeholder="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input placeholder="Packages, comma separated" value={form.packages} onChange={(e) => setForm({ ...form, packages: e.target.value })} />
            <input placeholder="Roles, comma separated" value={form.roles} onChange={(e) => setForm({ ...form, roles: e.target.value })} />
            <button type="submit">Add company</button>
          </form>
        </section>
      )}
    </div>
  );
}

function Applications({ applications, isAdmin, authedApi, reload, flash }) {
  const updateStatus = async (id, status) => {
    try {
      await authedApi(`/applications/update-status/${id}`, { method: "PUT", body: { status } });
      flash("Application updated");
      reload();
    } catch (error) {
      flash(error.message);
    }
  };

  return (
    <section className="panel">
      <h3>{isAdmin ? "All applications" : "My applications"}</h3>
      <div className="list">
        {applications.map((application) => (
          <article className="item-card row" key={application._id}>
            <div>
              <h4>{application.job?.title || "Job"}</h4>
              <p>{application.student?.name || application.job?.companyName || "Applicant"}</p>
              {application.eligibility?.missingSkills?.length > 0 && (
                <p className="muted">Missing: {application.eligibility.missingSkills.join(", ")}</p>
              )}
            </div>
            {isAdmin ? (
              <select value={application.status} onChange={(e) => updateStatus(application._id, e.target.value)}>
                <option value="applied">Applied</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
                <option value="selected">Selected</option>
              </select>
            ) : (
              <span className="status">{application.status}</span>
            )}
          </article>
        ))}
        {!applications.length && <p className="muted">No applications yet.</p>}
      </div>
    </section>
  );
}

function Interviews({ interviews, applications, isAdmin, authedApi, reload, flash }) {
  const [form, setForm] = useState({ applicationId: "", interviewDate: "", round: "", feedback: "" });

  const schedule = async (event) => {
    event.preventDefault();
    try {
      await authedApi("/interviews/schedule-interview", { method: "POST", body: form });
      setForm({ applicationId: "", interviewDate: "", round: "", feedback: "" });
      flash("Interview scheduled");
      reload();
    } catch (error) {
      flash(error.message);
    }
  };

  return (
    <div className="two-column">
      <section className="panel">
        <h3>Interviews</h3>
        <div className="list">
          {interviews.map((interview) => (
            <article className="item-card" key={interview._id}>
              <h4>{interview.round}</h4>
              <p>{interview.job?.title || "Job"} · {new Date(interview.interviewDate).toLocaleString()}</p>
              <div className="chips">
                <span>{interview.status}</span>
                <span>{interview.result}</span>
              </div>
              <p className="muted">{interview.feedback || "No feedback yet."}</p>
            </article>
          ))}
          {!interviews.length && <p className="muted">No interviews scheduled.</p>}
        </div>
      </section>
      {isAdmin && (
        <section className="panel">
          <h3>Schedule interview</h3>
          <form onSubmit={schedule} className="stack-form">
            <select value={form.applicationId} onChange={(e) => setForm({ ...form, applicationId: e.target.value })} required>
              <option value="">Select application</option>
              {applications.map((app) => (
                <option key={app._id} value={app._id}>
                  {app.student?.name || "Student"} - {app.job?.title || "Job"}
                </option>
              ))}
            </select>
            <input type="datetime-local" value={form.interviewDate} onChange={(e) => setForm({ ...form, interviewDate: e.target.value })} required />
            <input placeholder="Round" value={form.round} onChange={(e) => setForm({ ...form, round: e.target.value })} required />
            <textarea placeholder="Feedback or notes" value={form.feedback} onChange={(e) => setForm({ ...form, feedback: e.target.value })} />
            <button type="submit">Schedule</button>
          </form>
        </section>
      )}
    </div>
  );
}

function Profile({ profile, resume, isAdmin, authedApi, reload, flash }) {
  const user = profile?.user || {};
  const [form, setForm] = useState({
    name: user.name || "",
    department: user.department || "",
    rollNumber: user.rollNumber || "",
    phone: user.phone || "",
    cgpa: user.cgpa || 0,
    backlogs: user.backlogs || 0,
    skills: (user.skills || []).join(", "),
    graduationYear: user.graduationYear || ""
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    setForm({
      name: user.name || "",
      department: user.department || "",
      rollNumber: user.rollNumber || "",
      phone: user.phone || "",
      cgpa: user.cgpa || 0,
      backlogs: user.backlogs || 0,
      skills: (user.skills || []).join(", "),
      graduationYear: user.graduationYear || ""
    });
  }, [user._id]);

  const saveProfile = async (event) => {
    event.preventDefault();
    try {
      await authedApi("/users/update-profile", {
        method: "PUT",
        body: { ...form, cgpa: Number(form.cgpa), backlogs: Number(form.backlogs), skills: form.skills }
      });
      flash("Profile updated");
      reload();
    } catch (error) {
      flash(error.message);
    }
  };

  const uploadResume = async (event) => {
    event.preventDefault();
    if (!file) return flash("Choose a resume file first");
    const formData = new FormData();
    formData.append("resume", file);
    try {
      await authedApi("/resumes/upload-resume", { method: "POST", body: formData });
      flash("Resume uploaded");
      reload();
    } catch (error) {
      flash(error.message);
    }
  };

  return (
    <div className="two-column">
      <section className="panel">
        <h3>Profile</h3>
        <form onSubmit={saveProfile} className="stack-form">
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          <input placeholder="Roll number" value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <div className="inline-fields">
            <input type="number" step="0.1" placeholder="CGPA" value={form.cgpa} onChange={(e) => setForm({ ...form, cgpa: e.target.value })} />
            <input type="number" placeholder="Backlogs" value={form.backlogs} onChange={(e) => setForm({ ...form, backlogs: e.target.value })} />
          </div>
          <input placeholder="Skills, comma separated" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
          <input type="number" placeholder="Graduation year" value={form.graduationYear} onChange={(e) => setForm({ ...form, graduationYear: e.target.value })} />
          <button type="submit">Save profile</button>
        </form>
      </section>
      {!isAdmin && (
        <section className="panel">
          <h3>Resume</h3>
          <Metric label="Resume score" value={resume?.aiScore ?? "Not uploaded"} />
          {resume?.suggestions?.length > 0 && (
            <div className="list compact">
              {resume.suggestions.map((suggestion) => <p key={suggestion}>{suggestion}</p>)}
            </div>
          )}
          <form onSubmit={uploadResume} className="stack-form">
            <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <button type="submit">Upload resume</button>
          </form>
        </section>
      )}
    </div>
  );
}

function splitList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function titleFor(view) {
  return view.charAt(0).toUpperCase() + view.slice(1);
}

createRoot(document.getElementById("root")).render(<App />);
