const inquirer = require("inquirer");
const cTable = require("console.table");
require("dotenv").config();
const MySqlConnection = require("./db/queries");

const db = new MySqlConnection();

let roles, managers, employees;

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

async function getManagerId(managerName) {
  managerName === "Nil" ? null : await db.getEmployeeIdByName(managerName.split(" ")[0], managerName.split(" ")[1]);
}
// Checks whether or not the list of roles has been updated since last call
async function getRoles() {
  return await db.getRoles();
}

// Checks whether or not the list of managers has been updated since last call
async function getManagers() {
  return await db.getManagers();
}

async function addEmployee() {
  roles = await getRoles();
  managers = await getManagers();

  const roleTitles = roles.map((role) => role.title);
  const managerNames = managers.map((manager) => manager.first_name + " " + manager.last_name);

  const answers = await inquirer.prompt([
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
  ]);

  const roleId = findObj(roles, answers.role).id;

  const managerId = await getManagerId(answers.manager);

  const employee = {
    firstName: answers.firstName,
    lastName: answers.lastName,
    role: roleId,
    manager: managerId,
  };

  addEmployeeToDatabase(employee);
}

async function viewAllEmployees() {
  const rows = await db.getAllEmployees();
  console.table(rows);
}

async function updateEmployeeRole() {}

async function viewAllRoles() {
  roles = await db.getRoles();

  console.table(roles);
}

async function addRole() {}

async function viewAllDepartments() {
  const departments = await db.getDepartments();

  console.table(departments);
}

async function addDepartment() {
  const departments = await db.getDepartments();

  const answer = await inquirer.prompt({
    type: "input",
    name: "departmentName",
    message: "Enter department name: ",
  });
  // check whether the department has already been created
  departments.forEach((department) => {
    if (department.name === answer.departmentName) {
      console.log("Department already exists!");
      return;
    }
  });

  await db.addDepartment(answer.departmentName);
}

function addEmployeeToDatabase(employee) {
  db.addEmployeeToDatabase(employee.firstName, employee.lastName, employee.role, employee.manager);
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
  await db.initaliseDbConnection();
  askQuestions();
}

init();
