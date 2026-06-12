const isEmail = (email = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isStrongPassword = (password = "") => password.length >= 6;

const isValidCgpa = (cgpa) => {
  const value = Number(cgpa);
  return Number.isFinite(value) && value >= 0 && value <= 10;
};

const normalizeSkills = (skills = []) => {
  if (typeof skills === "string") {
    return skills.split(",").map((skill) => skill.trim()).filter(Boolean);
  }

  if (!Array.isArray(skills)) return [];

  return skills.map((skill) => String(skill).trim()).filter(Boolean);
};

module.exports = {
  isEmail,
  isStrongPassword,
  isValidCgpa,
  normalizeSkills
};
