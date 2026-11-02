// ==========================================================================
// 1. Глобальні змінні та стан додатка
// ==========================================================================

let currentMap = null;
let statsChartInstance = null;

const state = {
  teachers: [],
  favorites: [],
  searchQuery: "",
  filters: {
    age: "",
    region: "",
    gender: "",
    photoOnly: false,
    favoriteOnly: false,
  },
  sort: { field: null, order: "asc" },
};

const europeCountries = [
  "Germany",
  "Ireland",
  "United Kingdom",
  "UK",
  "Spain",
  "France",
  "Norway",
  "Denmark",
  "Finland",
  "Switzerland",
  "Netherlands",
  "Turkey",
  "Ukraine",
  "Poland",
  "Belgium",
  "Italy",
];

// ==========================================================================
// Завдання 4: Day.js (Розрахунок днів до ДН)
// ==========================================================================

function getDaysUntilBirthday(bDayString) {
  if (!bDayString || typeof dayjs === "undefined") return null;
  const today = dayjs();
  let nextBirthday = dayjs(bDayString).year(today.year());

  if (nextBirthday.isBefore(today, "day")) {
    nextBirthday = nextBirthday.add(1, "year");
  }

  return nextBirthday.diff(today, "day");
}

// ==========================================================================
// Завдання 3: Lodash (Нормалізація об'єктів з API/моків)
// ==========================================================================

function mapApiUserToTeacher(raw, index) {
  const courses = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Computer Science",
    "Biology",
    "Chess",
  ];

  const firstName = _.get(raw, "name.first", "");
  const lastName = _.get(raw, "name.last", "");
  const fullName =
    raw.full_name || `${firstName} ${lastName}`.trim() || "Teacher";

  const picture = _.get(
    raw,
    "picture.large",
    _.get(raw, "picture.medium", raw.picture_large || raw.picture || null),
  );
  const country = _.get(raw, "location.country", raw.country || "Ukraine");
  const city = _.get(raw, "location.city", raw.city || "");

  const latitude = parseFloat(
    _.get(
      raw,
      "location.coordinates.latitude",
      raw.latitude || Math.random() * 80 - 40,
    ),
  );
  const longitude = parseFloat(
    _.get(
      raw,
      "location.coordinates.longitude",
      raw.longitude || Math.random() * 180 - 90,
    ),
  );

  const uniqueId = String(
    _.get(
      raw,
      "login.uuid",
      raw.id?.value ||
        raw.id ||
        `teacher-${index}-${Math.random().toString(36).substr(2, 9)}`,
    ),
  );

  return {
    id: uniqueId,
    full_name: fullName,
    course: raw.course || _.sample(courses),
    age: Number(_.get(raw, "dob.age", raw.age || 30)),
    gender: _.capitalize(_.get(raw, "gender", raw.gender || "male")),
    country: country,
    city: city,
    coordinates: {
      lat: isNaN(latitude) ? 50.45 : latitude,
      lng: isNaN(longitude) ? 30.52 : longitude,
    },
    email: raw.email || "email@domain.com",
    phone: raw.phone || "N/A",
    b_day:
      raw.b_day ||
      (_.get(raw, "dob.date")
        ? String(raw.dob.date).slice(0, 10)
        : "1990-01-01"),
    picture: picture,
    note: raw.note || "Experienced teacher",
    favorite: Boolean(raw.favorite),
  };
}

function toggleFavorite(teacher) {
  if (!teacher || !teacher.id) return;

  const index = state.favorites.findIndex(
    (f) => String(f.id) === String(teacher.id),
  );

  if (index > -1) {
    state.favorites.splice(index, 1);
    teacher.favorite = false;
  } else {
    state.favorites.push(teacher);
    teacher.favorite = true;
  }

  renderFavorites();
  applyFiltersAndSearch();
}

