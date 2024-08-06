const { MongoClient } = require('mongodb');

class DBClient {
    constructor() {
        // Get environment variables or set defaults
        const host = process.env.DB_HOST || 'localhost';
        const port = process.env.DB_PORT || 27017;
        const database = process.env.DB_DATABASE || 'files_manager';
        
        // Create the MongoDB connection URL
        this.url = `mongodb://${host}:${port}`;
        this.dbName = database;

        // Create a MongoDB client
        this.client = new MongoClient(this.url, { useNewUrlParser: true, useUnifiedTopology: true });

        // Initialize the connection
        this.client.connect(err => {
            if (err) {
                console.error('Failed to connect to MongoDB:', err);
                this.connected = false;
            } else {
                console.log('Connected to MongoDB');
                this.db = this.client.db(this.dbName);
                this.connected = true;
            }
        });
    }

    // Check if the connection is alive
    isAlive() {
        return this.connected;
    }

    // Get the number of documents in the 'users' collection
    async nbUsers() {
        if (this.isAlive()) {
            try {
                const count = await this.db.collection('users').countDocuments();
                return count;
            } catch (err) {
                console.error('Error counting users:', err);
                return 0;
            }
        }
        return 0;
    }

    // Get the number of documents in the 'files' collection
    async nbFiles() {
        if (this.isAlive()) {
            try {
                const count = await this.db.collection('files').countDocuments();
                return count;
            } catch (err) {
                console.error('Error counting files:', err);
                return 0;
            }
        }
        return 0;
    }
}

// Create and export an instance of DBClient
const dbClient = new DBClient();
module.exports = dbClient;

