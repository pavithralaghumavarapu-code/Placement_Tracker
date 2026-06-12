const KEY_SKILLS = [
  "javascript",
  "react",
  "node",
  "express",
  "mongodb",
  "java",
  "python",
  "sql",
  "html",
  "css",
  "git",
  "aws",
  "docker",
  "machine learning",
  "data structures"
];

const analyzeResume = async ({ text = "", existingSkills = [] }) => {
  const lowerText = text.toLowerCase();
  const extractedSkills = KEY_SKILLS.filter((skill) => lowerText.includes(skill));
  const allSkills = Array.from(new Set([...existingSkills, ...extractedSkills]));
  const suggestions = [];

  if (!lowerText.includes("project")) suggestions.push("Add 2-3 strong project descriptions with measurable outcomes.");
  if (!lowerText.includes("intern")) suggestions.push("Mention internships, training or practical experience if available.");
  if (allSkills.length < 5) suggestions.push("Add more relevant technical skills aligned with target roles.");
  if (!lowerText.includes("github") && !lowerText.includes("linkedin")) suggestions.push("Add GitHub and LinkedIn profile links.");

  const aiScore = Math.min(100, Math.round(35 + allSkills.length * 8 + Math.max(0, 4 - suggestions.length) * 8));

  return {
    aiScore,
    extractedSkills: allSkills,
    suggestions,
    analysis: "Resume analyzed using local keyword scoring. Connect a real AI provider later for deeper parsing."
  };
};

module.exports = {
  analyzeResume
};
