INSERT INTO department (name)
VALUES ("Sales"), ("Engineering"), ("Finance"), ("Legal");

---------------------------------------------

INSERT INTO role (title, salary, department_id)
VALUES ("Sales Lead", 80000, 1),
    ("Salesperson", 50000, 1),
    ("Lead Engineer", 150000, 2),
    ("Software Engineer", 120000, 2),
    ("Finance Manager", 100000, 3),
    ("Accountant", 70000, 3),
    ("Legal Team Lead", 180000, 4),
    ("Lawyer", 150000, 4);

---------------------------------------------

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("John", "Doe", 1, null),
    ("Adam", "Lane", 2, 1),
    ("Sarah", "Jones", 3, null),
    ("Andrew", "Lynch", 4, 3),
    ("Melanie", "Matthews", 5, null),
    ("Joanna", "Brown", 6, 5),
    ("Thomas", "White", 7, null),
    ("Charles", "Cruz", 8, 7);
    