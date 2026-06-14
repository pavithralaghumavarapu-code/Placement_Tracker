#PLACEMENT TRACKER- Multi-Company Admin System

## Overview
The placement tracker is developed to support multiple companies with independent admin accounts. Each company has its own admin login, and can only see and manage applications for jobs posted by their company.
 
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

Example Scenario
Setup
Company A Admin registers → Company A created
Company B Admin registers → Company B created
Student 1 registers
Student 2 registers
Operations
Company A Admin posts "Backend Developer" job

Job linked to Company A
Other companies can't see this job in their dashboard
Company B Admin posts "Frontend Developer" job

Job linked to Company B
Other companies can't see this job in their dashboard
Student 1 browses jobs

Sees BOTH Company A and Company B jobs
Applies to both
Company A Admin views applications

Sees ONLY Student 1's application (for Backend job)
Can't see Student 1's application to Company B
Company B Admin views applications

Sees ONLY Student 1's application (for Frontend job)
Can't see Student 1's application to Company A
Student 1 tracks applications

Sees status of both applications
Can see which company replied with which status


What You Can Do Now
Multiple Companies: Register and manage as many companies as needed
Independent Operations: Each company operates completely independently
Job Posting: Companies post jobs that only they can manage
Application Screening: Companies see only applications for their jobs
Candidate Tracking: Companies can accept/reject candidates
Student Application: Students apply to multiple companies
Privacy: Complete data isolation between companies

## Future Enhancements

Potential improvements to consider:
- Multiple admins per company
- Company settings/preferences
- Bulk operations for companies
- Advanced analytics per company
- Interview scheduling per company
- Candidate evaluation templates per company

 
 
