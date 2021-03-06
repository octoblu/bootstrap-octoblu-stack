const autoBind = require("auto-bind")
const MeshbluHttp = require("meshblu-http")
const NodeRSA = require("node-rsa")
const { promisify } = require("util")

class MeshbluAuthenticatorGoogle {
  constructor({ env, meshbluConfig }) {
    autoBind(this)
    this.deviceCreated = env.GOOGLE_AUTHENTICATOR_UUID != null && env.GOOGLE_AUTHENTICATOR_TOKEN != null
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
      type: "authenticator:google",
      name: "Authenticator Google",
      privateKey,
      publicKey,
      discoverWhitelist: [],
      receiveWhitelist: [],
      sendWhitelist: [],
      configureWhitelist: [],
    })

    return {
      GOOGLE_AUTHENTICATOR_UUID: uuid,
      GOOGLE_AUTHENTICATOR_TOKEN: token,
    }
  }
}

module.exports = MeshbluAuthenticatorGoogle
