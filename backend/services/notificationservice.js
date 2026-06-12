const sendNotification = async ({ to, subject, message }) => {
  console.log("Notification:", { to, subject, message });
  return { sent: true };
};

module.exports = {
  sendNotification
};
