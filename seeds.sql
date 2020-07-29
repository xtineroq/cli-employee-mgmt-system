INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("John", "Doe", 1, null),
    ("Adam", "Lane", 1, 1),
    ("Sarah", "Jones", 2, null),
    ("Andrew", "Lynch", 2, 2),
    ("Melanie", "Matthews", 3, null),
    ("Joanna", "Brown", 3, 3),
    ("Thomas", "White", 4, null),
    ("Charles", "Cruz", 4, 4);

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

INSERT INTO department (name)
VALUES ("Sales"), ("Engineering"), ("Finance"), ("Legal");