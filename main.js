// ==========================================================================
// 1. Начальные данные и Состояние приложения (State)
// ==========================================================================

const initialTeachers = [
  {
    id: "1",
    full_name: "Ihor Tkachuk",
    course: "Chemistry",
    age: 35,
    gender: "Male",
    country: "Ukraine",
    city: "Kyiv",
    email: "ihor_tkachuk@domain.com",
    phone: "+380964993252",
    b_day: "1989-05-14",
    picture: "images/teacher_male1.png",
    note: "Experienced chemistry tutor",
    favorite: true,
  },
  {
    id: "2",
    full_name: "Pragg Ramesh",
    course: "Chess",
    age: 24,
    gender: "Male",
    country: "India",
    city: "New Delhi",
    email: "pragg@domain.com",
    phone: "+919876543210",
    b_day: "2000-08-10",
    picture: null,
    note: "Grandmaster and tactics trainer",
    favorite: false,
  },
  {
    id: "3",
    full_name: "Floor Jansen",
    course: "Biology",
    age: 41,
    gender: "Female",
    country: "Denmark",
    city: "Copenhagen",
    email: "floor@domain.com",
    phone: "+4512345678",
    b_day: "1983-02-21",
    picture: null,
    note: "Vocal and biology coach",
    favorite: false,
  },
  {
    id: "4",
    full_name: "John Burke",
    course: "Computer Science",
    age: 37,
    gender: "Male",
    country: "Belgium",
    city: "Brussels",
    email: "john_b@domain.com",
    phone: "+3221234567",
    b_day: "1987-11-03",
    picture: "images/teacher_male3.png",
    note: "Full-stack developer",
    favorite: false,
  },
  {
    id: "5",
    full_name: "Ari Tang",
    course: "Biology",
    age: 29,
    gender: "Female",
    country: "China",
    city: "Beijing",
    email: "ari_tang@domain.com",
    phone: "+861012345678",
    b_day: "1995-04-12",
    picture: "images/teacher_female2.png",
    note: "Specialist in molecular biology",
    favorite: true,
  },
  {
    id: "6",
    full_name: "Rachel Andrew",
    course: "Medicine",
    age: 33,
    gender: "Female",
    country: "UK",
    city: "London",
    email: "rachel@domain.com",
    phone: "+442012345678",
    b_day: "1991-09-18",
    picture: "images/teacher_male2.png",
    note: "Medical doctor",
    favorite: false,
  },
  {
    id: "7",
    full_name: "Anna Muzychuk",
    course: "Chess",
    age: 31,
    gender: "Female",
    country: "Ukraine",
    city: "Lviv",
    email: "anna_m@domain.com",
    phone: "+380671112233",
    b_day: "1993-02-28",
    picture: "images/teacher_female1.png",
    note: "Grandmaster",
    favorite: false,
  },
  {
    id: "8",
    full_name: "Radoslaw Ljuboevic",
    course: "Physics",
    age: 40,
    gender: "Male",
    country: "Poland",
    city: "Warsaw",
    email: "radoslaw@domain.com",
    phone: "+48221234567",
    b_day: "1984-06-15",
    picture: null,
    note: "Physics professor",
    favorite: false,
  },
];

const state = {
  teachers: [...initialTeachers],
  favorites: initialTeachers.filter((t) => t.favorite),
  searchQuery: "",
  filters: {
    age: "",
    region: "",
    gender: "",
    favoriteOnly: false,
    photoOnly: false,
  },
  sort: {
    field: null,
    order: "asc",
  },
};

