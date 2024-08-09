const Bull = require('bull');

const userQueue = new Bull('userQueue', 'redis://127.0.0.1:6379');

module.exports = { userQueue };
