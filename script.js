const GOAL = 50;
const STORAGE_KEY = "intelSummitCheckIn";

const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const greeting = document.getElementById("greeting");
const attendeeCountEl = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");

const teamCountEls = {
  water: document.getElementById("waterCount"),
  zero: document.getElementById("zeroCount"),
  power: document.getElementById("powerCount"),
};

const teamNames = {
  water: "Team Water Wise",
  zero: "Team Net Zero",
  power: "Team Renewables",
};

let state = {
  total: 0,
  teams: { water: 0, zero: 0, power: 0 },
  attendees: [],
};

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn("Could not save progress:", err);
  }
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      state = {
        total: parsed.total || 0,
        teams: { water: 0, zero: 0, power: 0, ...parsed.teams },
        attendees: parsed.attendees || [],
      };
    }
  } catch (err) {
    console.warn("Could not load saved progress:", err);
  }
}

function getAttendeeListEl() {
  let list = document.getElementById("attendeeList");
  if (!list) {
    const section = document.createElement("div");
    section.className = "attendee-list";
    section.innerHTML = "<h3>Attendee List</h3>";
    list = document.createElement("ul");
    list.id = "attendeeList";
    section.appendChild(list);
    document.querySelector(".team-stats").insertAdjacentElement("afterend", section);
  }
  return list;
}

function renderAttendeeList() {
  const list = getAttendeeListEl();
  list.innerHTML = "";
  state.attendees.forEach(function (person) {
    const li = document.createElement("li");
    li.className = "attendee-item";

    const nameSpan = document.createElement("span");
    nameSpan.className = "attendee-name";
    nameSpan.textContent = person.name;

    const teamSpan = document.createElement("span");
    teamSpan.className = "attendee-team " + person.team;
    teamSpan.textContent = teamNames[person.team];

    li.appendChild(nameSpan);
    li.appendChild(teamSpan);
    list.appendChild(li);
  });
}

function getWinningTeam() {
  let topCount = -1;
  let winners = [];
  for (const team in state.teams) {
    if (state.teams[team] > topCount) {
      topCount = state.teams[team];
      winners = [team];
    } else if (state.teams[team] === topCount) {
      winners.push(team);
    }
  }
  return winners.map(function (t) { return teamNames[t]; });
}

function celebrate() {
  const winners = getWinningTeam();
  const message =
    winners.length === 1
      ? `🎉 We hit our goal of ${GOAL} attendees! ${winners[0]} wins with the highest turnout!`
      : `🎉 We hit our goal of ${GOAL} attendees! It's a tie between ${winners.join(" and ")}!`;
  greeting.textContent = message;
  greeting.style.display = "block";
  greeting.classList.add("success-message", "celebration");
}

function render() {
  attendeeCountEl.textContent = state.total;
  for (const team in teamCountEls) {
    teamCountEls[team].textContent = state.teams[team];
  }
  const percent = Math.min(Math.round((state.total / GOAL) * 100), 100);
  progressBar.style.width = percent + "%";
  renderAttendeeList();
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = nameInput.value.trim();
  const team = teamSelect.value;
  if (!name || !team) {
    return;
  }

  state.total++;
  state.teams[team]++;
  state.attendees.push({ name: name, team: team });

  greeting.textContent = `Welcome, ${name} from ${teamNames[team]}! 🌱`;
  greeting.style.display = "block";
  greeting.classList.add("success-message");

  render();
  saveState();

  if (state.total === GOAL) {
    celebrate();
  }

  form.reset();
  nameInput.focus();
});

loadState();
render();
if (state.total >= GOAL) {
  celebrate();
}
