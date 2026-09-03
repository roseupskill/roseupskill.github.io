/* ABC Tutoring — shared data & helpers
   -------------------------------------
   This is CONCEPT-DEMO logic: bookings, slot availability, and view counts
   are stored in this browser's localStorage only. Nothing is sent to a
   server, so nobody else's visit affects what you see, and refreshing on
   a different device starts empty. See README.md for how to make this real. */

const TUTORS = [
  {
    id: "maria-chen",
    name: "Maria Chen",
    subject: "Math",
    subjectDetail: "Algebra, Geometry, Calculus",
    grades: "Grades 6–12",
    rate: 45,
    slots: ["Mon 4:00 PM", "Wed 4:00 PM", "Sat 10:00 AM"],
  },
  {
    id: "james-okafor",
    name: "James Okafor",
    subject: "Reading",
    subjectDetail: "Reading comprehension & writing",
    grades: "Grades K–8",
    rate: 40,
    slots: ["Tue 3:00 PM", "Thu 3:00 PM", "Thu 4:30 PM"],
  },
  {
    id: "priya-sharma",
    name: "Priya Sharma",
    subject: "Science",
    subjectDetail: "Biology, Chemistry",
    grades: "Grades 9–12",
    rate: 50,
    slots: ["Mon 5:00 PM", "Wed 5:00 PM", "Fri 5:00 PM"],
  },
  {
    id: "daniel-kim",
    name: "Daniel Kim",
    subject: "Math",
    subjectDetail: "Algebra I & II, SAT Math",
    grades: "Grades 8–12",
    rate: 48,
    slots: ["Tue 4:00 PM", "Thu 4:00 PM", "Sun 1:00 PM"],
  },
  {
    id: "sofia-martinez",
    name: "Sofia Martinez",
    subject: "Reading",
    subjectDetail: "Phonics & early reading",
    grades: "Grades K–5",
    rate: 38,
    slots: ["Mon 3:30 PM", "Tue 3:30 PM", "Wed 3:30 PM", "Thu 3:30 PM"],
  },
  {
    id: "ethan-brooks",
    name: "Ethan Brooks",
    subject: "Science",
    subjectDetail: "Physics, Earth Science",
    grades: "Grades 6–10",
    rate: 45,
    slots: ["Wed 4:00 PM", "Fri 4:00 PM", "Sat 9:00 AM"],
  },
];

const SUBJECT_COLOR = {
  Math: "denim",
  Reading: "berry",
  Science: "moss",
};

const HEARD_ABOUT_OPTIONS = [
  "Friend or family referral",
  "Google search",
  "Social media",
  "School flyer or newsletter",
  "Local community group",
  "Other",
];

/* ---------- localStorage helpers (concept-demo "database") ---------- */

const STORE_KEYS = {
  bookings: "abc_bookings",
  bookedSlots: "abc_bookedSlots",
  tutorViews: "abc_tutorViews",
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getBookedSlots() {
  return readJSON(STORE_KEYS.bookedSlots, {});
}

function isSlotBooked(tutorId, slot) {
  const booked = getBookedSlots();
  return !!(booked[tutorId] && booked[tutorId].includes(slot));
}

function markSlotBooked(tutorId, slot) {
  const booked = getBookedSlots();
  if (!booked[tutorId]) booked[tutorId] = [];
  if (!booked[tutorId].includes(slot)) booked[tutorId].push(slot);
  writeJSON(STORE_KEYS.bookedSlots, booked);
}

function saveBooking(booking) {
  const bookings = readJSON(STORE_KEYS.bookings, []);
  bookings.push(booking);
  writeJSON(STORE_KEYS.bookings, bookings);
}

function getBookings() {
  return readJSON(STORE_KEYS.bookings, []);
}

function recordTutorView(tutorId) {
  const views = readJSON(STORE_KEYS.tutorViews, {});
  views[tutorId] = (views[tutorId] || 0) + 1;
  writeJSON(STORE_KEYS.tutorViews, views);
}

function getTutorViews() {
  return readJSON(STORE_KEYS.tutorViews, {});
}

/* ---------- PostHog helper (safe no-op if PostHog hasn't loaded) ---------- */

function track(event, props) {
  if (window.posthog && typeof window.posthog.capture === "function") {
    window.posthog.capture(event, props || {});
  }
}
