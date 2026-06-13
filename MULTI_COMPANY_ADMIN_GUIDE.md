# Multi-Company Admin System Implementation Guide

## Overview
The placement tracker has been updated to support multiple companies with independent admin accounts. Each company has its own admin login, and can only see and manage applications for jobs posted by their company.

## System Architecture

### Key Changes

#### 1. **User Model** (`backend/models/usermodel.js`)
- Added `company` field (reference to Company)
- Added `companyName` field for convenience
- These fields are used only for admin users
- Student users leave these fields empty

```javascript
// For admin users
company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
companyName: String,
```

#### 2. **Company Model** (`backend/models/companymodel.js`)
- Added `email` field (unique) - this is the company's registration email
- Added `adminUser` field (reference to User) - links to the admin user account
- Companies now have a dedicated email for admin login

```javascript
email: { type: String, required: true, unique: true, lowercase: true, trim: true },
adminUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
```

#### 3. **Auth Controller** (`backend/controllers/authcontroller.js`)
- New endpoint: `registerCompanyAdmin()` - for company admin registration
- Modified `login()` - populates company information for admins
- When a company admin registers:
  - A Company record is created with email and basic info
  - A User record is created with role="admin" linked to the company
  - The User's company field points to the Company record

#### 4. **Job Controller** (`backend/controllers/jobcontroller.js`)
- `createJob()` - only admins can create jobs; jobs are auto-assigned to their company
- `getJobs()` - 
  - Admins see only their company's jobs
  - Students see all open jobs
- `getJobById()` - company access control
- `updateJob()` - only company admins can update their own jobs
- `deleteJob()` - only company admins can delete their own jobs

#### 5. **Application Controller** (`backend/controllers/applicationcontroller.js`)
- `applyJob()` - students apply to jobs (unchanged)
- `myApplications()` - students view their own applications (unchanged)
- `getApplications()` - 
  - **Admins**: See only applications for their company's jobs
  - **Students**: Redirected to use `myApplications` endpoint
- `updateStatus()` - only admins can update; only for their company's applications

### Database Relationships

```
Company
  ├── _id
  ├── name
  ├── email (unique)
  ├── adminUser → User (admin account)
  └── ...other fields

User (Admin)
  ├── _id
  ├── name
  ├── email (unique)
  ├── role: "admin"
  ├── company → Company
  ├── companyName
  └── ...

User (Student)
  ├── _id
  ├── name
  ├── email (unique)
  ├── role: "student"
  ├── department
  ├── rollNumber
  ├── cgpa
  └── ...

Job
  ├── _id
  ├── company → Company (auto-set from admin's company)
  ├── companyName
  ├── createdBy → User (admin)
  ├── ...

Application
  ├── _id
  ├── student → User (student)
  ├── job → Job (company's job)
  └── ...
```

## API Endpoints

### Authentication

#### Register Company Admin
```
POST /api/auth/register-company-admin
Content-Type: application/json

{
  "name": "John Doe",
  "email": "admin@techcorp.com",
  "password": "SecurePassword123",
  "companyName": "TechCorp",
  "website": "https://techcorp.com",
  "description": "Leading tech company"
}

Response:
{
  "success": true,
  "message": "Company admin registered successfully",
  "data": {
    "token": "jwt_token_here",
    "user": { admin user object },
    "company": { company object }
  }
}
```

#### Register Student
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "Jane Student",
  "email": "jane@university.edu",
  "password": "SecurePassword123",
  "role": "student"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "jwt_token_here",
    "user": { student user object }
  }
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@techcorp.com",
  "password": "SecurePassword123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": { user object with company info if admin }
  }
}
```

### Jobs

#### Admin: Create Job
```
POST /api/jobs
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Senior Developer",
  "description": "We are looking for...",
  "role": "Full Stack Developer",
  "salary": "$80k-$120k",
  "location": "New York",
  "minCgpa": 7.0,
  "maxBacklogs": 0,
  "requiredSkills": ["JavaScript", "React", "Node.js"],
  "rounds": ["Technical", "HR", "Coding Challenge"]
}

Note: company field is auto-set from admin's company
```

#### Get Jobs (Role-based)
```
GET /api/jobs
Authorization: Bearer {token}

