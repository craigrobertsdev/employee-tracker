const inquirer = require("inquirer");
const cTable = require("console.table");
require("dotenv").config();
const MySqlConnection = require("./db/MySQLConnection");
const validation = require("./validation");

// Create db context for use throughout the app
const db = new MySqlConnection();

const options = {
  type: "list",
  message: "What would you like to do?",
  name: "option",
  choices: [
    "View All Employees",
    "View Employees by Manager",
    "Add Employee",
    "Delete Employee",
    "Update Employee Role",
    "Update Employee's Manager",
    "View All Roles",
    "Add Role",
    "Delete Role",
    "View All Departments",
    "Add Department",
    "Delete Department",
    "View Budget By Department",
    "Exit",
  ],
};

// #region CREATE functions
async function addEmployee() {
  const roles = await getRoles();
  const managers = await getManagers();

  const roleTitles = roles.map((role) => role.title);
  const managerNames = getEmployeeNames(managers);

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

  const { firstName, lastName, role, manager } = answers;

  const roleId = findObjInArr(roles, role).id;

  await db.addEmployeeToDatabase(firstName, lastName, roleId, manager.split(" ")[0], manager.split(" ")[1]);
}

async function addDepartment() {
  const departments = await db.getDepartments();

  const answer = await inquirer.prompt({
    type: "input",
    name: "departmentName",
    message: "Enter department name: ",
  });

  // check whether the department has already been created
  if (validation.validateNewDepartment(departments, answer.departmentName)) {
    console.log("That department already exists!");
    return;
  }

  await db.addDepartment(answer.departmentName);
}

async function addRole() {
  const roles = await db.getRoles();
  const departments = await db.getDepartments();

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "role",
      message: "Enter the new role name:",
    },
    {
      type: "input",
      name: "salary",
      message: "Enter the salary for the role: ",
    },
    {
      type: "list",
      name: "department",
      message: "What department does this role belong to?",
      choices: departments,
    },
  ]);

  // Check if the role has already been created
  if (validation.validateNewRole(roles, answers.role)) {
    console.log("That role already exists!");
    return;
  }
  await db.addRole(answers.role, answers.salary, answers.department);
}

//#endregion

//#region  READ functions
async function viewAllRoles() {
  const roles = await db.getRoles();

  console.table(roles);
}

async function viewAllDepartments() {
  const departments = await db.getDepartments();

  console.table(departments);
}

async function viewAllEmployees() {
  const rows = await db.getAllEmployees();
  console.table(rows);
}

async function viewEmployeesByManager() {
  const managers = await db.getManagers();

  const managerNames = getEmployeeNames(managers);

  const answer = await inquirer.prompt({
    type: "list",
    name: "manager",
    message: "Select manager whose team members you want to see:",
    choices: managerNames,
  });

  const id = getEmployeeId(managers, answer.manager);

  const rows = await db.getEmployeesByManagerId(id);

  console.table(rows);
}

async function viewBudgetByDepartment() {
  const departments = await db.getDepartments();

  const departmentNames = getDepartments(departments);

  const answer = await inquirer.prompt({
    type: "list",
    name: "department",
    message: "Select the department whose budget you want to view:",
    choices: departmentNames,
  });

  const departmentId = departments.find((department) => department.name === answer.department).id;

  const rows = await db.getBudgetByDepartment(departmentId);

  console.table(rows);
}

// Checks whether or not the list of roles has been updated since last call
async function getRoles() {
  return await db.getRoles();
}

// Checks whether or not the list of managers has been updated since last call
async function getManagers() {
  return await db.getManagers();
}

//#endregion

// #region UPDATE functions
async function updateEmployeeRole() {
  const employees = await db.getAllEmployees();
  const employeeNames = getEmployeeNames(employees);

  const roles = await db.getRoles();
  const roleNames = getRoleNames(roles);

  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "employee",
      message: "Which employee's role do you want to update?",
      choices: employeeNames,
    },
    {
      type: "list",
      name: "newRole",
      message: "Which role do you want to assign the selected employee?",
      choices: roleNames,
    },
  ]);

  // Get the id from the employees array based on the selected name.
  const id = getEmployeeId(employees, answers.employee);

  await db.updateEmployeeRole(answers.newRole, id);
}

