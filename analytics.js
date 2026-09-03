/* Concept-demo password gate.
   IMPORTANT: this check runs entirely in the visitor's browser, so anyone
   who reads the page source can find the password. It's only meant to keep
   this concept demo's dashboard from being the first thing casual site
   visitors land on — it is NOT real security. See README.md for how a real
   deployment should handle this (a login behind a backend). */
const OWNER_PASSWORD = "abc-owner-2026";

document.addEventListener("DOMContentLoaded", () => {
  const gate = document.getElementById("gate");
  const dash = document.getElementById("dashboard");
  const form = document.getElementById("gateForm");
  const input = document.getElementById("gatePassword");
  const error = document.getElementById("gateError");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (input.value === OWNER_PASSWORD) {
      gate.style.display = "none";
      dash.style.display = "block";
      renderDashboard();
    } else {
      error.classList.add("visible");
    }
  });
});

function renderDashboard() {
  const views = getTutorViews();
  const bookings = getBookings();

  renderTopStats(views, bookings);
  renderHeardAbout(bookings);
  renderBookingsTable(bookings);
}

function renderTopStats(views, bookings) {
  const totalViews = Object.values(views).reduce((a, b) => a + b, 0);
  const totalBookings = bookings.length;

  let topTutorId = null;
  let topCount = -1;
  Object.entries(views).forEach(([id, count]) => {
    if (count > topCount) {
      topCount = count;
      topTutorId = id;
    }
  });
  const topTutor = TUTORS.find((t) => t.id === topTutorId);

  document.getElementById("statTopTutor").textContent = topTutor
    ? `${topTutor.name} (${topCount} view${topCount === 1 ? "" : "s"})`
    : "No views yet";

  const ratioText =
    totalViews === 0
      ? "No views yet"
      : `${totalViews} views → ${totalBookings} booking${totalBookings === 1 ? "" : "s"}`;
  document.getElementById("statRatio").textContent = ratioText;

  const pct = totalViews === 0 ? 0 : Math.round((totalBookings / totalViews) * 100);
  document.getElementById("statConversion").textContent =
    totalViews === 0 ? "—" : `${pct}%`;
}

function renderHeardAbout(bookings) {
  const wrap = document.getElementById("heardAboutBars");
  if (bookings.length === 0) {
    wrap.innerHTML = `<p class="slots-empty">No bookings yet on this device.</p>`;
    return;
  }

  const counts = {};
  bookings.forEach((b) => {
    counts[b.heardAbout] = (counts[b.heardAbout] || 0) + 1;
  });

  const max = Math.max(...Object.values(counts));

  wrap.innerHTML = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([source, count]) => {
      const pct = Math.round((count / max) * 100);
      return `
        <div class="bar-row">
          <span>${source}</span>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
          <span>${count}</span>
        </div>
      `;
    })
    .join("");
}

function renderBookingsTable(bookings) {
  const wrap = document.getElementById("bookingsTableWrap");
  if (bookings.length === 0) {
    wrap.innerHTML = `<p class="slots-empty">No bookings recorded on this device yet.</p>`;
    return;
  }

  const rows = bookings
    .slice()
    .reverse()
    .map(
      (b) => `
      <tr>
        <td>${b.studentName} (${b.studentGrade})</td>
        <td>${b.subject}</td>
        <td>${b.tutorName}</td>
        <td>${b.slot}</td>
        <td>${b.parentName}<br><span class="slots-empty">${b.parentEmail}</span></td>
        <td>${b.heardAbout}</td>
      </tr>`
    )
    .join("");

  wrap.innerHTML = `
    <table class="bookings-table">
      <thead>
        <tr><th>Student</th><th>Subject</th><th>Tutor</th><th>Time</th><th>Parent</th><th>Source</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}
