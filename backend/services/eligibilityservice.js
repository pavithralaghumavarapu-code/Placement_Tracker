const normalize = (value) => String(value || "").trim().toLowerCase();

const checkEligibility = (student, job) => {
  const reasons = [];
  const studentSkills = new Set((student.skills || []).map(normalize));
  const requiredSkills = (job.requiredSkills || []).map(normalize).filter(Boolean);
  const matchedSkills = requiredSkills.filter((skill) => studentSkills.has(skill));
  const missingSkills = requiredSkills.filter((skill) => !studentSkills.has(skill));

  if ((student.cgpa || 0) < (job.minCgpa || 0)) {
    reasons.push(`Minimum CGPA required is ${job.minCgpa}`);
  }

  if ((student.backlogs || 0) > (job.maxBacklogs || 0)) {
    reasons.push(`Maximum backlogs allowed is ${job.maxBacklogs}`);
  }

  return {
    eligible: reasons.length === 0,
    reasons,
    matchedSkills,
    missingSkills
  };
};

module.exports = {
  checkEligibility
};