async function updateEmployeesManager() {
  const employees = await db.getAllEmployees();
  const managers = await db.getManagers();

  const employeeNames = getEmployeeNames(employees);

  let answer = await inquirer.prompt({
    type: "list",
    name: "employee",
    message: "Select the employee whose manager you want to update:",
    choices: employeeNames,
  });

  const employeeId = getEmployeeId(employees, answer.employee);

  let managerNames = getEmployeeNames(managers);
  managerNames = managerNames.filter((manager) => {
    return manager !== answer.employee;
  });

  answer = await inquirer.prompt({
    type: "list",
    name: "manager",
    message: "Select the employee's new manager:",
    choices: ["Nil", ...managerNames],
  });

  if (answer.manager === "Nil") {
    await db.updateEmployeesManager(employeeId, null);
    return;
  }

  const managerId = getEmployeeId(managers, answer.manager);

  await db.updateEmployeesManager(employeeId, managerId);
}

//#endregion

//#region DELETE functions

async function deleteEmployee() {
  const employees = await db.getAllEmployees();
  const employeeNames = getEmployeeNames(employees);

  answer = await inquirer.prompt({
    type: "list",
    name: "employee",
    message: "Select the employee to delete:",
    choices: employeeNames,
  });

  const employeeId = getEmployeeId(employees, answer.employee);

  await db.deleteEmployee(employeeId);
}

async function deleteRole() {
  const roles = await db.getRoles();
  const roleNames = getRoleNames(roles);

  answer = await inquirer.prompt({
    type: "list",
    name: "role",
    message: "Select the role to delete:",
    choices: roleNames,
  });

  const roleId = findObjInArr(roles, answer.role).id;

  await db.deleteRole(roleId);
}

async function deleteDepartment() {
  const departments = await db.getDepartments();
  const departmentNames = getDepartments(departments);

  answer = await inquirer.prompt({
    type: "list",
    name: "department",
    message: "Select the department to delete:",
    choices: departmentNames,
  });

  const departmentId = findObjInArr(departments, answer.department).id;
  await db.deleteDepartment(departmentId);
}

//#endregion

// #region Helper Functions

// given a value, searches an array of objects to determine whether that value exists within an object and returns the first one.
// meant for use where a unique value is being searched for.
function findObjInArr(objArr, val) {
  if (!objArr || !val) return;

  for (let i = 0; i < objArr.length; i++) {
    for (let key of Object.keys(objArr[i])) {
      if (objArr[i][key] === val) return objArr[i];
    }
  }
}
// given a list of objects with the properties first_name and last_name, returns an array of full names
function getEmployeeNames(employees) {
  return employees.map((employee) => `${employee.first_name} ${employee.last_name}`);
}

// given an array and a full name string, returns the object that contains the name provided
function getEmployeeId(employeesArr, employeeName) {
  return employeesArr.find((employee) => {
    if (employee.first_name === employeeName.split(" ")[0] && employee.last_name === employeeName.split(" ")[1]) {
      return employee;
    }
  }).id;
}

// takes a list of roles, returns a list of their titles
function getRoleNames(roles) {
  return roles.map((role) => role.title);
}

// takes a list of departments, returns a list of their names
function getDepartments(departments) {
  return departments.map((department) => department.name);
}

//#endregion

// Application loop
async function askQuestions() {
  await inquirer.prompt(options).then(async (answers) => {
    while (true) {
      switch (answers.option) {
        case "View All Employees":
          await viewAllEmployees();
          break;
        case "View Employees by Manager":
          await viewEmployeesByManager();
          break;
        case "Add Employee":
          await addEmployee();
          break;
        case "Delete Employee":
          await deleteEmployee();
          break;
        case "Update Employee Role":
          await updateEmployeeRole();
          break;
        case "Update Employee's Manager":
          await updateEmployeesManager();
          break;
        case "View All Roles":
          await viewAllRoles();
          break;
        case "Add Role":
          await addRole();
          break;
        case "Delete Role":
          await deleteRole();
          break;
        case "View All Departments":
          await viewAllDepartments();
          break;
        case "Add Department":
          await addDepartment();
          break;
        case "Delete Department":
          await deleteDepartment();
          break;
        case "View Budget By Department":
          await viewBudgetByDepartment();
          break;
        case "Exit":
          process.exit(0);
      }

      await askQuestions();
    }
  });
}

// Creates DB connection using enviroment variables then starts the app loop
async function init() {
  await db.initaliseDbConnection();
  askQuestions();
}

init();
