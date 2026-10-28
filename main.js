// ==========================================================================
// 1. Глобальний стан додатку (State)
// ==========================================================================

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
  sort: {
    field: null,
    order: "asc",
  },
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
const asiaCountries = ["China", "India", "Japan", "Iran", "Vietnam"];
const usaCountries = ["United States", "USA", "Canada"];

// ==========================================================================
// 2. Безпечна адаптація об'єктів з API під інтерфейс (завдання 1 та 4)
// ==========================================================================

function mapApiUserToTeacher(raw) {
  // Якщо є функція formatUser з ЛР2 — використовуємо її для базованої формалізації
  let source = raw;
  if (typeof formatUser === "function") {
    try {
      source = formatUser(raw);
    } catch (e) {
      source = raw;
    }
  }

  const courses = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Computer Science",
    "Biology",
    "Chess",
  ];
  const randomCourse = courses[Math.floor(Math.random() * courses.length)];

  let fullName = "Teacher";
  if (source.full_name) {
    fullName = source.full_name;
  } else if (raw.name && typeof raw.name === "object") {
    fullName = `${raw.name.first || ""} ${raw.name.last || ""}`.trim();
  }

  let pic = null;
  if (source.picture_large) pic = source.picture_large;
  else if (source.picture)
    pic =
      typeof source.picture === "string"
        ? source.picture
        : source.picture.large;
  else if (raw.picture && typeof raw.picture === "object")
    pic = raw.picture.large || raw.picture.medium;

  let country =
    source.country || (raw.location ? raw.location.country : "Ukraine");
  let age = source.age || (raw.dob ? raw.dob.age : 30);
  let gender = source.gender || raw.gender || "Male";
  gender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();

  return {
    id: String(source.id || raw.login?.uuid || Date.now() + Math.random()),
    full_name: fullName,
    course: source.course || randomCourse,
    age: Number(age) || 30,
    gender: gender,
    country: country,
    city: source.city || (raw.location ? raw.location.city : ""),
    email: source.email || raw.email || "email@domain.com",
    phone: source.phone || raw.phone || "N/A",
    b_day:
      source.b_day ||
      (raw.dob ? String(raw.dob.date).slice(0, 10) : "1990-01-01"),
    picture: pic,
    note: source.note || "Experienced teacher",
    favorite: Boolean(source.favorite),
  };
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
// 3. Рендеринг DOM
// ==========================================================================

const teachersGrid = document.querySelector(".teachers-grid");
const favoritesCarousel = document.querySelector(".carousel__items");

function renderTeachers(list) {
  if (!teachersGrid) return;
  teachersGrid.innerHTML = "";

  if (!list || list.length === 0) {
    teachersGrid.innerHTML =
      '<p style="grid-column: 1/-1; text-align: center; color: #777; padding: 20px;">No teachers match your search criteria.</p>';
    return;
  }

  list.forEach((teacher) => {
    const isFav = state.favorites.some((f) => f.id === teacher.id);
    const card = document.createElement("a");
    card.href = "#modalTeacherInfo";
    card.className = "teacher-card";
    card.dataset.id = teacher.id;

    if (teacher.picture) {
      card.innerHTML = `
        <div class="teacher-card__avatar-box">
          <img src="${teacher.picture}" alt="${teacher.full_name}" class="teacher-card__avatar" />
          ${isFav ? '<span class="teacher-card__fav-star">&#9733;</span>' : ""}
        </div>
        <h3 class="teacher-card__name">${teacher.full_name}</h3>
        <p class="teacher-card__subject">${teacher.course}</p>
        <span class="teacher-card__country">${teacher.country}</span>
      `;
    } else {
      card.innerHTML = `
        <div class="teacher-card__avatar-box teacher-card__avatar-box--initials">
          <span>${getInitials(teacher.full_name)}</span>
          ${isFav ? '<span class="teacher-card__fav-star">&#9733;</span>' : ""}
        </div>
        <h3 class="teacher-card__name">${teacher.full_name}</h3>
        <p class="teacher-card__subject">${teacher.course}</p>
        <span class="teacher-card__country">${teacher.country}</span>
      `;
    }

    teachersGrid.appendChild(card);
  });
}

