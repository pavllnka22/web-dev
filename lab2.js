const COURSES = [
  "Mathematics",
  "Physics",
  "English",
  "Computer Science",
  "Dancing",
  "Chess",
  "Biology",
  "Chemistry",
  "Law",
  "Art",
  "Medicine",
  "Statistics",
];

const SORTABLE_FIELDS = ["full_name", "age", "b_day", "country"];

const PHONE_FORMATS = {
  Germany: /^\d{4}-\d{7}$/,
  Ireland: /^\d{3}-\d{3}-\d{4}$/,
  Australia: /^\d{2}-\d{4}-\d{4}$/,
  "United States": /^\(\d{3}\)-\d{3}-\d{4}$/,
  Finland: /^\d{2}-\d{3}-\d{3}$/,
  Turkey: /^\(\d{3}\)-\d{3}-\d{4}$/,
  Switzerland: /^\d{3} \d{3} \d{2} \d{2}$/,
  "New Zealand": /^\(\d{3}\)-\d{3}-\d{4}$/,
  Spain: /^\d{3}-\d{3}-\d{3}$/,
  Norway: /^\d{8}$/,
  Denmark: /^\d{8}$/,
  Iran: /^\d{3}-\d{8}$/,
  Canada: /^\d{3}-\d{3}-\d{4}$/,
  France: /^\d{2}(-\d{2}){4}$/,
  Netherlands: /^\(\d{3}\)-\d{3}-\d{4}$/,
};

const DEFAULT_PHONE_FORMAT = /^\+?[\d\s()-]{6,20}$/;

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isPresent = (value) => value !== null && value !== undefined;

const getRandomItem = (items) =>
  items[Math.floor(Math.random() * items.length)];

const getRandomColor = () =>
  `#${Math.floor(Math.random() * 0x1000000)
    .toString(16)
    .padStart(6, "0")}`;

const generateId = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

const capitalize = (value) =>
  typeof value === "string" && value.length > 0
    ? value[0].toUpperCase() + value.slice(1)
    : null;

const calculateAge = (dateString) => {
  if (!dateString) return null;

  const birthDate = new Date(dateString);
  if (Number.isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const hadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() >= birthDate.getDate());

  if (!hadBirthdayThisYear) age -= 1;
  return age;
};

const normalizeCourse = (course) => {
  if (typeof course === "string") {
    const knownCourse = COURSES.find(
      (item) => item.toLowerCase() === course.trim().toLowerCase(),
    );
    if (knownCourse) return knownCourse;
  }
  return getRandomItem(COURSES);
};

const getUserKey = (user) =>
  (user.full_name || user.email || user.id || "").trim().toLowerCase();

//values from `extra` overwrite values from `base` only when they are present
const mergeUsers = (base, extra) => {
  const merged = { ...base };
  Object.entries(extra).forEach(([key, value]) => {
    if (isPresent(value) && value !== "") merged[key] = value;
  });
  return merged;
};

// Task 1

const fromRandomUser = (user) => {
  const { name = {}, location = {}, dob = {}, picture = {}, id = {} } = user;

  return {
    gender: user.gender,
    title: name.title,
    full_name: [name.first, name.last].filter(Boolean).join(" "),
    city: location.city,
    state: location.state,
    country: location.country,
    postcode: location.postcode,
    coordinates: location.coordinates,
    timezone: location.timezone,
    email: user.email,
    b_day: dob.date,
    age: dob.age,
    phone: user.phone,
    picture_large: picture.large,
    picture_thumbnail: picture.thumbnail,
    id: id.value ? `${id.name}${id.value}` : user.login?.uuid,
  };
};

const toFlatUser = (user) =>
  typeof user.name === "object" ? fromRandomUser(user) : { ...user };

