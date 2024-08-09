const { createClient } = require('redis');

class RedisClient {
    constructor() {
        
        this.client = createClient();
        this.isConnected = true;

        // Error handling
        this.client.on('error', (err) => {
            console.error('Redis Client Error:', err);
            this.isConnected = false;
        });

        // Connect to Redis server
        this.client.connect().then(() => {
            this.isConnected = true;
            //console.log("Redis client is connected to server");
        }).catch((err) => {
            console.error('Redis Connection Error:', err);
            this.isConnected = false;
        });
    }
	isAlive() {
        return this.isConnected;
    }

    // Get value by key
    async get(key) {
        try {
            return await this.client.get(key);
        } catch (err) {
            console.error('Get operation error:', err);
            throw err;
        }
    }

    // Set value with expiration
    async set(key, value, duration) {
        try {
            return await this.client.set(key, value, 'EX', duration);
        } catch (err) {
            console.error('Set operation error:', err);
            throw err;
        }
    }

    // Delete key
    async del(key) {
        try {
            return await this.client.del(key);
        } catch (err) {
            console.error('Delete operation error:', err);
            throw err;
        }
    }
}

// Create and export an instance of RedisClient
const redisClient = new RedisClient();
module.exports = redisClient;
