const autoBind = require("auto-bind")
const MeshbluHttp = require("meshblu-http")
const mongojs = require("mongojs")
const { promisify } = require("util")

class IntervalService {
  constructor({ env, meshbluConfig }) {
    autoBind(this)
    this.deviceCreated = env.INTERVAL_SERVICE_UUID != null && env.INTERVAL_SERVICE_TOKEN != null
    this.meshbluHttp = new MeshbluHttp(meshbluConfig)
    if (!env.FLOWS_MONGODB_URI) {
      throw new Error("IntervalService requires FLOWS_MONGODB_URI")
    }
    if (!env.INTERVAL_SERVICE_URI) {
      throw new Error("IntervalService requires INTERVAL_SERVICE_URI")
    }
    this.intervalServiceUri = env.INTERVAL_SERVICE_URI
    this.mongoDbUri = env.FLOWS_MONGODB_URI
  }

  async run() {
    const db = mongojs(this.mongoDbUri, ["soldiers"])
    await this._ensureIndex(db.soldiers, { "metadata.nodeId": 1, "metadata.ownerUuid": 1 })
    await this._ensureIndex(db.soldiers, {
      "metadata.processing": -1,
      "metadata.credentialsOnly": -1,
      "metadata.processAt": -1,
      "metadata.processNow": -1,
    })
    await this._ensureIndex(db.soldiers, { uuid: -1 })
    db.close()
    if (this.deviceCreated) {
      return
    }
    const register = promisify(this.meshbluHttp.register)
    const { uuid, token } = await register({
      type: "interval-service",
      name: "Interval Service",
      meshblu: {
        messageHooks: [
          {
            url: `{this.intervalServiceUri}/message`,
            method: "POST",
            generateAndForwardMeshbluCredentials: true,
          },
        ],
      },
      discoverWhitelist: ["*"],
      receiveWhitelist: ["*"],
      sendWhitelist: ["*"],
      configureWhitelist: [],
    })

    return {
      INTERVAL_SERVICE_UUID: uuid,
      INTERVAL_SERVICE_TOKEN: token,
    }
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

module.exports = IntervalService
