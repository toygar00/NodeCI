const mongoose = require("mongoose");

const exec = mongoose.Query.prototype.exec;
const redis = require("redis");
const util = require("util");

const redisUrl = "redis://127.0.0.1:6379";
const client = redis.createClient(redisUrl);
client.hget = util.promisify(client.hget);

mongoose.Query.prototype.cache = function(options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || "");

  return this;
};

mongoose.Query.prototype.exec = async function() {
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }

  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name
    })
  );

  // See if have key in redis
  const cacheValue = await client.hget(this.hashKey, key);

  // if so return that
  if (cacheValue) {
    console.log("cache?");

    const doc = JSON.parse(cacheValue);

    return Array.isArray(doc)
      ? doc.map(d => this.model(d))
      : new this.model(doc);
  }

  // if not issue the query

  const result = await exec.apply(this, arguments);

  client.hset(this.hashKey, key, JSON.stringify(result));
  client.expire(this.hashKey, 10);

  console.log("NOO", result);

  return result;
};

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  }
};
