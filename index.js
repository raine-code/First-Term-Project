const readline = require("readline");
const sequelize = require("./server/config/database");
const AuthService = require("./server/services/AuthService");
const GetData = require('./server/services/DataService')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function getFirstName() {
    const users = await GetData.getUsers();
    
    // const roles = users.map((role) => role.role);
    console.log(users);

    // const adminNames = users
    //   .filter((user) => user.role === "ADMIN")
    //   .map((user) => user.firstName);

    // console.log(adminNames);

    // const names = users.map((name) => name.firstName);
    // console.log(names);
}

getFirstName();

async function startProgram() {

    rl.question("Username: ", (username) => {
        rl.question("Password: ", async (password) => {
            try {
            const user = await AuthService.login(username, password);
            console.log(`Welcome ${user.username}!`);
            } catch (err) {
            console.log(err.message);
            } finally {
            rl.close();
            }
        });
    });

    
}

// startProgram();