// Вспомогательная функция для генерации инициалов
function getInitials(fullName) {
  if (!fullName) return "T.N";
  const parts = fullName.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}.${parts[1][0]}`.toUpperCase();
  }
  return `${parts[0][0]}`.toUpperCase();
}

// ==========================================================================
// 2. Отрисовка преподавателей и карусели Favorites
// ==========================================================================

const teachersGrid = document.querySelector(".teachers-grid");
const favoritesCarousel = document.querySelector(".carousel__items");

function renderTeachers(list) {
  if (!teachersGrid) return;
  teachersGrid.innerHTML = "";

  if (list.length === 0) {
    teachersGrid.innerHTML =
      '<p style="grid-column: 1/-1; text-align: center; color: #777;">No teachers found.</p>';
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
      '<p style="font-size:13px; color:#888;">No favorites added.</p>';
    return;
  }

  state.favorites.forEach((teacher) => {
    const card = document.createElement("div");
    card.className = "teacher-card";
    card.dataset.id = teacher.id;

    if (teacher.picture) {
      card.innerHTML = `
        <div class="teacher-card__avatar-box">
          <img src="${teacher.picture}" alt="${teacher.full_name}" class="teacher-card__avatar" />
        </div>
        <h3 class="teacher-card__name">${teacher.full_name}</h3>
        <p class="teacher-card__subject">${teacher.course}</p>
      `;
    } else {
      card.innerHTML = `
        <div class="teacher-card__avatar-box teacher-card__avatar-box--initials">
          <span>${getInitials(teacher.full_name)}</span>
        </div>
        <h3 class="teacher-card__name">${teacher.full_name}</h3>
        <p class="teacher-card__subject">${teacher.course}</p>
      `;
    }

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

// Делегирование событий на сетке учителей
if (teachersGrid) {
  teachersGrid.addEventListener("click", (e) => {
    const card = e.target.closest(".teacher-card");
    if (!card) return;

    const teacherId = card.dataset.id;
    const teacher = state.teachers.find((t) => t.id === teacherId);

    if (e.target.classList.contains("teacher-card__fav-star")) {
      e.preventDefault();
      e.stopPropagation();
      toggleFavorite(teacher);
      return;
    }

    if (teacher) {
      populateTeacherInfoModal(teacher);
    }
  });
}

// Заполнение модального окна подробной информацией
function populateTeacherInfoModal(teacher) {
  const modal = document.querySelector("#modalTeacherInfo");
  if (!modal) return;

  const photoBlock = modal.querySelector(".teacher-info__photo-block");
  if (teacher.picture) {
    photoBlock.innerHTML = `<img src="${teacher.picture}" alt="${teacher.full_name}" class="teacher-info__photo" />`;
  } else {
    photoBlock.innerHTML = `<div class="teacher-card__avatar-box--initials" style="width:160px; height:160px; font-size:42px; border-radius:4px; display:flex; align-items:center; justify-content:center; border:2px solid #ff5752; color:#ff5752;"><span>${getInitials(teacher.full_name)}</span></div>`;
  }

  modal.querySelector("h2").innerText = teacher.full_name;
  modal.querySelector(".teacher-info__subject").innerText = teacher.course;

  const metas = modal.querySelectorAll(".teacher-info__meta");
  if (metas[0])
    metas[0].innerText = `${teacher.city || ""}, ${teacher.country}`;
  if (metas[1])
    metas[1].innerText = `${teacher.age || ""}, ${teacher.gender || ""}`;

  const emailLink = modal.querySelector(".teacher-info__link");
  if (emailLink) {
    emailLink.href = `mailto:${teacher.email}`;
    emailLink.innerText = teacher.email;
  }

  const phoneEl = modal.querySelector(".teacher-info__phone");
  if (phoneEl) phoneEl.innerText = teacher.phone || "N/A";

  const bioEl = modal.querySelector(".teacher-info__bio");
  if (bioEl) bioEl.innerText = teacher.note || "Lorem ipsum dolor sit amet...";

  const starBtn = modal.querySelector(".teacher-info__star");
  if (starBtn) {
    const isFav = state.favorites.some((f) => f.id === teacher.id);
    starBtn.innerHTML = isFav ? "&#9733;" : "&#9734;";
    starBtn.onclick = () => {
      toggleFavorite(teacher);
      const updatedFav = state.favorites.some((f) => f.id === teacher.id);
      starBtn.innerHTML = updatedFav ? "&#9733;" : "&#9734;";
    };
  }
}

// ==========================================================================
// 3. Фильтрация и Поиск
// ==========================================================================

function applyFiltersAndSearch() {
  let filtered = [...state.teachers];

  // Поиск (По имени, комментарию, возрасту)
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    filtered = filtered.filter((t) => {
      const matchName = t.full_name.toLowerCase().includes(q);
      const matchNote = t.note && t.note.toLowerCase().includes(q);
      const matchAge = t.age && t.age.toString() === q;
      return matchName || matchNote || matchAge;
    });
  }

  // Фильтры
  if (state.filters.gender) {
    filtered = filtered.filter(
      (t) => t.gender.toLowerCase() === state.filters.gender.toLowerCase(),
    );
  }

  if (state.filters.age) {
    const [min, max] = state.filters.age.split("-").map(Number);
    if (max) {
      filtered = filtered.filter((t) => t.age >= min && t.age <= max);
    } else if (min) {
      filtered = filtered.filter((t) => t.age >= min);
    }
  }

  if (state.filters.favoriteOnly) {
    filtered = filtered.filter((t) =>
      state.favorites.some((f) => f.id === t.id),
    );
  }

  if (state.filters.photoOnly) {
    filtered = filtered.filter((t) => t.picture !== null);
  }

  // Сортировка
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

// Слушатель для поиска
const searchForm = document.querySelector(".header__search");
if (searchForm) {
  const searchInput = searchForm.querySelector("input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.searchQuery = e.target.value.trim();
      applyFiltersAndSearch();
    });
  }
}

// Слушатели для фильтров
const filtersBox = document.querySelector(".filters");
if (filtersBox) {
  filtersBox.addEventListener("change", (e) => {
    const target = e.target;
    const labelText = target.parentElement.innerText;

    if (target.tagName === "SELECT") {
      if (labelText.includes("Age")) state.filters.age = target.value;
      if (labelText.includes("Region")) state.filters.region = target.value;
      if (labelText.includes("Gender")) state.filters.gender = target.value;
    }

    if (target.type === "checkbox") {
      if (labelText.includes("photo")) state.filters.photoOnly = target.checked;
      if (labelText.includes("favorites"))
        state.filters.favoriteOnly = target.checked;
    }

    applyFiltersAndSearch();
  });
}

// ==========================================================================
// 4. Сортировка таблицы статистики
// ==========================================================================

const statsTableBody = document.querySelector(".stats-table tbody");
const statsTableHead = document.querySelector(".stats-table thead");

function renderStatisticsTable(list) {
  if (!statsTableBody) return;
  statsTableBody.innerHTML = "";

  list.forEach((t) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${t.full_name}</td>
      <td>${t.course}</td>
      <td>${t.age || 30}</td>
      <td>${t.gender || "Male"}</td>
      <td>${t.country}</td>
    `;
    statsTableBody.appendChild(tr);
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
// 5. Обработка формы Add Teacher
// ==========================================================================

