require("dotenv").config();

const consoleTable = require("console.table");
const mysql = require("mysql");
const inquirer = require("inquirer");

class Database {
    constructor( config ) {
        this.connection = mysql.createConnection( config );
    }
    query( sql, args ) {
        return new Promise( ( resolve, reject ) => {
            this.connection.query( sql, args, ( err, rows ) => {
                if ( err )
                    return reject( err );
                resolve( rows );
            } );
        } );
    }
    close() {
        return new Promise( ( resolve, reject ) => {
            this.connection.end( err => {
                if ( err )
                    return reject( err );
                resolve();
            });
        });
    }
}

// Access SQL Database
const db = new Database({
    host: "localhost",
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME,
    insecureAuth : true
});

async function retrieveJoinedTable() {
    return await db.query(`SELECT CONCAT(employee.last_name, ', ', employee.first_name) as 'Employee Name',
    role.salary as Salary,
    role.title as Role,
    department.name AS 'Department Name',
    CONCAT(manager.last_name, ', ', manager.first_name) AS Manager
    FROM employee employee
    LEFT JOIN employee manager ON employee.manager_id = manager.id
    LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id
    ORDER BY employee.last_name ASC;`)
};

async function mainApp() {
    selectionLoop: while (true) {
        //Main menu selection-------------------------------------------------------------------
        const mainMenu = await inquirer.prompt ([
            {
                message: "What would you like to do?",
                name: "mainMenu",
                type: "list",
                choices: [
                    {name: "Manage Employees", value: "employees"},
                    {name: "Manage Roles", value: "roles"},
                    {name: "Manage Departments", value: "departments"},
                    {name: "Exit", value: "exit"}
                ]
            }
        ]) .then ((mainMenu) => mainMenu.mainMenu);

        //Employees-----------------------------------------------------------------------------
        //Employees selection-------------------------------------------------------------------
        switch (mainMenu) {
            case "employees":
            var employeesMenu = await inquirer.prompt ([
                {
                    message: "Please select an option below:",
                    name: "employeesMenu",
                    type: "list",
                    choices: [
                        {name: "View existing employees", value: "view"},
                        {name: "Add a new employee", value: "add"},
                        {name: "Update an existing employee's role", value: "updateRole"},
                        {name: "Update an existing employee's manager", value: "updateManager"},
                        {name: "Remove an existing employee", value: "remove"}
                    ]
                }
            ]) .then ((employeesMenu) => employeesMenu.employeesMenu)
            
            //View employees selection----------------------------------------------------------
            switch (employeesMenu) {
                case "view":
                var viewType = await inquirer.prompt([
                    {
                        message: "How would you like to view employees?",
                        name: "viewType",
                        type: "list",
                        choices: [
                            {name: "View all employees", value: "all"},
                            {name: "View employees by manager", value: "manager"},
                            {name: "View employees by department", value: "department"}
                        ]
                    }
                ]) .then((viewType) => viewType.viewType)

            //View all employees------------------------------------------------------------
            switch (viewType) {
                case "all":
                    console.table(await retrieveJoinedTable());
                    break;

                //View employees by manager-------------------------------------------------
                case "manager":
                    var managerOptions = await db.query("SELECT DISTINCT CONCAT(manager.first_name, ' ', manager.last_name) AS name, manager.id FROM employee employee INNER JOIN employee manager ON manager.id = employee.manager_id;");
                    managerOptions = managerOptions.map((selection) => ({
                        name: selection.name,
                        value: selection.id,
                    }));
                var selectedManager = await inquirer.prompt ([
                    {
                        message: "Please select a manager from the list below:",
                        name: "selectedManager",
                        type: "list",
                        choices: managerOptions,
                    }
                    ]) .then ((response) => response.selectedManager)
                        var employeesByManager = await db.query("SELECT CONCAT(first_name, ' ', last_name) AS name FROM employee WHERE manager_id = ?", selectedManager); 
                        console.table(employeesByManager);
                        break;

                //View employees by department----------------------------------------------
                case "department":
                    var departmentOptions = await db.query("SELECT name, id FROM department");
                    departmentOptions = departmentOptions.map((selection) => ({
                        name: selection.name,
                        value: selection.id
                }));
                var selectedDepartment = await inquirer.prompt ([
                    {
                        message: "Please select a department from the list below:",
                        name: "selectedDepartment",
                        type: "list",
                        choices: departmentOptions
                    }
                    ]) .then ((response) => response.selectedDepartment)
                        var employeesByDepartment = await db.query("SELECT CONCAT(first_name, ' ', last_name) as name FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id WHERE department.id = ?;", selectedDepartment);
                        console.table(employeesByDepartment);
                        break;    
                };
            break;
            //Add employees selection------------------------------------------------------------
            case "add":
                var roleOptions = await db.query("SELECT title, id FROM role");
                roleOptions = roleOptions.map(index => ({value: index.id, name: index.title}));
                var managerOptions = await db.query("SELECT DISTINCT CONCAT(manager.first_name, ' ', manager.last_name) AS name, manager.id FROM employee employee INNER JOIN employee manager ON manager.id = employee.manager_id;");
                        managerOptions = managerOptions.map((selection) => ({
                            name: selection.name,
                            value: selection.id,
                    }));
                var addEmployee = await inquirer.prompt ([
                    {
                        message: "What is the employee's first name?",
                        name: "first_name",
                        type: "input",
                        validate: (input) => input != null
                    },
                    {
                        message: "What is the employee's last name?",
                        name: "last_name",
                        type: "input",
                        validate: (input) => input != null
                    },
                    {
                        message: "Select the employee's role from the list below:",
                        name: "role_id",
                        type: "list",
                        choices: roleOptions
                    },
                    {
                        message: "Select the employee's manager from the list below:",
                        name: "manager_id",
                        type: "list",
                        choices: managerOptions
                    }
                ]);
                await db.query("INSERT INTO employee SET ?", addEmployee);
                    console.table(await retrieveJoinedTable());
                    break;

            //Update employee section------------------------------------------------------------        
            case "updateRole":
                var employees = await db.query("SELECT CONCAT(first_name, ' ', last_name), id FROM employee")
                employees = employees.map(index => ({name: index["CONCAT(first_name, ' ', last_name)"], value: index.id}))
                var roles = await db.query("SELECT title, id FROM role")
                    roles = roles.map(selection => ({
                        value: selection.id, 
                        name: selection.title
                    }));
                var employeeRoleUpdate = await inquirer.prompt([
                    {
                        message: "Please select the employee that you'd like to update:",
                        name: "employeeSelection",
                        type: "list",
                        choices: employees
                    },
                    {
                        message: "Please select the role that you'd like to assign this employee:",
                        name: "rolesSelection",
                        type: "list",
                        choices: roles
                    }
                ]);
                updatedEmployeeRole = await db.query("UPDATE employee SET role_id = ? WHERE id = ?", [
                    employeeRoleUpdate.role_id,
                    employeeRoleUpdate.employee_id,
                ]);
                console.table(await retrieveJoinedTable());
                break;
            
            //Update employee manager seleciton--------------------------------------------------
            case "updateManager":
                var employees = await db.query("SELECT CONCAT(first_name, ' ', last_name), id FROM employee")
                employees = employees.map(index => ({name: index["CONCAT(first_name, ' ', last_name)"], value: index.id}))
                var managerOptions = await db.query("SELECT DISTINCT CONCAT(manager.first_name, ' ', manager.last_name) AS name, manager.id AS value FROM employee employee INNER JOIN employee manager ON manager.id = employee.manager_id;");
                var employeeManagerUpdate = await inquirer.prompt([
                    {
                        message: "Which employee would you like to update?",
                        name: "employeeSelection",
                        type: "list",
                        choices: employees
                    },
                    {
                        message: "Please select the manager that you'd like to assign this employee:",
                        name: "managersSelection",
                        type: "list",
                        choices: managerOptions
                    }
                ]);
                updatedEmployeeManager = await db.query("UPDATE employee SET manager_id = ? WHERE id = ?", [
                    employeeManagerUpdate.manager_id,
                    employeeManagerUpdate.employee_id,
                ]);
                console.table(await retrieveJoinedTable());
                break;
            
            //Remove employee selection----------------------------------------------------------
            case "remove":
                var employees = await db.query("SELECT CONCAT(first_name, ' ', last_name), id FROM employee")
                employees = employees.map(index => ({name: index["CONCAT(first_name, ' ', last_name)"], value: index.id}))
                var removeEmployee = await inquirer.prompt([
                    {
                        message: "Which employee would you like to terminate?",
                        name: "employee_id",
                        type: "list",
                        choices: employees,
                    }
                ]);
                await db.query("DELETE FROM employee WHERE id = ?", [removeEmployee.employee_id,]);
                console.log(`This employee has been succesfully removed from the employee roster.`)
                break;
            };   
        };
        //Roles----------------------------------------------------------------------------------
        //Roles selection------------------------------------------------------------------------
        switch (mainMenu) {
            case "roles":
                var rolesMenu = await inquirer.prompt ([
                    {
                        message: "Please select an option below:",
                        name: "rolesMenu",
                        type: "list",
                        choices: [
                            {name: "View existing roles", value: "view"},
                            {name: "Add a new role", value: "add"},
                            {name: "Remove an existing role", value: "remove"}
                        ]
                    }
                ]) .then ((response) => response.rolesMenu)
            
            //View roles selection----------------------------------------------------------------
            switch (rolesMenu) {
                case "view":
                    var viewRoles = await db.query("SELECT title as Title, salary as Salary, department.name as Department FROM role INNER JOIN department ON department_id = department.id ORDER BY department.name ASC, salary DESC;");
                    console.table(viewRoles);
                    break;
            
                //Add roles selection-------------------------------------------------------------
                case "add":
                    var roleDepartment = await db.query("SELECT name, id AS value FROM department")
                    var addRoles = await inquirer.prompt([
                        {
                            message: "Please enter the new role name:",
                            name: "title",
                            type: "input"
                        },
                        {
                            message: "Please enter the new role salary:",
                            name: "salary",
                            type: "input",
                            validate: (inp) => Number.isInteger(parseInt(inp))
                        },
                        {
                            message: "Please select the department in which this role will be available:",
                            name: "department_id",
                            type: "list",
                            choices: roleDepartment
                        },
                    ]);
                    await db.query("INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)", [addRoles.title, addRoles.salary, addRoles.department_id]);
                    console.log(`This role has been successfully added to the roles list.`)
                    break;
                
                //Remove roles selection----------------------------------------------------------
                case "remove":
                    var roles = await db.query("SELECT title, id FROM role")
                    roles = roles.map(index => ({value: index.id, name: index.title}))
                    var removeRole = await inquirer.prompt([
                        {
                            message: "Which role would you like to remove?",
                            name: "role_id",
                            type: "list",
                            choices: roles
                        }
                    ]);
                    await db.query("DELETE FROM role WHERE id = ?", [removeRole.role_id]);
                    console.log(`This role has been successfully removed from the roles list.`)
                    break;
                };
            };
        //Departments-----------------------------------------------------------------------------
        //Departments selection-------------------------------------------------------------------
        switch (mainMenu) {
            case "departments":
            //     var departmentOptions = selectOne(columns, department);
            //     departmentOptions = departmentOptions.map((selection) => ({
            //         name: selection.department,
            //         value: selection.id
            // }));            
            var departmentsMenu = await inquirer.prompt ([
                {
                    message: "Please select an option below:",
                    name: "departmentsMenu",
                    type: "list",
                    choices: [
                        {name: "View existing departments", value: "view"},
                        {name: "Add a new department", value: "add"},
                    ]
                }
            ]) .then ((response) => response.departmentsMenu)

            //View departments selection----------------------------------------------------------
            switch (departmentsMenu) {
                case "view":
                    console.table(await db.query("SELECT name FROM department"));
                    break;
                
                //Add departments selection-------------------------------------------------------
                case "add":
                    let addDepartment = await inquirer.prompt([
                        {
                            message: "Please enter the new department name:",
                            name: "name",
                            type: "input"
                        }
                    ]) .then((response) => response.name);
                        await db.query("INSERT INTO department (name) VALUES (?)", [addDepartment]);
                        console.log(`This department has been successfull added to the departments list.`)
                        break;
            }
            //Exit to main menu--------------------------------------------------------------
            case "exit":
                db.close();
                break selectionLoop;
        }
    }
}
mainApp();