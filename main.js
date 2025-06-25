
// Check if already clocked in
function updateHoursDisplay() {
  const employee = localStorage.getItem("employee");
  if (!employee) return;

  const now = new Date();
  const key = `hours-${now.getFullYear()}-${now.getMonth() + 1}-${employee}`;
  const hours = parseFloat(localStorage.getItem(key)) || 0;

  const el = document.getElementById("hour-tracker");
  if (el) el.innerText = `Hours this month: ${hours.toFixed(2)}`;
}

// Save clock-in time
function saveClockIn() {
  const now = new Date();
  localStorage.setItem("clockInTime", now.toISOString());
}

// Calculate and save clock-out duration
function saveClockOut() {
  const employee = localStorage.getItem("employee");
  const clockInTime = localStorage.getItem("clockInTime");

  if (!employee || !clockInTime) return;

  const clockIn = new Date(clockInTime);
  const clockOut = new Date();
  const diffMs = clockOut - clockIn;
  const diffHrs = diffMs / (1000 * 60 * 60); // ms to hours

  const key = `hours-${clockOut.getFullYear()}-${clockOut.getMonth() + 1}-${employee}`;
  const existingHours = parseFloat(localStorage.getItem(key)) || 0;
  const updated = existingHours + diffHrs;

  localStorage.setItem(key, updated.toFixed(2));
  localStorage.removeItem("clockInTime");
  localStorage.setItem("clockedIn", "false");
}

// Handle redirect after login
function handleLoginRedirect() {
  const isClockedIn = localStorage.getItem("clockedIn") === "true";
  if (isClockedIn) {
    saveClockIn();
    window.location.href = "jobs.html";
  }
}

// Automatically update hour tracker when job page loads
document.addEventListener("DOMContentLoaded", () => {
  updateHoursDisplay();
  const clockOutBtn = document.getElementById("clock-out");

  if (clockOutBtn) {
    clockOutBtn.addEventListener("click", () => {
      saveClockOut();
    });
  }
});