const formatUser = (user) => {
  const source = toFlatUser(user);
  const b_day = source.b_day ?? source.b_date ?? null;

  return {
    gender: capitalize(source.gender),
    title: source.title ?? null,
    full_name: source.full_name ?? null,
    city: source.city ?? null,
    state: source.state ?? null,
    country: source.country ?? null,
    postcode: source.postcode ?? null,
    coordinates: source.coordinates ?? null,
    timezone: source.timezone ?? null,
    email: source.email ?? null,
    b_day,
    age: typeof source.age === "number" ? source.age : calculateAge(b_day),
    phone: source.phone ?? null,
    picture_large: source.picture_large ?? null,
    picture_thumbnail: source.picture_thumbnail ?? null,
    id: source.id ? String(source.id) : generateId(),
    favorite: Boolean(source.favorite),
    course: normalizeCourse(source.course),
    bg_color: source.bg_color || getRandomColor(),
    note: typeof source.note === "string" ? source.note : "",
  };
};
const getFormattedUsers = (randomUsers = [], additionalUsers = []) => {
  const usersByKey = new Map();

  [...randomUsers, ...additionalUsers].forEach((rawUser) => {
    const user = toFlatUser(rawUser);
    const key = getUserKey(user);
    const existing = usersByKey.get(key);

    usersByKey.set(key, existing ? mergeUsers(existing, user) : user);
  });

  return [...usersByKey.values()].map(formatUser);
};

// Task 2

const startsWithCapital = (value) =>
  typeof value === "string" && /^\p{Lu}/u.test(value);

const isValidPhone = (phone, country) => {
  if (typeof phone !== "string") return false;
  const format = PHONE_FORMATS[country] ?? DEFAULT_PHONE_FORMAT;
  return format.test(phone);
};

const isValidEmail = (email) =>
  typeof email === "string" && EMAIL_FORMAT.test(email);

const validateUser = (user) => {
  const errors = [];
  const capitalizedFields = ["full_name", "gender", "state", "city", "country"];

  capitalizedFields.forEach((field) => {
    if (!startsWithCapital(user[field])) {
      errors.push(`${field} must be a string starting with a capital letter`);
    }
  });

  if (user.note !== "" && !startsWithCapital(user.note)) {
    errors.push("note must be a string starting with a capital letter");
  }

  if (typeof user.age !== "number" || Number.isNaN(user.age)) {
    errors.push("age must be a number");
  }

  if (!isValidPhone(user.phone, user.country)) {
    errors.push(`phone does not match the format for ${user.country}`);
  }

  if (!isValidEmail(user.email)) {
    errors.push("email has an invalid format");
  }

  return { isValid: errors.length === 0, errors };
};

const isValidUser = (user) => validateUser(user).isValid;

// Task 3

// condition: a number (exact match) or an object { gt, gte, lt, lte }
const matchesNumber = (value, condition) => {
  if (typeof value !== "number") return false;
  if (typeof condition === "number") return value === condition;

  const { gt, gte, lt, lte } = condition;
  return (
    (gt === undefined || value > gt) &&
    (gte === undefined || value >= gte) &&
    (lt === undefined || value < lt) &&
    (lte === undefined || value <= lte)
  );
};

const equalsIgnoreCase = (a, b) =>
  typeof a === "string" &&
  typeof b === "string" &&
  a.toLowerCase() === b.toLowerCase();

const filterUsers = (users, { country, age, gender, favorite } = {}) =>
  users.filter(
    (user) =>
      (country === undefined || equalsIgnoreCase(user.country, country)) &&
      (age === undefined || matchesNumber(user.age, age)) &&
      (gender === undefined || equalsIgnoreCase(user.gender, gender)) &&
      (favorite === undefined || user.favorite === favorite),
  );

// Task 4

const compareValues = (a, b, field) => {
  if (field === "b_day") return new Date(a) - new Date(b);
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
};

const sortUsers = (users, field, order = "asc") => {
  if (!SORTABLE_FIELDS.includes(field)) {
    throw new Error(`Cannot sort by "${field}"`);
  }

  const direction = order === "desc" ? -1 : 1;

  return [...users].sort((a, b) => {
    const first = a[field];
    const second = b[field];

    if (!isPresent(first) && !isPresent(second)) return 0;
    if (!isPresent(first)) return 1;
    if (!isPresent(second)) return -1;

    return compareValues(first, second, field) * direction;
  });
};

//Task 5

const includesIgnoreCase = (text, query) =>
  typeof text === "string" && text.toLowerCase().includes(query.toLowerCase());

const matchesSearch = (user, { name, note, age } = {}) =>
  (name === undefined || includesIgnoreCase(user.full_name, name)) &&
  (note === undefined || includesIgnoreCase(user.note, note)) &&
  (age === undefined || matchesNumber(user.age, age));

const findUser = (users, params) =>
  users.find((user) => matchesSearch(user, params)) ?? null;

// Task 6

const getSearchPercentage = (users, params) => {
  if (users.length === 0) return 0;

  const matched = users.filter((user) => matchesSearch(user, params)).length;
  return Math.round((matched / users.length) * 10000) / 100;
};
