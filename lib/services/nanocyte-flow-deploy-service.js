const autoBind = require("auto-bind")
const mongojs = require("mongojs")
const { promisify } = require("util")

class NanocyteFlowDeployService {
  constructor({ env }) {
    autoBind(this)
    this.deviceCreated = env.INTERVAL_SERVICE_UUID != null && env.INTERVAL_SERVICE_TOKEN != null
    if (!env.FLOWS_MONGODB_URI) {
      throw new Error("IntervalService requires FLOWS_MONGODB_URI")
    }
    this.mongoDbUri = env.FLOWS_MONGODB_URI
  }

  async run() {
    const db = mongojs(this.mongoDbUri, ["instances", "iot-apps"])
    await this._ensureIndex(db.instances, { flowId: -1, instanceId: -1 })
    await this._ensureIndex(db.instances, { appId: -1, version: -1 })
    await this._ensureIndex(db["iot-apps"], { appId: -1 })
    db.close()
  }

  _ensureIndex(collection, index, sparse = false) {
    return new Promise((resolve, reject) => {
      collection.ensureIndex(index, { background: true, sparse }, err => {
        if (err) return reject(err)
        resolve()
      })
    })
  }
}

module.exports = NanocyteFlowDeployService
