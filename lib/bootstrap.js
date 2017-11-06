const fs = require("fs-extra")
const BootstrapServices = require("./bootstrap-services")
const jsonToEnv = require("./json-to-env")

const doBootstrap = async function({ meshbluConfig, outputFilePath }) {
  if (fs.pathExistsSync(outputFilePath)) {
    return fs.readFile(outputFilePath)
  }
  const bootstrapServices = new BootstrapServices({ meshbluConfig })
  const env = await bootstrapServices.run()
  const data = jsonToEnv(env)
  await fs.writeFile(outputFilePath, data)
  return data
}

module.exports = { doBootstrap }
