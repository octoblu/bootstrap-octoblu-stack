const autoBind = require("auto-bind")
const map = require("lodash/map")
const defaults = require("lodash/defaults")
const Promise = require("bluebird")

const availableServices = {
  "api-octoblu": require("./api-octoblu"),
  "interval-service": require("./interval-service"),
  "meshblu-authenticator-email-password": require("./meshblu-authenticator-email-password"),
  "meshblu-authenticator-facebook": require("./meshblu-authenticator-facebook"),
  "meshblu-authenticator-github": require("./meshblu-authenticator-github"),
  "meshblu-authenticator-google": require("./meshblu-authenticator-google"),
  "meshblu-authenticator-twitter": require("./meshblu-authenticator-twitter"),
  "meshblu-core-dispatcher": require("./meshblu-core-dispatcher"),
  "meshblu-otp-service": require("./meshblu-otp-service"),
  "nanocyte-flow-deploy-service": require("./nanocyte-flow-deploy-service"),
  "oauth-provider": require("./oauth-provider"),
  "triggers-service": require("./triggers-service"),
}

class Services {
  constructor({ services, meshbluConfig }) {
    autoBind(this)
    const env = process.env
    this.services = map(services, serviceName => {
      if (!availableServices[serviceName]) {
        throw new Error(`${serviceName} not supported`)
      }
      const Service = availableServices[serviceName]
      return new Service({ env, meshbluConfig })
    })
  }

  run() {
    return Promise.reduce(this.services, this._runService, {})
  }

  async _runService(env, service) {
    const newEnv = await service.run()
    if (!newEnv) {
      return env
    }
    return defaults(env, newEnv)
  }
}

module.exports = Services
