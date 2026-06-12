const calculateProfileScore = (user) => {
  const checks = [
    Boolean(user.name),
    Boolean(user.email),
    Boolean(user.department),
    Boolean(user.rollNumber),
    Number(user.cgpa) > 0,
    Array.isArray(user.skills) && user.skills.length > 0,
    Boolean(user.resumeUrl)
  ];

  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};

const calculatePlacementScore = ({ user, resumeScore = 0 }) => {
  const profileScore = calculateProfileScore(user);
  const skillScore = Math.min(100, (user.skills || []).length * 12);
  const finalScore = Math.round(profileScore * 0.35 + skillScore * 0.25 + resumeScore * 0.4);

  return {
    profileScore,
    skillScore,
    resumeScore,
    finalScore
  };
};

module.exports = {
  calculateProfileScore,
  calculatePlacementScore
};
