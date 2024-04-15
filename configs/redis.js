const { createClient } = require('redis');

// Socket required for node redis <-> docker-compose connection
const Redis = createClient();

module.exports = Redis;
