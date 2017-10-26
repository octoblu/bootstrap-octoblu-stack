const defaults = require("lodash/defaults")
const cloneDeep = require("lodash/cloneDeep")
const autoBind = require("auto-bind")
const Promise = require("bluebird")

class Bootstrap {
  constructor({ meshbluConfig }) {
    autoBind(this)
    this.meshbluConfig = meshbluConfig
  }

  async run(services) {
    return Promise.reduce(services, this._bootstrapService, {})
  }

  async _bootstrapService(env, serviceName) {
    let Service
    try {
      Service = require(`./services/${serviceName}`)
    } catch (err) {
      return env
    }
    const { meshbluConfig } = this
    const service = new Service({ env: process.env, meshbluConfig })
    const newEnv = await service.run()
    return defaults(env, newEnv)
  }
}

module.exports = Bootstrap
