DROP DATABASE IF EXISTS organisation_db;
CREATE DATABASE organisation_db;

USE organisation_db;

CREATE TABLE department(
  id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
  name VARCHAR(30) NOT NULL
  );

CREATE TABLE role(
  id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
  title VARCHAR(30) NOT NULL,
  salary DECIMAL NOT NULL,
  department_id INT,
  FOREIGN KEY(department_id)
  REFERENCES department(id)
  ON DELETE SET NULL
);

CREATE TABLE employee(
  id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
  first_name VARCHAR(30) NOT NULl,
  last_name VARCHAR(30) NOT NULl,
  role_id INT,
  manager_id INT,
  FOREIGN KEY (role_id)
  REFERENCES `role`(id)
  ON DELETE SET NULL,
  FOREIGN KEY (manager_id)
  REFERENCES employee(id)
  ON DELETE SET NULL
);