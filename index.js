const inquirer = require("inquirer");
const mysql = require("mysql2/promise");
const cTable = require("console.table");
require("dotenv").config();

let roles, managers, employees;
let db;

const options = {
  type: "list",
  message: "What would you like to do?",
  name: "option",
  choices: [
    "View All Employees",
    "Add Employee",
    "Update Employee Role",
    "View All Roles",
    "Add Role",
    "View All Departments",
    "Add Department",
    "Exit",
  ],
};

// given a value, searches an array of objects to determine whether that value exists within an object and returns the first one.
// meant for use where a unique value is being searched for.
function findObj(objArr, val) {
  if (!objArr || !val) return;

  for (let i = 0; i < objArr.length; i++) {
    for (let key of Object.keys(objArr[i])) {
      if (objArr[i][key] === val) return objArr[i];
    }
  }
}

async function getManagerId(managers, managerName) {
  let managerId;
  if (managerName === "Nil") {
    managerId = null;
  } else {
    const [rows, columns] = await db.execute("SELECT id from employee WHERE first_name = ? AND last_name = ?", [
      managerName.split(" ")[0],
      managerName.split(" ")[1],
    ]);
    managerId = rows[0].id;
  }

  return managerId;
}
// Checks whether or not the list of roles has been updated since last call
async function getRoles() {
  const [rows, fields] = await db.execute("SELECT * FROM role");
  roles = rows;
}

// Checks whether or not the list of managers has been updated since last call
async function getManagers() {
  const [rows, fields] = await db.execute("SELECT * FROM employee WHERE id IN (SELECT manager_id FROM employee WHERE manager_id IS NOT NULL)");
  managers = rows;
}

async function addEmployee() {
  await getRoles();
  await getManagers();

  const roleTitles = roles.map((role) => role.title);
  const managerNames = managers.map((manager) => manager.first_name + " " + manager.last_name);

  await inquirer
    .prompt([
      {
        type: "input",
        name: "firstName",
        message: "Enter employee's first name:",
      },
      {
        type: "input",
        name: "lastName",
        message: "Enter employee's last name:",
      },
      {
        type: "list",
        name: "role",
        message: "Enter employee's role:",
        choices: roleTitles,
      },
      {
        type: "list",
        name: "manager",
        message: "Enter employee's manager:",
        choices: ["Nil", ...managerNames],
      },
    ])
    .then(async (answers) => {
      // TODO convert role name to role id for adding to db
      // TODO convert manager name to role id for adding to db
      const roleId = findObj(roles, answers.role).id;

      const managerId = await getManagerId(managers, answers.manager);

      const employee = {
        firstName: answers.firstName,
        lastName: answers.lastName,
        role: roleId,
        manager: managerId,
      };

      addEmployeeToDatabase(employee);
    });
}

// TODO - finish query to obtain id, first_name, last_name, role (named title), department, salary and manager
async function viewAllEmployees() {
  const [rows, fields] = await db.execute(
    "SELECT e1.id, e1.first_name, e1.last_name, r.title, d.name AS department, r.salary, CONCAT(e2.first_name, ' ', e2.last_name) AS manager FROM employee e1 JOIN role r ON r.id = e1.role_id JOIN department d ON d.id = r.department_id LEFT JOIN employee e2 ON e1.manager_id = e2.id ORDER BY e1.id"
  );

  console.table(rows);
}
async function updateEmployeeRole() {}
async function viewAllRoles() {}
async function addRole() {}
async function viewAllDepartments() {}
async function addDepartment() {}

function addEmployeeToDatabase(employee) {
  db.execute(
    "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
    employee.firstName,
    employee.lastName,
    employee.role,
    employee.manager,
    (err, res) => {
      err ? console.log(err) : console.log(res);
    }
  );
}

async function askQuestions() {
  await inquirer.prompt(options).then(async (answers) => {
    while (answers.option !== "Exit") {
      switch (answers.option) {
        case "View All Employees":
          await viewAllEmployees();
          break;
        case "Add Employee":
          await addEmployee();
          break;
        case "Update Employee Role":
          await updateEmployeeRole();
          break;
        case "View All Roles":
          await viewAllRoles();
          break;
        case "Add Role":
          await addRole();
          break;
        case "View All Departments":
          await viewAllDepartments();
          break;
        case "Add Department":
          await addDepartment();
          break;
      }

      await askQuestions();
    }
  });
}

async function init() {
  db = await mysql.createConnection({
    host: "localhost",
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: "organisation_db",
    namedPlaceholders: true,
  });

  askQuestions();
}

init();
