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

    //Employees
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
                var allEmployees = db.query("SELECT * FROM employee", function (err, data){
                    if (err) throw err;
                    console.table(data);
                })
                case "manager":
                var employeesByManager;

            }
        }
    }

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





async function retrieveJoinedTable(selection, table1, table2, column) {
    this.db.query(`SELECT ${selection} FROM ${table1} LEFT JOIN ${table2} ON ${table1}.${column} = ${table2}.${column}`)
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
