import { randomUserMock, additionalUsers } from "./FE4U-Lab2-mock.js";
import { getFormattedUsers, filterUsers, sortUsers, findUser } from "./lab2.js";

const initialTeachers = getFormattedUsers(randomUserMock, additionalUsers);

const state = {
  teachers: [...initialTeachers],
  favorites: initialTeachers.filter((t) => t.favorite),
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

function getInitials(fullName) {
  if (!fullName) return "T.N";
  const parts = fullName.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}.${parts[1][0]}`.toUpperCase();
  }
  return `${parts[0][0]}`.toUpperCase();
}

const teachersGrid = document.querySelector(".teachers-grid");
const favoritesCarousel = document.querySelector(".carousel__items");

function renderTeachers(list) {
  if (!teachersGrid) return;
  teachersGrid.innerHTML = "";

  if (list.length === 0) {
    teachersGrid.innerHTML =
      '<p style="grid-column: 1/-1; text-align: center; color: #777;">No teachers match your search.</p>';
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
      '<p style="font-size:12px; color:#888;">No favorites added yet.</p>';
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
      toggleFavorite(teacher);
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

function applyFiltersAndSearch() {
  let filtered = [...state.teachers];

  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    filtered = filtered.filter((t) => {
      const matchName = t.full_name && t.full_name.toLowerCase().includes(q);
      const matchNote = t.note && t.note.toLowerCase().includes(q);
      const matchAge = t.age && t.age.toString() === q;
      return matchName || matchNote || matchAge;
    });
  }

  const filterParams = {};
  if (state.filters.gender)
    filterParams.gender = state.filters.gender.toLowerCase();
  if (state.filters.favoriteOnly) filterParams.favorite = true;
  if (state.filters.age) {
    const [min, max] = state.filters.age.split("-").map(Number);
    filterParams.age = max ? { gte: min, lte: max } : { gte: min };
  }

  if (Object.keys(filterParams).length > 0) {
    filtered = filterUsers(filtered, filterParams);
  }

  if (state.filters.photoOnly) {
    filtered = filtered.filter((t) => t.picture !== null);
  }

  if (state.sort.field) {
    filtered = sortUsers(filtered, state.sort.field, state.sort.order);
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

    const newTeacher = {
      id: Date.now().toString(),
      full_name: name,
      course: subject,
      age: age,
      gender: sex.charAt(0).toUpperCase() + sex.slice(1),
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

document.addEventListener("DOMContentLoaded", () => {
  renderFavorites();
  applyFiltersAndSearch();
});
