const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Company = require("../models/companymodel");
const Job = require("../models/jobmodel");

dotenv.config();

const companies = [
  {
    name: "Tata Consultancy Services",
    website: "https://www.tcs.com",
    description: "IT services and consulting company hiring fresh graduates for software and support roles.",
    packages: ["3.6 LPA", "7 LPA"],
    roles: ["Software Engineer", "Digital Developer", "System Engineer"]
  },
  {
    name: "Infosys",
    website: "https://www.infosys.com",
    description: "Technology services company offering engineering, consulting, and digital roles.",
    packages: ["3.8 LPA", "6.5 LPA"],
    roles: ["System Engineer", "Specialist Programmer", "Power Programmer"]
  },
  {
    name: "Zoho",
    website: "https://www.zoho.com",
    description: "Product company building business software with strong focus on programming fundamentals.",
    packages: ["5.5 LPA", "8 LPA"],
    roles: ["Software Developer", "QA Engineer", "Technical Support Engineer"]
  },
  {
    name: "Freshworks",
    website: "https://www.freshworks.com",
    description: "SaaS product company hiring for full-stack engineering and customer-facing technical roles.",
    packages: ["6 LPA", "10 LPA"],
    roles: ["Frontend Developer", "Backend Developer", "Product Engineer"]
  }
];

const jobs = [
  {
    title: "MERN Stack Intern",
    companyName: "Freshworks",
    description: "Build React dashboards and Node.js APIs for internal placement workflow tools.",
    role: "Full Stack Developer",
    salary: "6 LPA",
    location: "Chennai",
    minCgpa: 7,
    maxBacklogs: 0,
    requiredSkills: ["javascript", "react", "node", "express", "mongodb"],
    rounds: ["Aptitude", "Coding", "Technical Interview", "HR"],
    status: "open"
  },
  {
    title: "Software Engineer Trainee",
    companyName: "Tata Consultancy Services",
    description: "Work on enterprise web applications, backend services, and database integrations.",
    role: "Software Engineer",
    salary: "3.6 LPA",
    location: "Hyderabad",
    minCgpa: 6,
    maxBacklogs: 1,
    requiredSkills: ["java", "sql", "javascript", "html", "css"],
    rounds: ["Aptitude", "Technical Interview", "Managerial Interview"],
    status: "open"
  },
  {
    title: "Product Developer",
    companyName: "Zoho",
    description: "Develop product features, solve programming problems, and collaborate with product teams.",
    role: "Software Developer",
    salary: "5.5 LPA",
    location: "Coimbatore",
    minCgpa: 6.5,
    maxBacklogs: 0,
    requiredSkills: ["javascript", "data structures", "sql", "git"],
    rounds: ["Programming Round", "Advanced Coding", "Technical Discussion", "HR"],
    status: "open"
  },
  {
    title: "System Engineer",
    companyName: "Infosys",
    description: "Join training and delivery teams to build, test, and maintain client applications.",
    role: "System Engineer",
    salary: "3.8 LPA",
    location: "Bengaluru",
    minCgpa: 6,
    maxBacklogs: 0,
    requiredSkills: ["python", "sql", "html", "css", "git"],
    rounds: ["Online Test", "Technical Interview", "HR"],
    status: "open"
  },
  {
    title: "Frontend Developer Intern",
    companyName: "Freshworks",
    description: "Create responsive React screens, integrate REST APIs, and improve user workflows.",
    role: "Frontend Developer",
    salary: "4.5 LPA",
    location: "Remote",
    minCgpa: 6.5,
    maxBacklogs: 1,
    requiredSkills: ["react", "javascript", "html", "css", "git"],
    rounds: ["Portfolio Review", "Coding", "Technical Interview"],
    status: "open"
  }
];

async function seed() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI or MONGODB_URI is required");
  }

  await mongoose.connect(mongoUri);

  const companyMap = new Map();

  for (const companyData of companies) {
    const company = await Company.findOneAndUpdate(
      { name: companyData.name },
      companyData,
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
    companyMap.set(company.name, company);
  }

  for (const jobData of jobs) {
    const company = companyMap.get(jobData.companyName);
    await Job.findOneAndUpdate(
      { title: jobData.title, companyName: jobData.companyName },
      { ...jobData, company: company?._id },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
  }

  console.log(`Seeded ${companies.length} companies and ${jobs.length} open jobs.`);
}

seed()
  .then(() => mongoose.disconnect())
  .catch((error) => {
    console.error(error.message);
    mongoose.disconnect().finally(() => process.exit(1));
  });
