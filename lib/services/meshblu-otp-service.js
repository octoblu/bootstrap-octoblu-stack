const autoBind = require("auto-bind")
const MeshbluHttp = require("meshblu-http")
const NodeRSA = require("node-rsa")
const { promisify } = require("util")

class MeshbluOTPService {
  constructor({ env, meshbluConfig }) {
    autoBind(this)
    this.privateKeyExists = env.MESHBLU_OTP_PRIVATE_KEY_BASE64 != null
  }

  async run() {
    if (this.privateKeyExists) {
      return
    }
    const key = new NodeRSA()
    key.generateKeyPair(1024)
    const privateKey = key.exportKey("private")
    return {
      MESHBLU_OTP_PRIVATE_KEY_BASE64: new Buffer(privateKey).toString("base64"),
    }
  }
}

module.exports = MeshbluOTPService
