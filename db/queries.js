const mysql = require("mysql2/promise");

class MySqlConnection {
  db;
  constructor() {}

  async initaliseDbConnection() {
    this.db = await mysql.createConnection({
      host: "localhost",
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: "organisation_db",
      namedPlaceholders: true,
    });
  }

  // #region CREATE

  async addEmployeeToDatabase(firstName, lastName, roleId, managerFirst, managerLast) {
    await this.db.execute(
      "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, (SELECT id FROM employee e2 WHERE e2.first_name = ? AND e2.last_name = ?))",
      [firstName, lastName, roleId, managerFirst ? managerFirst : null, managerLast ? managerLast : null]
    );
  }

  async addRole(title, salary, department) {
    await this.db.execute("INSERT INTO role (title, salary, department_id) VALUES (?, ?, (SELECT id FROM department WHERE department.name = ?))", [
      title,
      salary,
      department,
    ]);
  }

  async addDepartment(name) {
    await this.db.execute("INSERT INTO department (name) VALUES (?)", [name]);
  }

  //#endregion

  //#region READ

  // returns the first name, last name, role (title), department name, salary and manager name for each employee.
  async getAllEmployees() {
    const [rows] = await this.db.execute(
      "SELECT e1.id, e1.first_name, e1.last_name, r.title, d.name AS department, r.salary, CONCAT(e2.first_name, ' ', e2.last_name) AS manager FROM employee e1 JOIN role r ON r.id = e1.role_id JOIN department d ON d.id = r.department_id LEFT JOIN employee e2 ON e1.manager_id = e2.id ORDER BY e1.id"
    );

    return rows;
  }

  // Gets all employees whose ID appears in the manager_id field of any other employee
  async getManagers() {
    const [rows] = await this.db.execute("SELECT * FROM employee WHERE id IN (SELECT manager_id FROM employee WHERE manager_id IS NOT NULL)");

    return rows;
  }

  async getRoles() {
    const [rows] = await this.db.execute("SELECT id, title, department_id AS department, salary FROM role");

    return rows;
  }

  async getEmployeesByManagerId(managerId) {
    const [rows] = await this.db.execute("SELECT first_name, last_name FROM employee WHERE manager_id = ?", [managerId]);

    return rows;
  }

  async getBudgetByDepartment(departmentId) {
    const [rows] = await this.db.execute("SELECT SUM(salary) as department_budget FROM role WHERE department_id=?", [departmentId]);

    return rows;
  }

  async getDepartments() {
    const [rows] = await this.db.execute("SELECT * FROM department");

    return rows;
  }

  //#endregion

  //#region UPDATE

  async updateEmployeeRole(role, id) {
    await this.db.execute("UPDATE employee SET role_id = (SELECT id FROM role WHERE role.title = ?) WHERE employee.id = ?", [role, id]);
  }

  async updateEmployeesManager(employeeId, managerId) {
    await this.db.execute("UPDATE employee SET manager_id = ? where id = ?", [managerId, employeeId]);
  }

  //#endregion

  //#region DELETE

  async deleteEmployee(employeeId) {
    await this.db.execute("DELETE FROM employee WHERE id = ?", [employeeId]);
  }

  async deleteRole(roleId) {
    await this.db.execute("DELETE FROM role WHERE id = ?", [roleId]);
  }

  async deleteDepartment(departmentId) {
    await this.db.execute("DELETE FROM department WHERE id = ?", [departmentId]);
  }

  //#endregion
}

module.exports = MySqlConnection;