const addTeacherForm = document.querySelector("#modalAddTeacher .teacher-form");

if (addTeacherForm) {
  addTeacherForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.querySelector("#addName").value.trim();
    const subject = document.querySelector("#addSub").value;
    const country = document.querySelector("#addCountry").value;
    const city = document.querySelector("#addCity").value.trim();
    const email = document.querySelector("#addEmail").value.trim();
    const phone = document.querySelector("#addPhone").value.trim();
    const dob = document.querySelector("#addDob").value;
    const genderInput = addTeacherForm.querySelector(
      'input[name="Gender"]:checked',
    );
    const gender = genderInput ? genderInput.value : "male";
    const notes = document.querySelector("#addNotes").value.trim();

    let age = 30;
    if (dob) {
      const birthYear = new Date(dob).getFullYear();
      age = new Date().getFullYear() - birthYear;
    }

    const newTeacher = {
      id: Date.now().toString(),
      full_name: name,
      course: subject,
      age: age,
      gender: gender.charAt(0).toUpperCase() + gender.slice(1),
      country: country,
      city: city,
      email: email,
      phone: phone,
      b_day: dob,
      picture: null,
      note: notes,
      favorite: false,
    };

    state.teachers.unshift(newTeacher);
    applyFiltersAndSearch();

    addTeacherForm.reset();
    window.location.hash = "#";
  });
}

// Инициализация при загрузке
document.addEventListener("DOMContentLoaded", () => {
  renderFavorites();
  applyFiltersAndSearch();
});
