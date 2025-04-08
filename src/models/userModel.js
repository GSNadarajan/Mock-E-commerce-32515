const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, '../data/users.json');

class UserModel {
  static async getAllUsers() {
    const data = await fs.readFile(dbPath, 'utf8');
    return JSON.parse(data).users;
  }

  static async getUserById(id) {
    const data = await fs.readFile(dbPath, 'utf8');
    const users = JSON.parse(data).users;
    return users.find(user => user.id === id);
  }

  static async createUser(userData) {
    const data = await fs.readFile(dbPath, 'utf8');
    const users = JSON.parse(data).users;
    
    const newUser = {
      id: uuidv4(),
      ...userData,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    await fs.writeFile(dbPath, JSON.stringify({ users }, null, 2));
    return newUser;
  }

  static async updateUser(id, userData) {
    const data = await fs.readFile(dbPath, 'utf8');
    const users = JSON.parse(data).users;
    
    const index = users.findIndex(user => user.id === id);
    if (index === -1) return null;
    
    const updatedUser = {
      ...users[index],
      ...userData,
      updatedAt: new Date().toISOString()
    };
    
    users[index] = updatedUser;
    await fs.writeFile(dbPath, JSON.stringify({ users }, null, 2));
    return updatedUser;
  }

  static async deleteUser(id) {
    const data = await fs.readFile(dbPath, 'utf8');
    const users = JSON.parse(data).users;
    
    const index = users.findIndex(user => user.id === id);
    if (index === -1) return false;
    
    users.splice(index, 1);
    await fs.writeFile(dbPath, JSON.stringify({ users }, null, 2));
    return true;
  }
}

module.exports = UserModel;