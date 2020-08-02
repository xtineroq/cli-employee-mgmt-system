const mysql = require("mysql");
const inquirer = require("inquirer");
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.db_host,
    port: process.env.db_port,
    user: process.env.db_user,
    password: process.env.db_password,
    database: process.env.db_database
});

// Initiate MySQL Connection
connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");

    mainMenu();
});

let rolesList;
let managersList;
let departmentsList;
let employeesList;
let notManagersList;

// Generate correct list of data to be used for inquirer choices
function mapping() {
    connection.query("SELECT * FROM role", function(error, res) {
        rolesList = res.map(role => ({name: role.title, value: role.id}));
    });

    connection.query("SELECT * FROM employee WHERE manager_id IS NULL", function(error, res) {
        managersList = res.map(man => ({name: `${man.first_name} ${man.last_name}`, value: man.id}));
    });

    connection.query("SELECT * FROM department", function(error, res) {
        departmentsList = res.map(dept => ({name: dept.name, value: dept.id}));
    });

    connection.query("SELECT * FROM employee", function(error, res) {
        employeesList = res.map(emp => ({name: `${emp.first_name} ${emp.last_name}`, value: emp.id}));
    });

    connection.query("SELECT * FROM employee WHERE manager_id IS NOT NULL", function(error, res) {
        notManagersList = res.map(notMan => ({name: `${notMan.first_name} ${notMan.last_name}`, value: notMan.id}));
    });
}

// Main Menu of the application
function mainMenu() {
    mapping();
    inquirer.prompt(
      {
        type: "list",
        message: "What would you like to do?",
        name: "choices",
        choices: [
          {
            name: "View All Employees",
            value: "viewEmp"
          },
          {
            name: "View Employees by Manager",
            value: "viewEmpMan"
          },
          {
            name: "View All Departments",
            value: "viewDept"
          },
          {
            name: "View All Roles",
            value: "viewRoles"
          },
          {
            name: "Add an Employee",
            value: "addEmp"
          },
          {
            name: "Add a Department",
            value: "addDept"
          },
          {
            name: "Add a Role",
            value: "addRole"
          },
          {
            name: "Update Employee Role",
            value: "updateRole"
          },
          {
            name: "Update Employee Manager",
            value: "updateManager"
          },
          {
            name: "Delete a Department",
            value: "deleteDept"
          },
          {
            name: "Delete a Role",
            value: "deleteRole"
          },
          {
            name: "Delete an Employee",
            value: "deleteEmp"
          },
          {
            name: "Quit",
            value: "end"
          }
        ]
    }).then(function(res) {
      execute(res.choices)
    })
}

// Function to execute the user choice from the main menu
function execute(userChoice) {
    switch (userChoice) {
        case "viewEmp":
            viewEmp();
            break;
        case "viewEmpMan":
            viewEmpMan();
            break;
        case "viewDept":
            viewDept();
            break;
        case "viewRoles":
            viewRoles();
            break;
        case "addEmp":
            addEmp();
            break;
        case "addDept":
            addDept();
            break;
        case "addRole":
            addRole();
            break;
        case "updateRole":
            updateRole();
            break;
        case "updateManager":
            updateManager();
            break;
        case "deleteDept":
            deleteDept();
            break;
        case "deleteRole":
            deleteRole();
            break;
        case "deleteEmp":
            deleteEmp();
            break;
        case "end":
        connection.end();
    }
}

// Function to view all employees
function viewEmp() {
    connection.query(
        `
            SELECT
                employee.id AS 'Employee ID', 
                employee.first_name AS 'First Name', 
                employee.last_name AS 'Last Name', 
                role.title AS 'Position', 
                role.salary AS 'Salary', 
                department.name AS 'Department'
            FROM employee
            LEFT JOIN role
            ON employee.role_id = role.id
            LEFT JOIN department
            ON role.department_id = department.id;
        `
        , function (error, res) {
            console.table(res);
            mainMenu();
        }
    );
}

//Function to view employees by manager
function viewEmpMan() {
    inquirer.prompt([
        {
            type: 'list',
            name: "managerID",
            message: "Please select the manager of the employees you would like to view.",
            choices: managersList
        }
    ]).then(function(data) {
        let managerEmp = data.managerID;

        connection.query(
            `
                SELECT
                    emp1.id AS 'Employee ID',
                    emp1.first_name AS 'First Name',
                    emp1.last_name AS 'Last Name',
                    CONCAT(emp2.first_name, ' ', emp2.last_name) AS Manager
                FROM employee emp1
                INNER JOIN employee emp2
                ON emp1.manager_id = emp2.id
                WHERE emp2.id = ?
            `
            , [managerEmp]
            , function (error, res) {
                console.table(res);
                mainMenu();
            }
        );
    });
}

// Function to view all departments
function viewDept() {
    connection.query(
        `
            SELECT 
                department.name AS 'Department'
            FROM department
        `
        , function (error, res) {
            console.table(res);
            mainMenu();
        }
    );
}

// Function to view all roles
function viewRoles() {
    connection.query(
        `
            SELECT 
                role.title AS 'Position', 
                role.salary AS 'Salary', 
                department.name AS 'Department' 
            FROM role 
            LEFT JOIN department
            ON role.department_id = department.id;
        `
        , function (error, res) {
        console.table(res);
        mainMenu();
        }
    );
}

