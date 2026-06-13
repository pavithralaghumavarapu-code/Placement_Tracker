# Test Scenario: Simplified Admin Workflow

## Scenario: TechCorp Hires a Developer

### Step 1: Admin Registers (Company Auto-Created)
```bash
curl -X POST http://localhost:5000/api/auth/register-company-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice HR Manager",
    "email": "alice@techcorp.com",
    "password": "TechCorp@2024",
    "companyName": "TechCorp Solutions"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Company admin registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "admin_id",
      "name": "Alice HR Manager",
      "email": "alice@techcorp.com",
      "role": "admin",
      "company": "company_id",
      "companyName": "TechCorp Solutions"
    },
    "company": {
      "_id": "company_id",
      "name": "TechCorp Solutions",
      "email": "alice@techcorp.com",
      "adminUser": "admin_id"
    }
  }
}
```

**Save**: `ADMIN_TOKEN = token_value`

---

### Step 2: Admin Creates Job (Auto-Linked)
```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Backend Developer",
    "description": "We are looking for a Senior Backend Developer with 5+ years of experience in cloud technologies.",
    "role": "Backend Developer",
    "salary": "$120k-$150k",
    "location": "New York, NY",
    "minCgpa": 7.5,
    "maxBacklogs": 0,
    "requiredSkills": ["Node.js", "MongoDB", "AWS"],
    "rounds": ["Technical Round", "System Design", "HR Round"]
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Job created",
  "data": {
    "_id": "job_id",
    "title": "Senior Backend Developer",
    "company": "company_id",
    "companyName": "TechCorp Solutions",
    "createdBy": "admin_id",
    "status": "open"
  }
}
```

**Save**: `JOB_ID = job_id`

---

### Step 3: Student Registers
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Developer",
    "email": "john@university.edu",
    "password": "Student@2024",
    "role": "student"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "student_id",
      "name": "John Developer",
      "email": "john@university.edu",
      "role": "student"
    }
  }
}
```

**Save**: `STUDENT_TOKEN = token_value`

---

### Step 4: Student Updates Profile
```bash
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "department": "Computer Science",
    "rollNumber": "CS-2022-001",
    "phone": "+1234567890",
    "cgpa": 8.7,
    "backlogs": 0,
    "skills": ["Node.js", "React.js", "MongoDB", "AWS"],
    "graduationYear": 2024
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated",
  "data": {
    "user": {
      "_id": "student_id",
      "name": "John Developer",
      "email": "john@university.edu",
      "role": "student",
      "department": "Computer Science",
      "rollNumber": "CS-2022-001",
      "cgpa": 8.7,
      "skills": ["node.js", "react.js", "mongodb", "aws"],
      "profileScore": 95
    },
    "profileCompletion": 95
  }
}
```

---

### Step 5: Student Applies for Job
```bash
curl -X POST http://localhost:5000/api/applications/apply \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jobId": "'$JOB_ID'"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Application submitted",
  "data": {
    "_id": "app_id",
    "student": "student_id",
    "job": "job_id",
    "status": "applied",
    "eligibility": {
      "eligible": true,
      "reasons": ["CGPA requirement met", "No backlogs"],
      "matchedSkills": ["Node.js", "MongoDB", "AWS"],
      "missingSkills": []
    }
  }
}
```

**Save**: `APP_ID = app_id`

---

### Step 6: Admin Views Applications
```bash
curl -X GET http://localhost:5000/api/applications \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Applications fetched",
  "data": [
    {
      "_id": "app_id",
      "student": {
        "_id": "student_id",
        "name": "John Developer",
        "email": "john@university.edu",
        "department": "Computer Science",
        "rollNumber": "CS-2022-001",
        "cgpa": 8.7,
        "skills": ["node.js", "react.js", "mongodb", "aws"]
      },
      "job": {
        "_id": "job_id",
        "title": "Senior Backend Developer",
        "companyName": "TechCorp Solutions",
        "status": "open"
      },
      "status": "applied",
      "eligibility": {
        "eligible": true,
        "matchedSkills": ["Node.js", "MongoDB", "AWS"],
        "missingSkills": []
      }
    }
  ]
}
```

---

### Step 7: Admin Shortlists Candidate
```bash
curl -X PUT http://localhost:5000/api/applications/$APP_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "shortlisted",
    "notes": "Excellent technical skills, strong background in Node.js and AWS"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Application status updated",
  "data": {
    "_id": "app_id",
    "status": "shortlisted",
    "notes": "Excellent technical skills, strong background in Node.js and AWS"
  }
}
```

---

### Step 8: Student Checks Status
```bash
curl -X GET http://localhost:5000/api/applications/my \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Applications fetched",
  "data": [
    {
      "_id": "app_id",
      "status": "shortlisted",
      "notes": "Excellent technical skills, strong background in Node.js and AWS",
      "job": {
        "_id": "job_id",
        "title": "Senior Backend Developer",
        "companyName": "TechCorp Solutions"
      }
    }
  ]
}
```

**Student sees they are shortlisted!**

---

### Step 9: Admin Schedules Interview
```bash
curl -X POST http://localhost:5000/api/interviews/schedule-interview \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": "'$APP_ID'",
    "interviewDate": "2024-06-25T10:00:00Z",
    "round": "Technical Round"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Interview scheduled",
  "data": {
    "_id": "interview_id",
    "student": {
      "_id": "student_id",
      "name": "John Developer",
      "email": "john@university.edu",
      "department": "Computer Science"
    },
    "job": {
      "_id": "job_id",
      "title": "Senior Backend Developer",
      "companyName": "TechCorp Solutions"
    },
    "interviewDate": "2024-06-25T10:00:00Z",
    "round": "Technical Round",
    "feedback": ""
  }
}
```

**Save**: `INTERVIEW_ID = interview_id`

---

### Step 10: Student Sees Interview Schedule
```bash
curl -X GET http://localhost:5000/api/interviews/get-interviews \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Interviews fetched",
  "data": [
    {
      "_id": "interview_id",
      "student": {
        "_id": "student_id",
        "name": "John Developer"
      },
      "job": {
        "_id": "job_id",
        "title": "Senior Backend Developer",
        "companyName": "TechCorp Solutions",
        "role": "Backend Developer"
      },
      "interviewDate": "2024-06-25T10:00:00Z",
      "round": "Technical Round",
      "application": {
        "status": "shortlisted"
      }
    }
  ]
}
```

**Student knows their interview time!**

---

### Step 11: Admin Updates Interview Feedback
```bash
curl -X PUT http://localhost:5000/api/interviews/update-interview/$INTERVIEW_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "round": "Final Round",
    "feedback": "Excellent performance. Strong system design skills. Cleared all rounds.",
    "interviewDate": "2024-06-27T15:00:00Z"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Interview updated",
  "data": {
    "_id": "interview_id",
    "round": "Final Round",
    "feedback": "Excellent performance. Strong system design skills. Cleared all rounds.",
    "interviewDate": "2024-06-27T15:00:00Z"
  }
}
```

---

### Step 12: Admin Selects Candidate
```bash
curl -X PUT http://localhost:5000/api/applications/$APP_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "selected",
    "notes": "Selected for position. Offer letter will be sent shortly."
  }'