Admin Response: Returns only their company's jobs
Student Response: Returns all open jobs
```

### Applications

#### Student: Apply for Job
```
POST /api/applications/apply
Authorization: Bearer {token}
Content-Type: application/json

{
  "jobId": "job_id_here"
}
```

#### Admin: Get Company Applications
```
GET /api/applications
Authorization: Bearer {token}

Response: Applications for all their company's jobs
```

#### Student: Get My Applications
```
GET /api/applications/my
Authorization: Bearer {token}

Response: Student's own applications
```

#### Admin: Update Application Status
```
PUT /api/applications/:applicationId
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "shortlisted",
  "notes": "Candidate has required experience"
}

Valid statuses: "applied", "shortlisted", "rejected", "selected"
```

## Security Features

1. **Role-Based Access Control**: Different endpoints behave differently based on user role
2. **Company Isolation**: Admins can only see/manage their own company's data
3. **Unique Email Constraints**: Both User and Company have unique email constraints
4. **Association Verification**: Before performing actions, system verifies company ownership
5. **Proper Authorization Checks**: All endpoints validate user permissions before proceeding

## Admin Workflow

1. **Registration**: Company admin registers using `/register-company-admin`
   - Creates both Company and User records
   - Automatic association established

2. **Job Creation**: Admin creates jobs via `/api/jobs`
   - Jobs automatically linked to admin's company
   - Admin is set as `createdBy`

3. **View Applications**: Admin accesses `/api/applications`
   - Automatically filtered to show only their company's applications
   - Shows all applicants' details

4. **Manage Applications**: Admin updates application status
   - Can shortlist, reject, or select candidates
   - Can add notes for each application

## Student Workflow

1. **Registration**: Student registers using `/register`
   - Regular student account with no company association

2. **Browse Jobs**: Student views `/api/jobs`
   - Sees all open jobs from all companies

3. **Apply for Job**: Student applies via `/api/applications/apply`
   - Can apply to any open job

4. **Track Applications**: Student views `/api/applications/my`
   - Sees status of their own applications

## Testing the System

### Test Case 1: Company Admin Registration
```bash
curl -X POST http://localhost:5000/api/auth/register-company-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Admin",
    "email": "hr@acme.com",
    "password": "Acme123456",
    "companyName": "Acme Corporation",
    "website": "https://acme.com",
    "description": "Global IT Solutions"
  }'
```

### Test Case 2: Student Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Student",
    "email": "john@university.edu",
    "password": "Student123456",
    "role": "student"
  }'
```

### Test Case 3: Admin Creates Job
```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Software Engineer",
    "description": "Join our team",
    "role": "Backend",
    "salary": "$100k",
    "location": "Remote",
    "minCgpa": 7.0,
    "maxBacklogs": 0,
    "requiredSkills": ["Node.js", "MongoDB"],
    "rounds": ["Technical", "HR"]
  }'
```

### Test Case 4: Student Applies
```bash
curl -X POST http://localhost:5000/api/applications/apply \
  -H "Authorization: Bearer {student_token}" \
  -H "Content-Type: application/json" \
  -d '{"jobId": "job_id_here"}'
```

### Test Case 5: Admin Views Applications
```bash
curl -X GET http://localhost:5000/api/applications \
  -H "Authorization: Bearer {admin_token}"
```

## Important Notes

1. **Company Email Uniqueness**: Each company's email must be unique in the system
2. **Admin-Company Link**: An admin user can only be associated with one company
3. **Job Company Assignment**: Jobs created by an admin are automatically assigned to their company
4. **Application Visibility**: Applications are only visible to the company that posted the job
5. **Data Isolation**: There is complete isolation between companies' data

## Migration Notes (if upgrading)

If you have existing data:
1. Existing admin users won't have a `company` field set
2. You'll need to manually associate them with companies
3. Or create new admin accounts using the new registration endpoint
4. Existing jobs may need company assignment if they don't have it

## Future Enhancements

Potential improvements to consider:
- Multiple admins per company
- Company settings/preferences
- Bulk operations for companies
- Advanced analytics per company
- Interview scheduling per company
- Candidate evaluation templates per company

---

**Last Updated**: 2024
**Version**: 1.0
