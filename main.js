
document.addEventListener("DOMContentLoaded", function () {
  const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSiCVJqaIrsBdGSXhdJG-yPooQUbGzfiRXfdhTXmYna6hcgzGf5jaJXX61Ok6IsM6VCQNhLDN_odNZF/pub?output=csv";
  const container = document.getElementById("job-list");

  fetch(sheetURL)
    .then(response => response.text())
    .then(csv => {
      const rows = csv.split("\n").map(row => row.split(","));
      const headers = rows.shift();
      const jobs = rows.map(row => {
        const job = {};
        headers.forEach((h, i) => job[h.trim()] = row[i]?.trim());
        return job;
      });

      const today = new Date();
      const todayStr = (today.getMonth() + 1) + "/" + today.getDate() + "/" + today.getFullYear();

      const grouped = {};
      jobs.forEach(job => {
        if (job["Date"] === todayStr) {
          const key = job["Name"] + job["Phone Number"] + job["Date"];
          if (!grouped[key]) {
            grouped[key] = {
              name: job["Name"],
              address: job["Address"],
              phone: job["Phone Number"],
              date: job["Date"],
              inventory: []
            };
          }
          grouped[key].inventory.push({
            item: job["Inventory"],
            quantity: job["Quantity"],
            type: job["Type"],
            notes: job["Notes"]
          });
        }
      });

      container.innerHTML = "";

      if (Object.keys(grouped).length === 0) {
        container.innerHTML = "<p>No jobs for today.</p>";
        return;
      }

      Object.values(grouped).forEach(group => {
        const block = document.createElement("div");
        block.className = "job-block";
        block.innerHTML = `
          <div class="job-header">
            <h2>${group.name}</h2>
            <span class="job-date">${group.date}</span>
          </div>
          <p><strong>Phone:</strong> ${group.phone}</p>
          <p><strong>Address:</strong> ${group.address}</p>
          <div class="job-inventory">
            <h4>Inventory</h4>
            <ul>
              ${group.inventory.map(i => `<li>${i.type} × ${i.quantity} — ${i.item} ${i.notes ? "(" + i.notes + ")" : ""}</li>`).join("")}
            </ul>
          </div>
        `;
        container.appendChild(block);
      });
    })
    .catch(error => {
      container.innerHTML = "<p>Error loading jobs. Check CSV/URL or sheet formatting.</p>";
      console.error(error);
    });
});
