const crypto = require('crypto');
const dbClient = require('../utils/db');
const { userQueue } = require('../utils/queue');

class UsersController {
  static async postNew(req, res) {
    try {
      if (!req.body) {
        return res.status(400).json({ error: 'Missing request body' });
      }
      const { email, password } = req.body;

      // Validate input
      if (!email) {
        return res.status(400).json({ error: 'Missing email' });
      }
      if (!password) {
        return res.status(400).json({ error: 'Missing password' });
      }

      // Check if email already exists
      const existingUser = await dbClient.db.collection('users').findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Already exist' });
      }

      // Hash the password using SHA1
      const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');

      // Insert new user into the database
      const result = await dbClient.db.collection('users').insertOne({
        email,
        password: hashedPassword,
      });

      // Respond with the new user's id and email
      const newUser = result.ops[0];
      const userId = newUser._id;

      // Add a job to the userQueue for sending a welcome email
      await userQueue.add({ userId });
      res.status(201).json({
        id: newUser._id,
        email: newUser.email,
      });
    } catch (err) {
      console.error('Error creating user:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    return null;
  }

  static async getMe(req, res) {
    try {
      const userId = req.user._id; // req.user is set by authentication middleware

      // Fetch user details from the database
      const user = await dbClient.db.collection('users').findOne({ _id: userId });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Respond with user details (excluding password)
      res.status(200).json({
        id: user._id,
        email: user.email,
        // Add other user details if needed
      });
    } catch (err) {
      console.error('Error fetching user details:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    return null;
  }
}

module.exports = UsersController;
