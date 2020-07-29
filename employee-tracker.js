const mysql = require("mysql");
const inquirer = require("inquirer");

const connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "Sequel89!",
    database: "ems_db"
});


let showRoles;
let showManagers;

// Initiate MySQL Connection
connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");

    connection.query("SELECT * FROM role", function (error, res) {
        showRoles = res.map(role => ({ name: role.title, value: role.id }))
    });

    // fix this!!!
    connection.query("SELECT * FROM employee WHERE manager_id <> ?", [null], function (error, res) {
        showManagers = res.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id }))
    });


    mainMenu();
});

function mainMenu() {
    inquirer
    .prompt(
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
            name: "Quit",
            value: "end"
          }
        ]
    }).then(function(res) {
      execute(res.choices)
    })
}

function execute(option) {
    switch (option) {
        case "viewEmp":
            viewEmp();
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
        case "end":
        connection.end();
    }
}

// Function to view all employees
function viewEmp() {

}

// Function to view all departments
function viewDept() {
    connection.query("SELECT * FROM department", function (error, res) {
        console.table(res);
        mainMenu();
    });
}

// Function to view all roles
function viewRoles() {
    connection.query("SELECT * FROM role", function (error, res) {
        console.table(res);
        mainMenu();
    });
}

// Function to add an Employee
function addEmp() {
    inquirer
      .prompt([
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
          choices: showRoles
        },
        {
          type: "list",
          name: "manager",
          message: "Who is the employee's manager?",
          choices: showManagers
        }
    ]).then(function (response) {
        // console.log(response);

        connection.query("INSERT INTO employee SET ? ",
        {
            first_name: response.firstName,
            last_name: response.lastName,
            role_id: response.role,
            manager_id: response.manager
        }, function (error, res) {
            if (error) throw error;
        });
        mainMenu();
    })
}