function renderTeachers(list) {
  if (!teachersGrid) return;
  teachersGrid.innerHTML = "";

  if (!list || list.length === 0) {
    teachersGrid.innerHTML =
      '<p style="grid-column: 1/-1; text-align: center; color: #777; padding: 20px;">No teachers match your search criteria.</p>';
    return;
  }

  list.forEach((teacher) => {
    // Проверка строго по уникальному ID
    const isFav = state.favorites.some(
      (f) => String(f.id) === String(teacher.id),
    );

    const card = document.createElement("a");
    card.href = "#modalTeacherInfo";
    card.className = "teacher-card";
    card.dataset.id = teacher.id;

    const starIcon = isFav ? "&#9733;" : "&#9734;";
    const starClass = isFav
      ? "teacher-card__fav-star active"
      : "teacher-card__fav-star";

    if (teacher.picture) {
      card.innerHTML = `
        <div class="teacher-card__avatar-box">
          <img src="${teacher.picture}" alt="${teacher.full_name}" class="teacher-card__avatar" />
          <span class="${starClass}">${starIcon}</span>
        </div>
        <h3 class="teacher-card__name">${teacher.full_name}</h3>
        <p class="teacher-card__subject">${teacher.course}</p>
        <span class="teacher-card__country">${teacher.country}</span>
      `;
    } else {
      card.innerHTML = `
        <div class="teacher-card__avatar-box teacher-card__avatar-box--initials">
          <span>${getInitials(teacher.full_name)}</span>
          <span class="${starClass}">${starIcon}</span>
        </div>
        <h3 class="teacher-card__name">${teacher.full_name}</h3>
        <p class="teacher-card__subject">${teacher.course}</p>
        <span class="teacher-card__country">${teacher.country}</span>
      `;
    }

    card.addEventListener("click", (e) => {
      if (e.target.classList.contains("teacher-card__fav-star")) {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(teacher);
        return;
      }

      populateTeacherInfoModal(teacher);
    });

    teachersGrid.appendChild(card);
  });
}

