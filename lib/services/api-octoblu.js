const autoBind = require("auto-bind")
const MeshbluHttp = require("meshblu-http")
const { promisify } = require("util")
const mongojs = require("mongojs")

class ApiOctoblu {
  constructor({ env, meshbluConfig }) {
    autoBind(this)
    this.deviceCreated = env.OCTOBLU_UUID != null && env.OCTOBLU_TOKEN != null
    if (!env.OCTOBLU_MONGODB_URI) {
      throw new Error("ApiOctoblu requires OCTOBLU_MONGODB_URI")
    }
    this.mongoDbUri = env.OCTOBLU_MONGODB_URI
    this.meshbluHttp = new MeshbluHttp(meshbluConfig)
  }

  async run() {
    const db = mongojs(this.mongoDbUri, ["users", "flows", "templates"])
    await this._ensureIndex(db.users, { "api.expiresOn": -1 })
    await this._ensureIndex(db.users, { "resource.owner.uuid": 1 })
    await this._ensureIndex(db.users, { "resource.parent.uuid": 1 })
    await this._ensureIndex(db.users, { "skynet.uuid": 1 })
    await this._ensureIndex(db.flows, { flowId: 1, "resource.owner.uuid": 1 })
    await this._ensureIndex(db.flows, { "nodes.id": 1 })
    await this._ensureIndex(db.flows, { "resource.owner.uuid": 1 })
    db.close()
    const newDevice = await this._createDevice()
    if (newDevice) {
      return {
        OCTOBLU_UUID: newDevice.uuid,
        OCTOBLU_TOKEN: newDevice.token,
      }
    }
  }

  async _createDevice() {
    if (this.deviceCreated) return
    const register = promisify(this.meshbluHttp.register)
    return register({
      type: "service:octoblu",
      meshblu: {
        version: "2.0.0",
        whitelists: {},
      },
    })
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

module.exports = ApiOctoblu
