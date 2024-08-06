const Bull = require('bull');
const { ObjectID } = require('mongodb');
const dbClient = require('./utils/db');
const imageThumbnail = require('image-thumbnail');
const fs = require('fs');

// Create the fileQueue
const fileQueue = new Bull('fileQueue');

// Process the queue
fileQueue.process(async (job, done) => {
    const { userId, fileId } = job.data;

    if (!fileId) {
        return done(new Error('Missing fileId'));
    }

    if (!userId) {
        return done(new Error('Missing userId'));
    }

    const file = await dbClient.db.collection('files').findOne({ _id: new ObjectID(fileId), userId: ObjectID(userId) });

    if (!file) {
        return done(new Error('File not found'));
    }

    const filePath = file.localPath;
    if (!fs.existsSync(filePath)) {
        return done(new Error('File not found'));
    }

    try {
        const sizes = [500, 250, 100];
        for (const size of sizes) {
            const thumbnail = await imageThumbnail(filePath, { width: size });
            fs.writeFileSync(`${filePath}_${size}`, thumbnail);
        }
        done();
    } catch (error) {
        done(error);
    }
});

// Start the worker
if (require.main === module) {
    fileQueue.on('error', (error) => {
        console.error('Queue error:', error);
    });

    fileQueue.on('completed', (job) => {
        console.log(`Job ${job.id} completed`);
    });

    console.log('Worker started');
}

