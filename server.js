const inquirer = require("inquirer");
const mysql = require('mysql2');
const cTable = require('console.table');
const dotenv = require('dotenv').config();

const PORT = process.env.PORT || 3001;

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;

const database = mysql.createConnection(
  {
    host: PORT,
    user: dbUser,
    password: dbPassword,
    database: dbName,
  },
  console.log(`Connected to the ${dbName} database.`)
);

database.connect((err) => {
  if (err) throw err;
  start();
});

function start() {
  inquirer
    .prompt({
      name: 'action',
      type: 'list',
      message: 'What would you like to do?',
      choices: [
        'View all departments',
        'View all roles',
        'View all employees',
        'Add a department',
        'Add a role',
        'Add an employee',
        'Update an employee role',
        'Exit',
      ],
    })
    .then((answer) => {
      switch (answer.action) {
        case 'View all departments':
          viewDepartments();
          break;

        case 'View all roles':
          viewRoles();
          break;

        case 'View all employees':
          viewEmployees();
          break;

        case 'Add a department':
          addDepartment();
          break;

        case 'Add a role':
          addRole();
          break;

        case 'View Data':
          viewData();
          break;

        case 'Add an employee':
          addEmployee();
          break;

        case 'Update an employee role':
          updateEmployee();
          break;
        case 'Delete a department':
            deleteDepartment();
            break;
        case 'Add a role':
            deleteEmployee();
            break;

        case 'Exit':
          database.end();
          break;

        default:
          console.log(`Invalid action: ${answer.action}`);
          break;
      }
    });
}


function viewDepartments() {
  const query = 'SELECT * FROM department';
  database.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    
    start();
  });
}


function viewRoles() {
  const query = 'SELECT role.id, role.title, department.name AS department, role.salary FROM role JOIN department ON role.department_id = department.id';
  database.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    
    start();
  });
}


