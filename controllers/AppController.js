const redisClient = require('../utils/redis'); // Import Redis client
const dbClient = require('../utils/db'); // Import DB client

class AppController {
  static async getStatus(req, res) {
    try {
      const redisAlive = redisClient.isAlive();
      const dbAlive = dbClient.isAlive();
      res.status(200).json({ redis: redisAlive, db: dbAlive });
    } catch (err) {
      console.error('Error in getStatus:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getStats(req, res) {
    try {
      const usersCount = await dbClient.nbUsers();
      const filesCount = await dbClient.nbFiles();
      res.status(200).json({ users: usersCount, files: filesCount });
    } catch (err) {
      console.error('Error in getStats:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = AppController;