```

---

### Step 13: Student Gets Notification
```bash
curl -X GET http://localhost:5000/api/applications/my \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

**Response shows**: Status = **"selected"** ✅

---

## Summary of Workflow

| Step | Actor | Action | Auto-Linked |
|------|-------|--------|-------------|
| 1 | Admin | Register with company name | Company created ✅ |
| 2 | Admin | Create job | Job → TechCorp ✅ |
| 3 | Student | Register | No company needed |
| 4 | Student | Update profile | Academic info only |
| 5 | Student | Apply for job | Application created |
| 6 | Admin | View applications | Filtered to TechCorp only |
| 7 | Admin | Shortlist candidate | Status updated |
| 8 | Student | Check status | Sees shortlisted |
| 9 | Admin | Schedule interview | Date set |
| 10 | Student | View interview | Sees date & time |
| 11 | Admin | Update interview | Feedback added |
| 12 | Admin | Select candidate | Status = selected |
| 13 | Student | Check status | Sees selected ✅ |

---

## Key Points

✅ **No separate company management** - Auto-created during registration  
✅ **Admin focus** - Jobs, applications, interviews only  
✅ **Student focus** - Profile, applications, interview tracking  
✅ **Clean separation** - Admin role ≠ Student profile  
✅ **Streamlined** - Register → Post Job → Manage Applications  

---

## Error Scenarios to Test

### Try to schedule interview without shortlisting
```bash
# Application status is "applied", not "shortlisted"
# Expected: Error - "Can only schedule interviews for shortlisted candidates"
```

### Student tries to update application status
```bash
# Expected: Error - "Only company admins can update application status"
```

### Admin A views Admin B's applications
```bash
# Different company
# Expected: Sees only their company's applications
```

### Student tries to create job
```bash
# Expected: Error - "Only company admins can create jobs"
```

---

This represents the complete, simplified workflow! 🎉

