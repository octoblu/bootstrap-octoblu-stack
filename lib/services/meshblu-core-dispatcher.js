const autoBind = require("auto-bind")
const mongojs = require("mongojs")

class MeshbluCoreDispatcher {
  constructor({ env }) {
    autoBind(this)
    if (!env.MESHBLU_MONGODB_URI) {
      throw new Error("Bootstrap requires MESHBLU_MONGODB_URI")
    }
    this.mongoDbUri = env.MESHBLU_MONGODB_URI
  }

  async run() {
    const db = mongojs(this.mongoDbUri, ["devices", "deleted-devices", "subscriptions", "tokens"])

    await this._ensureIndex(db.devices, { uuid: -1 })
    await this._ensureIndex(db.devices, { owner: -1 }, true)
    await this._ensureIndex(db.devices, { type: -1, owner: -1 }, true)
    await this._ensureIndex(db.devices, { discoverWhitelist: -1 }, true)
    await this._ensureIndex(db.devices, { configureWhitelist: -1 }, true)
    await this._ensureIndex(db.devices, { sendWhitelist: -1 }, true)
    await this._ensureIndex(db.devices, { receiveWhitelist: -1 }, true)
    await this._ensureIndex(db.devices, { discoverAsWhitelist: -1 }, true)
    await this._ensureIndex(db.devices, { configureAsWhitelist: -1 }, true)
    await this._ensureIndex(db.devices, { sendAsWhitelist: -1 }, true)
    await this._ensureIndex(db.devices, { receiveAsWhitelist: -1 }, true)
    await this._ensureIndex(db.devices, { "meshblu.search.terms": 1 }, true)
    await this._ensureIndex(db.devices, { "meshblu.whitelists.discover.view.uuid": -1 }, true)
    await this._ensureIndex(
      db.devices,
      { "meshblu.search.timestamps.label": 1, "meshblu.search.timestamps.timestamp": -1 },
      true,
    )
    await this._ensureIndex(db.devices, { "endo.idKey": -1 }, true)
    await this._ensureIndex(db.devices, { "slurry.idKey": -1 }, true)

    await this._ensureIndex(db["deleted-devices"], { uuid: -1 })

    await this._ensureIndex(db.subscriptions, { emitterUuid: 1, type: 1 })
    await this._ensureIndex(db.subscriptions, { emitterUuid: 1, type: 1 })
    await this._ensureIndex(db.subscriptions, { subscriberUuid: 1, emitterUuid: 1, type: 1 })

    await this._ensureIndex(db.tokens, { uuid: -1, hashedToken: -1 })
    await this._ensureIndex(db.tokens, { uuid: -1, "metadata.tag": -1 }, true)
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

module.exports = MeshbluCoreDispatcher
