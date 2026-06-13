# Quick Start: Multi-Company Admin System

## For Company Admins

### 1. Register Your Company
```bash
POST /api/auth/register-company-admin
{
  "name": "Your Name",
  "email": "admin@yourcompany.com",
  "password": "StrongPassword123",
  "companyName": "Your Company Name",
  "website": "https://yourcompany.com",
  "description": "Company description"
}
```
**You get**: JWT token + Company ID + User ID

### 2. Create Job Postings
```bash
POST /api/jobs
Headers: Authorization: Bearer {your_token}
{
  "title": "Software Engineer",
  "description": "Job description here",
  "role": "Backend Developer",
  "salary": "$100k-$150k",
  "location": "Remote",
  "minCgpa": 7.0,
  "maxBacklogs": 0,
  "requiredSkills": ["Node.js", "MongoDB"],
  "rounds": ["Technical", "HR"]
}
```
**Job auto-linked to your company** ✓

### 3. View Student Applications
```bash
GET /api/applications
Headers: Authorization: Bearer {your_token}
```
**You only see applications for YOUR company's jobs** ✓

### 4. Accept/Reject Candidates
```bash
PUT /api/applications/{application_id}
Headers: Authorization: Bearer {your_token}
{
  "status": "shortlisted",  // or "rejected", "selected"
  "notes": "Good technical skills"
}
```

---

## For Students

### 1. Register as Student
```bash
POST /api/auth/register
{
  "name": "Student Name",
  "email": "student@university.edu",
  "password": "StrongPassword123",
  "role": "student"
}
```

### 2. Browse All Jobs
```bash
GET /api/jobs
Headers: Authorization: Bearer {your_token}
```
**See all open jobs from all companies** ✓

### 3. Apply for Jobs
```bash
POST /api/applications/apply
Headers: Authorization: Bearer {your_token}
{
  "jobId": "job_id_here"
}
```

### 4. Track Your Applications
```bash
GET /api/applications/my
Headers: Authorization: Bearer {your_token}
```
**View status of your applications** ✓

---

## Key Features

✅ **Multiple Companies**: Each company has independent login  
✅ **Data Isolation**: Companies only see their own jobs & applications  
✅ **Automatic Assignment**: Admin jobs auto-linked to company  
✅ **Student Access**: Students browse all companies' open jobs  
✅ **Role-Based**: Different actions based on student vs admin role  

---

## Common Scenarios

### Scenario 1: Multiple Companies Posting Jobs
- Company A Admin registers → Creates jobs → Sees only A's applications
- Company B Admin registers → Creates jobs → Sees only B's applications
- Both use same system independently ✓

### Scenario 2: Student Applies to Multiple Companies
- Student sees all open jobs
- Applies to Company A job + Company B job
- Company A sees only their application
- Company B sees only their application ✓

### Scenario 3: Shortlisting Process
- Company Admin logs in
- Views applications for their jobs
- Updates status to "shortlisted"
- Student sees status change in their applications ✓

---

## Error Messages Reference

| Error | Meaning | Solution |
|-------|---------|----------|
| "Only company admins can create jobs" | Student trying to create job | Use student account for applications only |
| "You can only view jobs from your company" | Admin viewing another company's job | Access only your company's jobs |
| "Only applications for your company's jobs" | Viewing other company's applications | Contact the other company admin |
| "You have already applied for this job" | Duplicate application | Can't apply twice to same job |

---

## Database Schema Summary

**User (Admin)**
- _id, name, email, role="admin", password
- company (→ Company), companyName

**User (Student)**
- _id, name, email, role="student", password
- department, rollNumber, cgpa, skills

**Company**
- _id, name, email (unique), website, description
- adminUser (→ User), hiringHistory

**Job**
- _id, title, description, role, salary, location
- company (→ Company), createdBy (→ User)
- minCgpa, maxBacklogs, requiredSkills, rounds, status

**Application**
- _id, student (→ User), job (→ Job)
- status, eligibility, notes