// Function to add an Employee
function addEmp() {
    inquirer.prompt([
        {
            type: 'input',
            name: "firstName",
            message: "What is the employee's first name?"
        },
        {
            type: "input",
            name: "lastName",
            message: "What is the employee's last name?"
        },
        {
            type: "list",
            name: "role",
            message: "What is the employee's role?",
            choices: rolesList
        },
        {
            type: "list",
            name: "isManager",
            message: "Is this employee a Manager?",
            choices: ["YES", "NO"]
        },
        {
            type: "list",
            name: "manager",
            message: "Who is the employee's manager?",
            choices: managersList,
            when: (answer) => answer.isManager === "NO"
        }
    ]).then(function(data) {
        connection.query("INSERT INTO employee SET ? ",
        {
            first_name: data.firstName,
            last_name: data.lastName,
            role_id: data.role,
            manager_id: data.manager
        }, function (error, res) {
            if (error) throw error;
        });
        console.log("================================");
        console.log("New Employee Successfully Added!");
        console.log("================================");
        mainMenu();
    });
}

// Function to add a department
function addDept() {
    inquirer.prompt([
        {
            type: 'input',
            name: "deptName",
            message: "Please enter the name of the new department you would like to add."
        }
    ]).then(function(data) {
        connection.query("INSERT INTO department SET ?",
        {
            name: data.deptName
        }, function (error, res) {
            if (error) throw error;
        });
        console.log("==================================");
        console.log("New Department Successfully Added!");
        console.log("==================================");
        mainMenu();
    });
}

// Function to add a role
function addRole() {
    inquirer.prompt([
        {
            type: 'input',
            name: "roleName",
            message: "What is the new role you would like to add?"
        },
        {
            type: 'input',
            name: "roleSalary",
            message: "How much is the salary for this new role?"
        },
        {
            type: 'list',
            name: "roleDept",
            message: "Which department does this new role belongs to?",
            choices: departmentsList
        }
    ]).then(function(data) {
        connection.query("INSERT INTO role SET ? ",
        {
            title: data.roleName,
            salary: data.roleSalary,
            department_id: data.roleDept
        }, function (error, res) {
            if (error) throw error;
        });
        console.log("============================");
        console.log("New Role Successfully Added!");
        console.log("============================");
        mainMenu();
    });
}

// Function to update employee role
function updateRole() {
    inquirer.prompt([
        {
            type: "list",
            name: "updateEmp",
            message: "Select the employee you would like to update the role of.",
            choices: employeesList
        },
        {
            type: "list",
            name: "newRole",
            message: "What is the employee's new role?",
            choices: rolesList
        }
    ]).then(function(data) {
        let dataA = data.updateEmp;
        let dataB = data.newRole;

        connection.query("UPDATE employee SET role_id = ? WHERE id = ? ", 
        [dataB, dataA],
        function (error, res) {
            if (error) throw error;
        });

        console.log("===================================");
        console.log("Employee Role Successfully Updated!");
        console.log("===================================");
        mainMenu();
    });
}

// Function to update employee manager
function updateManager() {
    inquirer.prompt([
        {
            type: "list",
            name: "updateEmp",
            message: "Select the employee you would like to update the manager of.",
            choices: notManagersList
        },
        {
            type: "list",
            name: "newManager",
            message: "Who is the employee's new manager?",
            choices: managersList
        }
    ]).then(function(data) {
        let dataA = data.updateEmp;
        let dataB = data.newManager;

        connection.query("UPDATE employee SET manager_id = ? WHERE id = ? ", 
        [dataB, dataA],
        function (error, res) {
            if (error) throw error;
        });

        console.log("======================================");
        console.log("Employee Manager Successfully Updated!");
        console.log("======================================");
        mainMenu();
    });
}

// Function to delete a department
function deleteDept() {
    inquirer.prompt([
        {
            type: "list",
            name: "delDept",
            message: "Which department would you like to delete?",
            choices: departmentsList
        }
    ]).then(function(data) {
        let userChoice = data.delDept;

        connection.query("DELETE FROM department WHERE id = ? "
        , [userChoice]
        , function (error, res) {
            if (error) throw error;
        });

        console.log("================================");
        console.log("Department Successfully Deleted!");
        console.log("================================");
        mainMenu();
    });
}

// Function to delete a role
function deleteRole() {
    inquirer.prompt([
        {
            type: "list",
            name: "delRole",
            message: "Which employee role would you like to delete?",
            choices: rolesList
        }
    ]).then(function(data) {
        let userChoice = data.delRole;

        connection.query("DELETE FROM role WHERE id = ? "
        , [userChoice]
        , function (error, res) {
            if (error) throw error;
        });

        console.log("==========================");
        console.log("Role Successfully Deleted!");
        console.log("==========================");
        mainMenu();
    });
}

// Function to delete an employee
function deleteEmp() {
    inquirer.prompt([
        {
            type: "list",
            name: "delEmp",
            message: "Which specific employee would you like to delete?",
            choices: employeesList
        }
    ]).then(function(data) {
        let userChoice = data.delEmp;

        connection.query("DELETE FROM employee WHERE id = ? "
        , [userChoice]
        , function (error, res) {
            if (error) throw error;
        });

        console.log("==============================");
        console.log("Employee Successfully Deleted!");
        console.log("==============================");
        mainMenu();
    });
}