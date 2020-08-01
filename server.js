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
    ]) .then ((selection) => selection.mainMenu);

    //Employees-----------------------------------------------------------------------------
    //Employees selection-------------------------------------------------------------------
    switch (selection) {
        case "employees":
        var employeesMenu = await inquirer.prompt ([
            {
                message: "Please select an option below:",
                name: "employeesMenu",
                type: "list",
                choices: [
                    {name: "View existing employees", value: "view"},
                    {name: "Add a new employee", value: "add"},
                    {name: "Update an existing employee's role", value: "update"},
                    {name: "Update an existing employee's manager", value: "updateManager"},
                    {name: "Remove an existing employee", value: "remove"}
                ]
            }
        ]) .then ((response) => response.employeesMenu)
        
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
            ]) .then((response) => response.viewType)

            //View all employees------------------------------------------------------------
            switch (response.viewType) {
                case "all":
                    console.table(await db.retrieveJoinedTable());
                    break;
                })
                //View employees by manager-------------------------------------------------
                case "manager":
                var employeesByManager = db.query("SELECT DISTINCT CONCAT(manager.first_name, ' ', manager.last_name) AS Name, m.id FROM employee e INNER JOIN employee m ON m.id = e.manager_id;");
                managerOptions = managerList.map((selection) => ({
                    name: selection.name,
                    value: selection.id,
                }));
                var selectedManager = await inquirer.prompt ([
                    {
                        message: "Please",
                        name: "selectedManager",
                        type: "list",
                        choices: managerOptions,
                    }
                ]) .then ((response) => response.selectedManager)
                    var subordinates = await db.query("SELECT CONCAT(first_name, ' ', last_name) AS name FROM employee WHERE manager_id = ?", selectedManager);
            }
        }
    }

    //Roles----------------------------------------------------------------------------------
    //View roles selection-------------------------------------------------------------------
    switch (selection) {
        case "roles":
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

mainApp();



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

async function selectOne(tableName, column, value) {
    return new Promise((resolve, reject) => {
        this.connection.query("SELECT * FROM ?? WHERE ?? = ?", [tableName, column, value], function (err, rows) {
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
    return await this.query(`SELECT CONCAT(e.last_name, ', ', employee.first_name) as 'Employee Name',
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