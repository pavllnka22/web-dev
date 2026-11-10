import { randomUserMock, additionalUsers } from "./FE4U-Lab2-mock.js";
import {
  getFormattedUsers,
  validateUser,
  filterUsers,
  sortUsers,
  findUser,
  getSearchPercentage,
} from "./lab2.js";

const printTitle = (title) => console.log(`\n ${title}`);

const shortView = ({ full_name, gender, age, country, favorite, b_day }) => ({
  full_name,
  gender,
  age,
  country,
  favorite,
  b_day: b_day ? b_day.slice(0, 10) : null,
});

// Task 1
const users = getFormattedUsers(randomUserMock, additionalUsers);
printTitle("Task 1. Formatted users");
console.log(
  `Input: ${randomUserMock.length} + ${additionalUsers.length} users, ` +
    `after removing duplicates: ${users.length}`,
);
console.log(users[0]);
console.log(users.find((user) => user.full_name === "Olivia Storm"));

// Task 2
printTitle("Task 2. Validation");
const validationResults = users.map((user) => ({
  user,
  ...validateUser(user),
}));
const validCount = validationResults.filter((result) => result.isValid).length;
console.log(`Valid users: ${validCount} of ${users.length}`);
validationResults
  .filter((result) => !result.isValid)
  .forEach(({ user, errors }) => {
    console.log(`${user.full_name}: ${errors.join("; ")}`);
  });

// Task 3
printTitle("Task 3. Filter: country = Norway, gender = male");
console.table(
  filterUsers(users, { country: "Norway", gender: "male" }).map(shortView),
);

printTitle("Task 3. Filter: age 30..50, gender = female, favorite = false");
console.table(
  filterUsers(users, {
    age: { gte: 30, lte: 50 },
    gender: "female",
    favorite: false,
  }).map(shortView),
);

// Task 4
printTitle("Task 4. Sort by age (desc), first 5");
console.table(sortUsers(users, "age", "desc").slice(0, 5).map(shortView));

printTitle("Task 4. Sort by full_name (asc), first 5");
console.table(sortUsers(users, "full_name").slice(0, 5).map(shortView));

printTitle("Task 4. Sort by b_day (asc), first 5");
console.table(sortUsers(users, "b_day").slice(0, 5).map(shortView));

// Task 5
printTitle("Task 5. Search");
console.log("name = 'payne':", shortView(findUser(users, { name: "payne" })));
console.log("note = 'cats':", findUser(users, { note: "cats" })?.full_name);
console.log("age = 65:", findUser(users, { age: 65 })?.full_name);
console.log("name = 'nobody':", findUser(users, { name: "nobody" }));

// Task 6
printTitle("Task 6. Percentage");
console.log(
  `Users older than 30: ${getSearchPercentage(users, { age: { gt: 30 } })}%`,
);
console.log(
  `Users younger than 40: ${getSearchPercentage(users, { age: { lt: 40 } })}%`,
);
console.log(
  `Users with 'an' in name: ${getSearchPercentage(users, { name: "an" })}%`,
);
