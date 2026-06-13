# Simplified Multi-Company Admin System

## Overview
The system has been simplified so company admins don't manage company profiles. They simply:
1. Register with company name
2. Create and manage jobs
3. Accept/reject applications
4. Schedule interviews

Only **students** have detailed profiles with academic information and resumes.

---

## Admin Workflow (Simplified)

### 1. Register as Company Admin
```bash
POST /api/auth/register-company-admin
Content-Type: application/json

{
  "name": "HR Manager",
  "email": "admin@techcorp.com",
  "password": "SecurePassword123",
  "companyName": "TechCorp Solutions"
}
```

**Response**: Token + User Info + Auto-Created Company

**That's it!** No need to manage company profile separately.

---

### 2. Create Jobs
```bash
POST /api/jobs
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "title": "Senior Developer",
  "description": "We are hiring...",
  "role": "Backend",
  "salary": "$120k-$150k",
  "location": "New York",
  "minCgpa": 7.0,
  "maxBacklogs": 0,
  "requiredSkills": ["Node.js", "MongoDB"],
  "rounds": ["Technical", "HR"]
}
```

Job is **auto-linked to admin's company**.

---

### 3. View Applications (Company-Filtered)
```bash
GET /api/applications
Authorization: Bearer {admin_token}
```

Admin sees **only applications for their company's jobs**.

---

### 4. Accept/Reject Candidates
```bash
PUT /api/applications/{application_id}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "status": "shortlisted",
  "notes": "Good technical skills"
}
```

Valid statuses: `applied`, `shortlisted`, `rejected`, `selected`

---

### 5. Schedule Interviews
```bash
POST /api/interviews/schedule-interview
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "applicationId": "app_id_here",
  "interviewDate": "2024-06-25T10:00:00Z",
  "round": "Technical Round",
  "feedback": ""
}
```

**Note**: Can only schedule if candidate is **shortlisted**.

---

### 6. Update Interview Details
```bash
PUT /api/interviews/update-interview/{interview_id}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "round": "Final Round",
  "interviewDate": "2024-06-25T14:00:00Z",
  "feedback": "Excellent performance in technical round"
}
```

---

### 7. View Scheduled Interviews
```bash
GET /api/interviews/get-interviews
Authorization: Bearer {admin_token}
```

Admin sees **interviews for their company's candidates**.

---

## Student Workflow

### 1. Register (Profile + Resume)
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "Jane Student",
  "email": "jane@university.edu",
  "password": "SecurePassword123",
  "role": "student"
}
```

---

### 2. Update Student Profile
```bash
PUT /api/users/profile
Authorization: Bearer {student_token}
Content-Type: application/json

{
  "department": "Computer Science",
  "rollNumber": "CS-001",
  "phone": "+1234567890",
  "cgpa": 8.5,
  "backlogs": 0,
  "skills": ["JavaScript", "React", "Node.js"],
  "graduationYear": 2024
}
```

**Only students** have detailed profiles.

---

### 3. Get Profile
```bash
GET /api/users/profile
Authorization: Bearer {student_token}
```

Returns: Profile + Scores + Resume Info

---

### 4. Browse All Jobs
```bash
GET /api/jobs
Authorization: Bearer {student_token}
```

Sees **all open jobs from all companies**.

---

### 5. Apply for Jobs
```bash
POST /api/applications/apply
Authorization: Bearer {student_token}
Content-Type: application/json

{
  "jobId": "job_id_here"
}
```

---

### 6. Track Applications
```bash
GET /api/applications/my
Authorization: Bearer {student_token}
```

Sees **own applications and their status**.

---

### 7. View Interviews
```bash
GET /api/interviews/get-interviews
Authorization: Bearer {student_token}
```

Sees **own scheduled interviews**.

---

## Key Differences from Previous System

| Feature | Before | Now |
|---------|--------|-----|
| Company Creation | Manual (addCompany endpoint) | Auto-created during admin registration |
| Company Management | Separate endpoints | None (auto-created with minimal info) |
| Admin Profile | Optional fields | No student fields |
| Student Profile | Optional | Required (CGPA, skills, etc.) |
| Company Update | API endpoint | Not available |
| Focus | Admin complexity | Streamlined admin workflow |

---

## What Admins DON'T Do Anymore

❌ Create company manually  
❌ Update company profile  
❌ Manage company settings  
❌ Update company description/website  

**They just register and start managing jobs/applications!**

---

## API Endpoints Summary

### Auth
- `POST /api/auth/register-company-admin` - Admin registration
- `POST /api/auth/register` - Student registration
- `POST /api/auth/login` - Login (both)
- `POST /api/auth/logout` - Logout

### Jobs (Admin-managed)
- `POST /api/jobs` - Create job
- `GET /api/jobs` - View jobs (filtered by company for admins)
- `GET /api/jobs/:id` - View job details
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Applications
- `POST /api/applications/apply` - Student applies
- `GET /api/applications` - View (filtered for admins/students)
- `GET /api/applications/my` - Student views own
- `PUT /api/applications/:id` - Update status (admin only)

### Interviews
- `POST /api/interviews/schedule-interview` - Schedule (admin only)
- `GET /api/interviews/get-interviews` - View interviews
- `GET /api/interviews/:id` - View interview details
- `PUT /api/interviews/update-interview/:id` - Update interview (admin only)

### Users (Student Profiles)
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile (student only)

### Companies (View Only)
- `GET /api/companies/my-company` - Admin's company
- `GET /api/companies` - All companies
- `GET /api/companies/:id` - Specific company

---

## Admin Quick Start

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register-company-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "HR Admin",
    "email": "hr@mycompany.com",
    "password": "Password123",
    "companyName": "My Company"
  }'

# Save the token from response

# 2. Create a job
curl -X POST http://localhost:5000/api/jobs \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Developer",
    "description": "Job description",
    "role": "Backend",
    "salary": "$100k",
    "location": "Remote",
    "minCgpa": 7.0,
    "maxBacklogs": 0,
    "requiredSkills": ["Node.js"],
    "rounds": ["Technical", "HR"]
  }'

# 3. View applications
curl -X GET http://localhost:5000/api/applications \
  -H "Authorization: Bearer {TOKEN}"

# 4. Accept a candidate
curl -X PUT http://localhost:5000/api/applications/{APP_ID} \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "shortlisted",
    "notes": "Shortlisted"
  }'

# 5. Schedule interview
curl -X POST http://localhost:5000/api/interviews/schedule-interview \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": "{APP_ID}",
    "interviewDate": "2024-06-25T10:00:00Z",
    "round": "Technical Round"
  }'
```

---

## Security Notes

✅ **Company Auto-Creation**: Company is auto-created when admin registers  
✅ **Data Isolation**: Admins see only their company's data  
✅ **Role Enforcement**: Admins can't view student profiles; students can't manage jobs  
✅ **Interview Validation**: Can only schedule for shortlisted candidates  
✅ **Authorization Checks**: Every operation verifies company ownership

---

## Testing the System

1. **Register Company Admin**
   - Get back company auto-created

2. **Register Student**
   - Student updates profile

3. **Admin creates job**
   - Auto-linked to their company

4. **Student applies**
   - Only admin's company sees the application

5. **Admin shortlists**
   - Can schedule interview

6. **Schedule interview**
   - Student sees interview in their list

---

## Summary

**The system is now streamlined:**
- ✅ No company management endpoints
- ✅ Automatic company creation
- ✅ Admin focuses on jobs and applications
- ✅ Clean separation: Admin = job management, Student = career building
- ✅ Simplified registration (only companyName needed, no website/description)

