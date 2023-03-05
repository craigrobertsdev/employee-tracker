const mysql = require("mysql2/promise");

class MySqlConnection {
  db;
  constructor() {}

  async addEmployeeToDatabase(firstName, lastName, roleId, managerId) {
    await this.db.execute(
      "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
      firstName,
      lastName,
      roleId,
      managerId
    );
  }

  // returns the first name, last name, role (title), department name, salary and manager name for each employee.
  async getAllEmployees() {
    const [rows] = await this.db.execute(
      "SELECT e1.id, e1.first_name, e1.last_name, r.title, d.name AS department, r.salary, CONCAT(e2.first_name, ' ', e2.last_name) AS manager FROM employee e1 JOIN role r ON r.id = e1.role_id JOIN department d ON d.id = r.department_id LEFT JOIN employee e2 ON e1.manager_id = e2.id ORDER BY e1.id"
    );

    return rows;
  }

  async getEmployeeIdByName(firstName, lastName) {
    const [rows] = await this.db.execute("SELECT id from employee WHERE first_name = ? AND last_name = ?", [firstName, lastName]);

    return rows[0].id;
  }

  async getManagers() {
    const [rows] = await this.db.execute("SELECT * FROM employee WHERE id IN (SELECT manager_id FROM employee WHERE manager_id IS NOT NULL)");
    return rows;
  }

  async getRoles() {
    const [rows] = await this.db.execute("SELECT id, title, department_id AS department, salary FROM role");

    return rows;
  }

  async getDepartments() {
    const [rows] = await this.db.execute("SELECT * FROM department");

    return rows;
  }

  async addDepartment(name) {
    console.log("Adding department named: " + name);
    console.log(typeof name);
    const [rows] = await this.db.execute("INSERT INTO department (name) VALUES (?)", [name]);
    return rows;
  }

  async initaliseDbConnection() {
    this.db = await mysql.createConnection({
      host: "localhost",
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: "organisation_db",
      namedPlaceholders: true,
    });
  }
}

module.exports = MySqlConnection;
