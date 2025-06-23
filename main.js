const loginScreen = document.getElementById('login-screen');
const appScreen = document.getElementById('main-app');
const userNameDisplay = document.getElementById('user-name');
const logDiv = document.getElementById('log');

const EMPLOYEES = {
  "1234": "Michael",
  "5678": "Shae",
};

function login() {
  const pin = document.getElementById('pin').value;
  if (EMPLOYEES[pin]) {
    userNameDisplay.textContent = EMPLOYEES[pin];
    loginScreen.style.display = 'none';
    appScreen.style.display = 'block';
  } else {
    alert("Invalid PIN");
  }
}

function clockIn() {
  const time = new Date().toLocaleTimeString();
  logDiv.innerHTML += `<p>⏱ Clocked in at ${time}</p>`;
}

function clockOut() {
  const time = new Date().toLocaleTimeString();
  logDiv.innerHTML += `<p>🔚 Clocked out at ${time}</p>`;
}
