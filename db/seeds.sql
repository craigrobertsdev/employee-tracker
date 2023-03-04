INSERT INTO department (name)
VALUES
("Engineering"),
("Sales"),
("Management");

INSERT INTO role (id, title, salary, department_id)
VALUES
(1, "Engineering Team Lead", 170000, 1),
(2, "Software Engineer", 130000, 1),
(3, "Tester", 100000, 1),
(4, "Sales Manager", 120000, 2),
(5, "Sales Person", 90000, 2),
(6, "Marketing Manager", 120000, 3),
(7, "Digital Designer", 90000, 3);

INSERT INTO employee(id, first_name, last_name, role_id, manager_id)
VALUES
(1, "Fred", "Smith", 1, NULL),
(2, "Craig", "Roberts", 2, 1),
(3, "Jo", "Dawson", 4, NULL),
(4, "Alby", "Willis", 5, 3),
(5, "James", "Allen", 6, NULL),
(6, "Dawn", "Everett", 7, 5);