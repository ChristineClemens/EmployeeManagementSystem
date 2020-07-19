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
    const mainMenu = await inquirer.prompt ([
        {
            message: "What would you like to do?",
            name: "mainMenu",
            type: "list",
            choices: [
                {
                    name: "Manage Employees",
                    value: "employees"
                },
                {
                    name: "Manage Roles",
                    value: "roles"
                },
                {
                    name: "Manage Departments",
                    value: "departments"
                },
                {
                    name: "Exit",
                    value: "exit"
                }
            ]
        }
    ]) .then ((selection) => selection.mainMenu);

    switch (selection) {
        case "employees":
        var employeesMenu = await inquirer.prompt ([
            {
                message: "Please select an option below:",
                name: "employeesMenu",
                type: "list",
                choices: [
                    {
                        name: "View existing employees",
                        value: "view"
                    },
                    {
                        name: "Add a new employee",
                        value: "add"
                    },
                    {
                        name: "Update an existing employee's role",
                        value: "update"
                    },
                    {
                        name: "Update an existing employee's manager",
                        value: "updateManager"
                    },
                    {
                        name: "Remove an existing employee",
                        value: "remove"
                    }
                ]
            }
        ]) .then ((response) => response.employeesMenu)
    }


}

mainApp();









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
