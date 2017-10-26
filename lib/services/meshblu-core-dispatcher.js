const autoBind = require("auto-bind")
const mongojs = require("mongojs")

class BootstrapService {
  constructor({ env }) {
    autoBind(this)
    if (!env.MONGODB_URI) {
      throw new Error("Bootstrap meshblu-core-dispatcher requires MONGODB_URI")
    }
    this.mongoDbUri = env.MONGODB_URI
  }

  run() {
    return new Promise((resolve, reject) => {
      const db = mongojs(this.mongoDbUri, ["devices"])
      db.devices.ensureIndex({ uuid: -1 }, { background: true }, err => {
        db.close()
        if (err) return reject(err)
        resolve()
      })
    })
  }
}

module.exports = BootstrapService
