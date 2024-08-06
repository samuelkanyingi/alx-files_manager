const Bull = require('bull');
const dbClient = require('./utils/db');
const userQueue = new Bull('userQueue', 'redis://127.0.0.1:6379');

userQueue.process(async (job) => {
    const { userId } = job.data;
    if (!userId) {
        throw new Error('Missing userId');
    }

    const user = await dbClient.db.collection('users').findOne({ _id: new dbClient.ObjectID(userId) });
    if (!user) {
        throw new Error('User not found');
    }

    console.log(`Welcome ${user.email}!`);

    // Here you can integrate with an actual email service provider like Mailgun
});

console.log('Worker is running...');