function viewEmployees() {
  const query = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager 
                 FROM employee 
                 JOIN role ON employee.role_id = role.id 
                 JOIN department ON role.department_id = department.id 
                 LEFT JOIN employee manager ON employee.manager_id = manager.id`;
  database.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    
    start();
  });
}


function addDepartment() {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'name',
        message: 'What is the name of the department?',
        validate: (name) => {
          if (name) {
            return true;
          } else {
            console.log('Please enter a department name.');
            return false;
          }
        },
      },
    ])
    .then((answer) => {
      const query = 'INSERT INTO department SET ?';
      database.query(query, { name: answer.name }, (err, res) => {
        if (err) throw err;
        console.log(`Added department "${answer.name}" to the database.`);
       
        start();
      });
    });
}


function addRole() {
  const query = 'SELECT * FROM department';
  database.query(query, (err, res) => {
    if (err) throw err;
    const departments = res.map((department) => ({
      name: department.name,
      value: department.id,
    }));
    inquirer
      .prompt([
        {
          type: 'input',
          name: 'title',
          message: 'What is the title of the role?',
          validate: (title) => {
            if (title) {
              return true;
            } else {
              console.log('Please enter a role title.');
              return false;
            }
          },
        },
        {
          type: 'input',
          name: 'salary',
          message: 'What is the salary of the role?',
          validate: (salary) => {
            if (salary && /^\d+$/.test(salary)) {
              return true;
            } else {
              console.log('Please enter a valid salary (numbers only).');
              return false;
            }
          },
        },
        {
          type: 'list',
          name: 'department',
          message: 'Which department does the role belong to?',
          choices: departments,
        },
    ])
    .then((answer) => {
      const query = 'INSERT INTO role SET ?';
      database.query(
        query,
        {
          title: answer.title,
          salary: answer.salary,
          department_id: answer.department,
        },
        (err, res) => {
          if (err) throw err;
          console.log(`Added role "${answer.title}" to the database.`);
          
          start();
        }
      );
    });
});
}


function addEmployee() {
const roleQuery = 'SELECT * FROM role';
const managerQuery =
  'SELECT id, first_name, last_name FROM employee WHERE manager_id IS NULL';
  database.query(roleQuery, (err, res) => {
  if (err) throw err;
  const roles = res.map((role) => ({ name: role.title, value: role.id }));
  database.query(managerQuery, (err, res) => {
    if (err) throw err;
    const managers = res.map((manager) => ({
      name: `${manager.first_name} ${manager.last_name}`,
      value: manager.id,
    }));
    inquirer
      .prompt([
        {
          type: 'input',
          name: 'firstName',
          message: "What is the employee's first name?",
          validate: (firstName) => {
            if (firstName) {
              return true;
            } else {
              console.log('Please enter a first name.');
              return false;
            }
          },
        },
        {
          type: 'input',
          name: 'lastName',
          message: "What is the employee's last name?",
          validate: (lastName) => {
            if (lastName) {
              return true;
            } else {
              console.log('Please enter a last name.');
              return false;
            }
          },
        },
        {
          type: 'list',
          name: 'role',
          message: "What is the employee's role?",
          choices: roles,
        },
        {
          type: 'list',
          name: 'manager',
          message: "Who is the employee's manager?",
          choices: managers,
        },
      ])
      .then((answer) => {
        const query = 'INSERT INTO employee SET ?';
        database.query(
          query,
          {
            first_name: answer.firstName,
            last_name: answer.lastName,
            role_id: answer.role,
            manager_id: answer.manager,
          },
          (err, res) => {
            if (err) throw err;
            console.log(
              `Added employee "${answer.firstName} ${answer.lastName}" to the database.`
            );
           
            start();
          }
        );
      });
  });
});
}


function viewData() {
inquirer
  .prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to view?',
      choices: ['Departments', 'Roles', 'Employees'],
    },
  ])
  .then((answer) => {
    const query = `SELECT * FROM ${answer.action.toLowerCase()}`;
    database.query(query, (err, res) => {
      if (err) throw err;
      console.table(res);
     
      start();
    });
  });
}


function updateEmployee() {
const employeeQuery =
  'SELECT id, first_name, last_name FROM employee ORDER BY last_name';
const roleQuery = 'SELECT * FROM role ORDER BY title';
database.query(employeeQuery, (err, res) => {
  if (err) throw err;
  const employees = res.map((employee) => ({
    name: `${employee.first_name} ${employee.last_name}`,
    value: employee.id,
  }));
  database.query(roleQuery, (err, res) => {
    if (err) throw err;
    const roles = res.map((role) => ({ name: role.title, value: role.id }));
    inquirer
      .prompt([
        {
            type: 'list',
            name: 'employee',
            message: "Which employee's role would you like to update?",
            choices: employees,
          },
          {
            type: 'list',
            name: 'role',
            message: "What is the employee's new role?",
            choices: roles,
          },
        ])
        .then((answer) => {
          const query = `UPDATE employee SET role_id = ${answer.role} WHERE id = ${answer.employee}`;
          connection.query(query, (err, res) => {
            if (err) throw err;
            console.log('Employee role updated.');
           
            start();
          });
        });
    });
  });
}


function deleteDepartment() {
  const departmentQuery = 'SELECT * FROM department';
  database.query(departmentQuery, (err, res) => {
    if (err) throw err;
    const departments = res.map((department) => ({
      name: department.name,
      value: department.id,
    }));
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'department',
          message: 'Which department would you like to delete?',
          choices: departments,
        },
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Are you sure you want to delete this department?',
        },
      ])
      .then((answer) => {
        if (answer.confirm) {
          const query = `DELETE FROM department WHERE id = ${answer.department}`;
          database.query(query, (err, res) => {
            if (err) throw err;
            console.log('Department deleted.');
            
            start();
          });
        } else {
          
          start();
        }
      });
  });
}


function deleteEmployee() {
  const employeeQuery =
    'SELECT id, first_name, last_name FROM employee ORDER BY last_name';
    database.query(employeeQuery, (err, res) => {
    if (err) throw err;
    const employees = res.map((employee) => ({
      name: `${employee.first_name} ${employee.last_name}`,
      value: employee.id,
    }));
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'employee',
          message: 'Which employee would you like to delete?',
          choices: employees,
        },
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Are you sure you want to delete this employee?',
        },
      ])
      .then((answer) => {
        if (answer.confirm) {
          const query = `DELETE FROM employee WHERE id = ${answer.employee}`;
          database.query(query, (err, res) => {
            if (err) throw err;
            console.log('Employee deleted.');
           
            start();
          });
        } else {
          
          start();
        }
      });
  });
}


database.connect((err) => {
  if (err) throw err;
  console.log(`Connected as id ${database.threadId}`);
  start();
});