function renderFavorites() {
  if (!favoritesCarousel) return;
  favoritesCarousel.innerHTML = "";

  if (state.favorites.length === 0) {
    favoritesCarousel.innerHTML =
      '<p style="font-size:12px; color:#888; text-align:center; width:100%;">No favorites added yet.</p>';
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

function toggleFavorite(teacher) {
  const index = state.favorites.findIndex((f) => f.id === teacher.id);
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

if (teachersGrid) {
  teachersGrid.addEventListener("click", (event) => {
    const card = event.target.closest(".teacher-card");
    if (!card) return;

    const teacherId = card.dataset.id;
    const teacher = state.teachers.find((t) => t.id === teacherId);

    if (event.target.classList.contains("teacher-card__fav-star")) {
      event.preventDefault();
      event.stopPropagation();
      if (teacher) toggleFavorite(teacher);
      return;
    }

    if (teacher) {
      populateTeacherInfoModal(teacher);
    }
  });
}

function populateTeacherInfoModal(teacher) {
  const modal = document.querySelector("#modalTeacherInfo");
  if (!modal) return;

  const photoBlock = modal.querySelector(".teacher-info__photo-block");
  if (teacher.picture) {
    photoBlock.innerHTML = `<img src="${teacher.picture}" alt="${teacher.full_name}" class="teacher-info__photo">`;
  } else {
    photoBlock.innerHTML = `<div class="teacher-card__avatar-box--initials" style="width:160px; height:160px; font-size:40px; display:flex; align-items:center; justify-content:center; border-radius:4px; border:1px solid #ff5752; color:#ff5752;"><span>${getInitials(teacher.full_name)}</span></div>`;
  }

  modal.querySelector("h2").innerText = teacher.full_name;
  modal.querySelector(".teacher-info__subject").innerText = teacher.course;

  const metaParagraphs = modal.querySelectorAll(".teacher-info__meta");
  if (metaParagraphs.length >= 2) {
    metaParagraphs[0].innerText = `${teacher.city || ""}, ${teacher.country}`;
    metaParagraphs[1].innerText = `${teacher.age}, ${teacher.gender}`;
  }

  const emailLink = modal.querySelector(".teacher-info__link");
  if (emailLink) {
    emailLink.href = `mailto:${teacher.email}`;
    emailLink.innerText = teacher.email;
  }

  const phoneElement = modal.querySelector(".teacher-info__phone");
  if (phoneElement) phoneElement.innerText = teacher.phone || "N/A";

  const bioElement = modal.querySelector(".teacher-info__bio");
  if (bioElement) bioElement.innerText = teacher.note || "No notes available.";

  const starBtn = modal.querySelector(".teacher-info__star");
  if (starBtn) {
    const isFav = state.favorites.some((f) => f.id === teacher.id);
    starBtn.innerText = isFav ? "★" : "☆";

    starBtn.onclick = () => {
      toggleFavorite(teacher);
      const updatedFav = state.favorites.some((f) => f.id === teacher.id);
      starBtn.innerText = updatedFav ? "★" : "☆";
    };
  }
}

// ==========================================================================
// 4. Фільтрація, Пошук та Динамічна Статистика (Завдання 2)
// ==========================================================================

function applyFiltersAndSearch() {
  let filtered = [...state.teachers];

  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.full_name.toLowerCase().includes(q) ||
        (t.note && t.note.toLowerCase().includes(q)) ||
        (t.age && t.age.toString() === q),
    );
  }

  if (state.filters.gender) {
    filtered = filtered.filter(
      (t) => t.gender.toLowerCase() === state.filters.gender.toLowerCase(),
    );
  }

  if (state.filters.region) {
    filtered = filtered.filter((t) => {
      if (state.filters.region === "Europe")
        return europeCountries.includes(t.country);
      if (state.filters.region === "Asia")
        return asiaCountries.includes(t.country);
      if (state.filters.region === "USA")
        return usaCountries.includes(t.country);
      return true;
    });
  }

  if (state.filters.age) {
    const [min, max] = state.filters.age.split("-").map(Number);
    filtered = filtered.filter((t) =>
      max ? t.age >= min && t.age <= max : t.age >= min,
    );
  }

  if (state.filters.photoOnly) {
    filtered = filtered.filter((t) => t.picture !== null);
  }

  if (state.filters.favoriteOnly) {
    filtered = filtered.filter((t) =>
      state.favorites.some((f) => f.id === t.id),
    );
  }

  if (state.sort.field) {
    filtered.sort((a, b) => {
      let valA = a[state.sort.field];
      let valB = b[state.sort.field];
      if (typeof valA === "string") {
        return state.sort.order === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return state.sort.order === "asc" ? valA - valB : valB - valA;
    });
  }

  renderTeachers(filtered);
  renderStatisticsTable(filtered);
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

const statsTableBody = document.querySelector(".stats-table tbody");
const statsTableHead = document.querySelector(".stats-table thead");

function renderStatisticsTable(teachersList) {
  if (!statsTableBody) return;
  statsTableBody.innerHTML = "";

  teachersList.forEach((t) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${t.full_name}</td>
      <td>${t.course}</td>
      <td>${t.age}</td>
      <td>${t.gender}</td>
      <td>${t.country}</td>
    `;
    statsTableBody.appendChild(row);
  });
}

if (statsTableHead) {
  statsTableHead.addEventListener("click", (e) => {
    const th = e.target.closest("th");
    if (!th) return;

    const text = th.innerText.toLowerCase();
    let field = null;

    if (text.includes("name")) field = "full_name";
    if (text.includes("subject")) field = "course";
    if (text.includes("age")) field = "age";
    if (text.includes("gender")) field = "gender";
    if (text.includes("nationality")) field = "country";

    if (!field) return;

    if (state.sort.field === field) {
      state.sort.order = state.sort.order === "asc" ? "desc" : "asc";
    } else {
      state.sort.field = field;
      state.sort.order = "asc";
    }

    statsTableHead
      .querySelectorAll("th")
      .forEach((h) => h.classList.remove("active-sort"));
    th.classList.add("active-sort");

    applyFiltersAndSearch();
  });
}

// ==========================================================================
// 5. Запити до API: 50 початкових (Завдання 1) та +10 Пагінація (Завдання 4)
// ==========================================================================

async function fetchInitialUsers() {
  try {
    const response = await fetch("https://randomuser.me/api/?results=50");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    const formattedUsers = data.results.map(mapApiUserToTeacher);

    state.teachers = [...formattedUsers];
    state.favorites = formattedUsers.filter((t) => t.favorite);

    applyFiltersAndSearch();
  } catch (error) {
    console.warn(
      "Failed to fetch from RandomUser API, loading local fallback:",
      error,
    );
    if (typeof randomUserMock !== "undefined") {
      state.teachers = randomUserMock.map(mapApiUserToTeacher);
      applyFiltersAndSearch();
    }
  }
}

async function loadMoreUsers() {
  try {
    const response = await fetch("https://randomuser.me/api/?results=10");
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();

    const newUsers = data.results.map(mapApiUserToTeacher);

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

// ==========================================================================
// 6. Форма додавання викладача (POST на json-server, Завдання 5)
// ==========================================================================

const addTeacherForm = document.querySelector("#modalAddTeacher .teacher-form");

if (addTeacherForm) {
  addTeacherForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.querySelector("#addName").value.trim();
    const subject = document.querySelector("#addSub").value;
    const country = document.querySelector("#addCountry").value;
    const city = document.querySelector("#addCity").value.trim();
    const email = document.querySelector("#addEmail").value.trim();
    const phone = document.querySelector("#addPhone").value.trim();
    const dob = document.querySelector("#addDob").value;
    const sexInput = addTeacherForm.querySelector(
      'input[name="Gender"]:checked',
    );
    const sex = sexInput ? sexInput.value : "male";
    const notes = document.querySelector("#addNotes").value.trim();

    let age = 30;
    if (dob) {
      const birthYear = new Date(dob).getFullYear();
      age = new Date().getFullYear() - birthYear;
    }

    const newTeacherData = {
      id: Date.now().toString(),
      full_name: name,
      course: subject,
      country: country,
      city: city,
      email: email,
      phone: phone,
      b_day: dob,
      age: age,
      gender: sex.charAt(0).toUpperCase() + sex.slice(1),
      note: notes,
      favorite: false,
    };

    if (typeof validateUser === "function") {
      const validation = validateUser(newTeacherData);
      if (!validation.isValid) {
        alert(`Validation error: ${validation.errors.join(", ")}`);
        return;
      }
    }

    try {
      const response = await fetch("http://localhost:3000/teachers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTeacherData),
      });

      if (!response.ok) throw new Error("Failed to save to json-server");

      const savedTeacher = await response.json();
      state.teachers.unshift(mapApiUserToTeacher(savedTeacher));
      applyFiltersAndSearch();

      addTeacherForm.reset();
      window.location.hash = "#";
      alert("Teacher successfully added!");
    } catch (error) {
      console.warn("json-server is not running, adding locally:", error);
      state.teachers.unshift(mapApiUserToTeacher(newTeacherData));
      applyFiltersAndSearch();
      addTeacherForm.reset();
      window.location.hash = "#";
    }
  });
}

// ==========================================================================
// 7. Старт
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  renderFavorites();
  fetchInitialUsers();
});
