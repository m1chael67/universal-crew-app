const EMPLOYEES = {
  "1234": "Michael",
  "5678": "Shae",
};

function login() {
  const pin = document.getElementById('pin').value;
  if (EMPLOYEES[pin]) {
    localStorage.setItem("employee", EMPLOYEES[pin]);
    document.getElementById('user-name').textContent = EMPLOYEES[pin];
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('clock-screen').style.display = 'block';
  } else {
    alert("Invalid PIN");
  }
}

function clockIn() {
  const name = localStorage.getItem("employee") || "Unknown";
  const now = new Date();
  const logEntry = `${name} clocked in at ${now.toLocaleTimeString()}`;

  document.getElementById('clock-status').textContent = logEntry;

  // Email it using FormSubmit (free service)
  const form = document.createElement('form');
  form.action = "https://formsubmit.co/michaellazarov12@gmail.com";
  form.method = "POST";
  form.style.display = "none";

  const input = document.createElement('input');
  input.type = "hidden";
  input.name = "Clock In";
  input.value = logEntry;

  form.appendChild(input);
  document.body.appendChild(form);
  form.submit();

  // Then redirect to jobs page
  setTimeout(() => {
    window.location.href = "jobs.html";
  }, 1500);
}
