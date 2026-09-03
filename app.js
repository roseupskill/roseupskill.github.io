document.addEventListener("DOMContentLoaded", () => {
  renderTutors();
  wireNav();
  wireBookingForm();
  prefillFromQuery();
});

/* ---------- mobile nav ---------- */

function wireNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => nav.classList.remove("open"))
  );
}

/* ---------- tutor cards ---------- */

function initials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("");
}

function renderTutors() {
  const grid = document.getElementById("tutorsGrid");
  if (!grid) return;

  grid.innerHTML = TUTORS.map((t) => {
    const color = SUBJECT_COLOR[t.subject];
    return `
      <article class="tutor-card" data-tutor="${t.id}">
        <div class="tutor-avatar ${color}">${initials(t.name)}</div>
        <h3 class="tutor-name">${t.name}</h3>
        <span class="tutor-tag">${t.subject}</span>
        <p class="tutor-meta">${t.subjectDetail}</p>
        <p class="tutor-meta">${t.grades}</p>
        <p class="tutor-rate">$${t.rate}<span> / hour</span></p>
        <button class="btn btn-secondary btn-small" data-book="${t.id}">
          Book with ${t.name.split(" ")[0]}
        </button>
      </article>
    `;
  }).join("");

  // Track a "view" once per tutor per page load, and let the whole card
  // count as an implicit view when someone actually engages with it.
  grid.querySelectorAll(".tutor-card").forEach((card) => {
    const tutorId = card.dataset.tutor;
    let counted = false;
    const countOnce = () => {
      if (counted) return;
      counted = true;
      recordTutorView(tutorId);
      const t = TUTORS.find((x) => x.id === tutorId);
      track("tutor_card_viewed", { tutor: t.name, subject: t.subject });
    };
    card.addEventListener("mouseenter", countOnce, { once: true });
    card.addEventListener("click", countOnce);
    card.addEventListener("touchstart", countOnce, { once: true, passive: true });
  });

  grid.querySelectorAll("[data-book]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tutorId = btn.dataset.book;
      document.getElementById("tutorSelect").value = tutorId;
      onTutorChange();
      document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
      document.getElementById("parentName").focus({ preventScroll: true });
    });
  });
}

function prefillFromQuery() {
  const params = new URLSearchParams(location.search);
  const tutorId = params.get("tutor");
  if (tutorId && TUTORS.some((t) => t.id === tutorId)) {
    document.getElementById("tutorSelect").value = tutorId;
    onTutorChange();
  }
}

/* ---------- booking form ---------- */

let selectedSlot = null;

function wireBookingForm() {
  const tutorSelect = document.getElementById("tutorSelect");
  if (!tutorSelect) return;

  // populate tutor dropdown
  tutorSelect.innerHTML =
    `<option value="">Choose a tutor…</option>` +
    TUTORS.map((t) => `<option value="${t.id}">${t.name} — ${t.subject}</option>`).join("");

  tutorSelect.addEventListener("change", onTutorChange);

  const form = document.getElementById("bookingForm");
  form.addEventListener("submit", onSubmitBooking);

  ["parentName", "parentEmail", "studentName", "studentGrade", "subjectSelect", "heardAbout"].forEach(
    (id) => document.getElementById(id).addEventListener("input", updateSummary)
  );
  document.getElementById("subjectSelect").addEventListener("change", updateSummary);
  document.getElementById("studentGrade").addEventListener("change", updateSummary);
  document.getElementById("heardAbout").addEventListener("change", updateSummary);
}

function onTutorChange() {
  selectedSlot = null;
  const tutorId = document.getElementById("tutorSelect").value;
  const wrap = document.getElementById("slotsWrap");
  const tutor = TUTORS.find((t) => t.id === tutorId);

  if (!tutor) {
    wrap.innerHTML = `<p class="slots-empty">Pick a tutor above to see their open times.</p>`;
    updateSummary();
    return;
  }

  // subject auto-follows the tutor, but stays editable
  document.getElementById("subjectSelect").value = tutor.subject;

  const chips = tutor.slots
    .map((slot) => {
      const booked = isSlotBooked(tutor.id, slot);
      return `<button type="button" class="slot-chip" data-slot="${slot}" ${
        booked ? "disabled" : ""
      }>${slot}${booked ? " · Booked" : ""}</button>`;
    })
    .join("");

  wrap.innerHTML = `<div class="slots">${chips}</div>`;

  wrap.querySelectorAll(".slot-chip:not(:disabled)").forEach((chip) => {
    chip.addEventListener("click", () => {
      wrap.querySelectorAll(".slot-chip").forEach((c) => c.classList.remove("selected"));
      chip.classList.add("selected");
      selectedSlot = chip.dataset.slot;
      updateSummary();
    });
  });

  updateSummary();
}

function updateSummary() {
  const tutorId = document.getElementById("tutorSelect").value;
  const tutor = TUTORS.find((t) => t.id === tutorId);
  const subject = document.getElementById("subjectSelect").value;
  const grade = document.getElementById("studentGrade").value;

  set("sumTutor", tutor ? tutor.name : "—");
  set("sumSubject", subject || "—");
  set("sumGrade", grade || "—");
  set("sumSlot", selectedSlot || "—");
  set("sumRate", tutor ? `$${tutor.rate}/hour` : "—");
}

function set(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function onSubmitBooking(e) {
  e.preventDefault();

  const tutorId = document.getElementById("tutorSelect").value;
  const tutor = TUTORS.find((t) => t.id === tutorId);

  if (!tutor) {
    alert("Please choose a tutor.");
    return;
  }
  if (!selectedSlot) {
    alert("Please choose an available time slot.");
    return;
  }

  const booking = {
    parentName: document.getElementById("parentName").value.trim(),
    parentEmail: document.getElementById("parentEmail").value.trim(),
    studentName: document.getElementById("studentName").value.trim(),
    studentGrade: document.getElementById("studentGrade").value,
    subject: document.getElementById("subjectSelect").value,
    tutorId: tutor.id,
    tutorName: tutor.name,
    slot: selectedSlot,
    heardAbout: document.getElementById("heardAbout").value,
    timestamp: new Date().toISOString(),
  };

  saveBooking(booking);
  markSlotBooked(tutor.id, selectedSlot);

  // Only send non-identifying details to PostHog — no names or emails.
  track("booking_submitted", {
    subject: booking.subject,
    tutor: booking.tutorName,
    grade: booking.studentGrade,
    heard_about: booking.heardAbout,
  });

  onTutorChange(); // refresh slot chips so the booked one now shows disabled

  const confirmBox = document.getElementById("confirmBox");
  confirmBox.classList.add("visible");
  confirmBox.querySelector("p").textContent =
    `Thanks, ${booking.parentName.split(" ")[0] || "there"} — we've saved your request for ` +
    `${booking.studentName} with ${tutor.name} on ${selectedSlot}. ` +
    `(Concept demo: no real email was sent — see README.md to connect one.)`;

  document.getElementById("bookingForm").reset();
  selectedSlot = null;
}
