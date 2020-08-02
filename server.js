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

async function mainApp() {
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
                    var managerOptions = db.query("SELECT DISTINCT CONCAT(manager.first_name, ' ', manager.last_name) AS Name, manager.id FROM employee employee INNER JOIN employee manager ON manager.id = employee.manager_id;");
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
                    var columns = `${name, id}`;
                    var departmentOptions = selectOne(columns, department);
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
                        var employeesByDepartment = await db.query("SELECT CONCAT(first_name, ' ', last_name) as Name FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id WHERE department.id = ?", selectedDepartment);
                        console.table(employeesByDepartment);
                        break;    
            };
        };
        //Add employees selection------------------------------------------------------------
        case "add":
            var columns = `${name, id}`;
            var departmentOptions = selectOne(columns, role);
            departmentOptions = departmentOptions.map((selection) => ({
                name: selection.title,
                value: selection.id
            }));
            var managerOptions = db.query("SELECT DISTINCT CONCAT(manager.first_name, ' ', manager.last_name) AS Name, manager.id FROM employee employee INNER JOIN employee manager ON manager.id = employee.manager_id;");
                    managerOptions = managerOptions.map((selection) => ({
                        name: selection.name,
                        value: selection.id,
                }));
            var addEmployee = await inquirer.prompt ([
                {
                    message: "What is the employee's first name?",
                    name: "firstName",
                    type: "input",
                    validate: (input) => input != null
                },
                {
                    message: "What is the employee's last name?",
                    name: "lastName",
                    type: "list",
                    validate: (input) => input != null
                },
                {
                    message: "Select the employee's role from the list below:",
                    name: "employeeRole",
                    type: "list",
                    choices: departmentOptions
                },
                {
                    message: "Select the employee's manager from the list below:",
                    name: "employeeManager",
                    type: "list",
                    choices: managerOptions
                }
            ]);
            await db.query("INSERT INTO employee SET ?", addEmployee);
                console.table(await db.retrieveJoinedTable());
                break;

        //Update employee section------------------------------------------------------------        
        case "updateRole":
            var employees = await this.query("SELECT CONCAT(first_name, ' ', last_name), id FROM employee")
            employees = employees.map(i => ({name: i["CONCAT(first_name, ' ', last_name)"], value: i.id}))
            var roles = await this.query("SELECT title, id FROM role")
            roles = roles.map(i => ({value: i.id, name: i.title}))

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
            console.table(await db.getJoinedTable());
            break;
        
        //Update employee manager------------------------------------------------------------
        case "updateManager":
            var employees = await this.query("SELECT CONCAT(first_name, ' ', last_name), id FROM employee")
            employees = employees.map(i => ({name: i["CONCAT(first_name, ' ', last_name)"], value: i.id}))
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
            console.table(await db.getJoinedTable());
            break;
    };   

    //Roles----------------------------------------------------------------------------------
    //View roles selection-------------------------------------------------------------------
    switch (selection) {
        case "updateRole":
            var rolesMenu = await inquirer.prompt ([
                {
                    message: "Please select an option below:",
                    name: "rolesMenu",
                    type: "list",
                    choices: [
                        {name: "View existing roles", value: "view"},
                        {name: "Add a new role", value: "add"},
                        {name: "Update an existing role", value: "update"},
                        {name: "Delete an existing role", value: "delete"}
                    ]
                }
            ]) .then ((response) => response.rolesMenu)
    }

    //Departments-----------------------------------------------------------------------------
    //View departments selection--------------------------------------------------------------
    switch (selection) {
        case "departments":
            var departmentOptions = selectOne(columns, department);
            departmentOptions = departmentOptions.map((selection) => ({
                name: selection.department,
                value: selection.id
        }));            
        var departmentsMenu = await inquirer.prompt ([
            {
                message: "Please select an option below:",
                name: "departmentsMenu",
                type: "list",
                choices: [
                    {name: "View existing departments", value: "view"},
                    {name: "Add a new department", value: "add"},
                    {name: "Update an existing department", value: "update"},
                    {name: "Remove an existing department", value: "remove"}
                ]
            }
        ]) .then ((response) => response.departmentsMenu)

}





async function selectAll(tableName) {
    return new Promise((resolve, reject) => {
        this.connection.query("SELECT * FROM ??", [tableName], function (err, rows) {
            if (err) reject(err);
            resolve(rows);
        });
    });
}

async function selectSome(tableName, columnName, searchValue) {
    return new Promise((resolve, reject) => {
        this.connection.query("SELECT * FROM ?? WHERE ?? = ?", [tableName, columnName, searchValue], function (err, rows) {
            if (err) reject(err);
            resolve(rows);
        });
    });
}

async function selectOne(columns, table) {
    return new Promise((resolve, reject) => {
        this.connection.query("SELECT * FROM ??", [columns, table], function (err, rows) {
            if (err) reject (err)
            resolve(rows)
        })
    })
}

async function insertOne(tableName, value) {
    return new Promise((resolve, reject) => {
        this.connection.query("INSERT INTO ?? SET ?", [tableName, value], function (err, rows) {
            if (err) reject(err);
            resolve(rows);
        });
    });
}

async function updateOne(tableName, update, condition) {
    //requires a string for tablename, and objects with a single key value pair for update and condition
    return new Promise((resolve, reject) => {
        this.connection.query("UPDATE ?? SET ? WHERE ?", [tableName, update, condition], function (err, rows) {
            if (err) reject(err);
            resolve(rows);
        });
    });
}

async function removeOne(tableName, condition) {
    return new Promise((resolve, reject) => {
        this.connection.query("DELETE FROM ?? WHERE ?", [tableName, condition], function (err, rows) {
            if (err) reject(err);
            resolve(rows);
        });
    });
}

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
};

mainApp();