function getInitials(fullName) {
  if (!fullName) return "T.N";
  const parts = fullName.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}.${parts[1][0]}`.toUpperCase();
  }
  return `${parts[0][0]}`.toUpperCase();
}

// ==========================================================================
// 2. Рендеринг сітки карток
// ==========================================================================

const teachersGrid = document.querySelector(".teachers-grid");
const favoritesCarousel = document.querySelector(".carousel__items");

function renderFavorites() {
  const favoritesCarousel = document.querySelector(".carousel__items");
  if (!favoritesCarousel) return;
  favoritesCarousel.innerHTML = "";

  if (!state.favorites || state.favorites.length === 0) {
    favoritesCarousel.innerHTML =
      '<p style="font-size:14px; color:#888; text-align:center; width:100%; padding: 20px;">No favorites added yet.</p>';
    return;
  }

  state.favorites.forEach((teacher) => {
    const card = document.createElement("div");
    card.className = "teacher-card";
    card.dataset.id = teacher.id;

    const avatarHtml = teacher.picture
      ? `<img src="${teacher.picture}" alt="${teacher.full_name}" class="teacher-card__avatar">`
      : `<span>${getInitials(teacher.full_name)}</span>`;

    card.innerHTML = `
      <div class="teacher-card__avatar-box ${!teacher.picture ? "teacher-card__avatar-box--initials" : ""}">
        ${avatarHtml}
      </div>
      <h3 class="teacher-card__name">${teacher.full_name}</h3>
      <p class="teacher-card__subject">${teacher.course}</p>
    `;

    favoritesCarousel.appendChild(card);
  });
}

// ==========================================================================
// Завдання 1 & 4: Заповнення модалки даними конкретного викладача
// ==========================================================================

function populateTeacherInfoModal(teacher) {
  const modal = document.querySelector("#modalTeacherInfo");
  if (!modal) return;

  const photoBlock = modal.querySelector(".teacher-info__photo-block");
  if (photoBlock) {
    photoBlock.innerHTML = teacher.picture
      ? `<img src="${teacher.picture}" alt="${teacher.full_name}" class="teacher-info__photo">`
      : `<div style="width:160px; height:160px; display:flex; align-items:center; justify-content:center; border:1px solid #ff5752; font-size:40px; color:#ff5752;">${getInitials(teacher.full_name)}</div>`;
  }

  modal.querySelector("h2").innerText = teacher.full_name;
  modal.querySelector(".teacher-info__subject").innerText = teacher.course;

  const daysToBday = getDaysUntilBirthday(teacher.b_day);
  const bDayText =
    daysToBday !== null ? ` (Days to next birthday: ${daysToBday})` : "";

  const metaParagraphs = modal.querySelectorAll(".teacher-info__meta");
  if (metaParagraphs.length >= 2) {
    metaParagraphs[0].innerText = `${teacher.city || "City"}, ${teacher.country || "Country"}`;
    metaParagraphs[1].innerText = `${teacher.age || 30} y.o., ${teacher.gender || "Male"}${bDayText}`;
  }

  const bio = modal.querySelector(".teacher-info__bio");
  if (bio) bio.innerText = teacher.note || "No additional notes.";

  const emailLink = modal.querySelector(".teacher-info__link");
  if (emailLink) {
    emailLink.href = `mailto:${teacher.email}`;
    emailLink.innerText = teacher.email;
  }

  const phone = modal.querySelector(".teacher-info__phone");
  if (phone) phone.innerText = teacher.phone;

  // Оновлення зірочки всередині модального вікна
  const starBtn = modal.querySelector(".teacher-info__star");
  if (starBtn) {
    const isFav = state.favorites.some(
      (f) => String(f.id) === String(teacher.id),
    );
    starBtn.innerHTML = isFav ? "&#9733;" : "&#9734;";

    starBtn.onclick = () => {
      toggleFavorite(teacher);
      const updatedFav = state.favorites.some(
        (f) => String(f.id) === String(teacher.id),
      );
      starBtn.innerHTML = updatedFav ? "&#9733;" : "&#9734;";
    };
  }

  // Карта Leaflet
  let mapContainer = modal.querySelector("#teacherMap");
  if (!mapContainer) {
    mapContainer = document.createElement("div");
    mapContainer.id = "teacherMap";
    mapContainer.style.height = "200px";
    mapContainer.style.marginTop = "15px";
    mapContainer.style.borderRadius = "8px";
    modal.querySelector(".teacher-info").appendChild(mapContainer);
  }

  setTimeout(() => {
    if (typeof L === "undefined") return;

    if (currentMap) {
      currentMap.remove();
      currentMap = null;
    }

    const lat = teacher.coordinates?.lat || 50.45;
    const lng = teacher.coordinates?.lng || 30.52;

    currentMap = L.map("teacherMap").setView([lat, lng], 4);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(currentMap);

    L.marker([lat, lng])
      .addTo(currentMap)
      .bindPopup(
        `<b>${teacher.full_name}</b><br>${teacher.city}, ${teacher.country}`,
      )
      .openPopup();
  }, 250);
}
// ==========================================================================
// Завдання 3: Lodash (Фільтрація та Пошук)
// ==========================================================================

function applyFiltersAndSearch() {
  let filtered = _.cloneDeep(state.teachers);

  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    filtered = _.filter(
      filtered,
      (t) =>
        _.includes(t.full_name.toLowerCase(), q) ||
        _.includes((t.note || "").toLowerCase(), q) ||
        String(t.age) === q,
    );
  }

  if (state.filters.gender) {
    filtered = _.filter(filtered, {
      gender: _.capitalize(state.filters.gender),
    });
  }

  if (state.filters.region) {
    filtered = _.filter(filtered, (t) => {
      if (state.filters.region === "Europe")
        return europeCountries.includes(t.country);
      return true;
    });
  }

  if (state.filters.age) {
    const [min, max] = state.filters.age.split("-").map(Number);
    filtered = _.filter(filtered, (t) =>
      max ? t.age >= min && t.age <= max : t.age >= min,
    );
  }

  if (state.filters.photoOnly) {
    filtered = _.filter(filtered, (t) => t.picture !== null);
  }

  if (state.filters.favoriteOnly) {
    filtered = _.filter(filtered, (t) =>
      state.favorites.some((f) => f.id === t.id),
    );
  }

  if (state.sort.field) {
    filtered = _.orderBy(filtered, [state.sort.field], [state.sort.order]);
  }

  renderTeachers(filtered);
  renderStatisticsChart(filtered);
}

const searchInput = document.querySelector(".header__search input");
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    state.searchQuery = e.target.value.trim();
    applyFiltersAndSearch();
  });
}

const filtersContainer = document.querySelector(".filters");
if (filtersContainer) {
  filtersContainer.addEventListener("change", (e) => {
    const target = e.target;

    if (target.id === "filterAge") state.filters.age = target.value;
    if (target.id === "filterRegion") state.filters.region = target.value;
    if (target.id === "filterGender") state.filters.gender = target.value;
    if (target.id === "filterPhoto") state.filters.photoOnly = target.checked;
    if (target.id === "filterFavorites")
      state.filters.favoriteOnly = target.checked;

    applyFiltersAndSearch();
  });
}

// ==========================================================================
// Завдання 2 & 5: Chart.js та WebDataRocks
// ==========================================================================

function renderStatisticsChart(teachersList) {
  const ctx = document.getElementById("statsPieChart");
  if (!ctx || typeof Chart === "undefined") return;

  const courseCounts = _.countBy(teachersList, "course");
  const labels = _.keys(courseCounts);
  const data = _.values(courseCounts);

  if (statsChartInstance) {
    statsChartInstance.destroy();
  }

  statsChartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
            "#FF9F40",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
        title: { display: true, text: "Distribution of Teachers by Subject" },
      },
    },
  });
}

function initWebDataRocks(teachersList) {
  const container = document.getElementById("wdr-component");
  if (!container || typeof WebDataRocks === "undefined") return;

  new WebDataRocks({
    container: "#wdr-component",
    toolbar: true,
    report: {
      dataSource: {
        data: teachersList.map((t) => ({
          "Full Name": t.full_name,
          Subject: t.course,
          Country: t.country,
          Gender: t.gender,
          Age: t.age,
        })),
      },
      slice: {
        rows: [{ uniqueName: "Country" }],
        columns: [{ uniqueName: "Subject" }],
        measures: [
          {
            uniqueName: "Full Name",
            aggregation: "count",
            caption: "Teachers Count",
          },
        ],
      },
    },
  });
}

// ==========================================================================
// 4. Ініціалізація
// ==========================================================================

async function fetchInitialUsers() {
  try {
    const response = await fetch("https://randomuser.me/api/?results=50");
    if (!response.ok) throw new Error("HTTP error");
    const data = await response.json();

    state.teachers = _.map(data.results, (item, idx) =>
      mapApiUserToTeacher(item, idx),
    );
    state.favorites = state.teachers.filter((t) => t.favorite);

    applyFiltersAndSearch();
    initWebDataRocks(state.teachers);
  } catch (e) {
    console.warn("API error, fallback to local mocks:", e);
    if (typeof randomUserMock !== "undefined") {
      state.teachers = _.map(randomUserMock, (item, idx) =>
        mapApiUserToTeacher(item, idx),
      );
      applyFiltersAndSearch();
      initWebDataRocks(state.teachers);
    }
  }
}

async function loadMoreUsers() {
  try {
    const response = await fetch("https://randomuser.me/api/?results=10");
    if (!response.ok) throw new Error("Network response error");
    const data = await response.json();

    const newUsers = _.map(data.results, (item, idx) =>
      mapApiUserToTeacher(item, idx + state.teachers.length),
    );

    state.teachers.push(...newUsers);
    applyFiltersAndSearch();
  } catch (error) {
    console.error("Error loading more users:", error);
  }
}

const btnLoadMore = document.getElementById("btnLoadMore");
if (btnLoadMore) {
  btnLoadMore.addEventListener("click", loadMoreUsers);
}

document.addEventListener("DOMContentLoaded", () => {
  renderFavorites();
  fetchInitialUsers();
});
