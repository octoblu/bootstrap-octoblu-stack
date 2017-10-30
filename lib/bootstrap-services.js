const autoBind = require("auto-bind")
const map = require("lodash/map")
const defaults = require("lodash/defaults")
const Promise = require("bluebird")

const availableServices = {
  "api-octoblu": require("./services/api-octoblu"),
  "interval-service": require("./services/interval-service"),
  "meshblu-authenticator-email-password": require("./services/meshblu-authenticator-email-password"),
  "meshblu-authenticator-facebook": require("./services/meshblu-authenticator-facebook"),
  "meshblu-authenticator-github": require("./services/meshblu-authenticator-github"),
  "meshblu-authenticator-google": require("./services/meshblu-authenticator-google"),
  "meshblu-authenticator-twitter": require("./services/meshblu-authenticator-twitter"),
  "meshblu-core-dispatcher": require("./services/meshblu-core-dispatcher"),
  "meshblu-otp-service": require("./services/meshblu-otp-service"),
  "nanocyte-flow-deploy-service": require("./services/nanocyte-flow-deploy-service"),
  "oauth-provider": require("./services/oauth-provider"),
  "triggers-service": require("./services/triggers-service"),
}

class BootstrapServices {
  constructor({ meshbluConfig }) {
    autoBind(this)
    const env = process.env
    this.services = map(availableServices, Service => {
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

module.exports = BootstrapServices
