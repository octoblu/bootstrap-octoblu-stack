const autoBind = require("auto-bind")
const MeshbluHttp = require("meshblu-http")
const NodeRSA = require("node-rsa")
const { promisify } = require("util")

class BootstrapService {
  constructor({ env, meshbluConfig }) {
    autoBind(this)
    this.deviceCreated = env.FACEBOOK_AUTHENTICATOR_UUID != null && env.FACEBOOK_AUTHENTICATOR_TOKEN != null
    this.meshbluHttp = new MeshbluHttp(meshbluConfig)
  }

  async run() {
    if (this.deviceCreated) {
      return
    }
    const register = promisify(this.meshbluHttp.register)
    const key = new NodeRSA()
    key.generateKeyPair(1024)
    const privateKey = key.exportKey("private")
    const publicKey = key.exportKey("public")

    const { uuid, token } = await register({
      type: "authenticator:facebook",
      name: "Authenticator Facebook",
      privateKey,
      publicKey,
      discoverWhitelist: [],
      receiveWhitelist: [],
      sendWhitelist: [],
      configureWhitelist: [],
    })

    return {
      FACEBOOK_AUTHENTICATOR_UUID: uuid,
      FACEBOOK_AUTHENTICATOR_TOKEN: token,
    }
  }
}

module.exports = BootstrapService
