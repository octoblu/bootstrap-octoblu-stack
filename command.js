#!/usr/bin/env node

const path = require("path")
const fs = require("fs-extra")
const autoBind = require("auto-bind")
const dashdash = require("dashdash")
const sigtermHandler = require("sigterm-handler")
const MeshbluConfig = require("meshblu-config")
const BootstrapServices = require("./lib/bootstrap-services")
const jsonToEnv = require("./lib/json-to-env")
const packageJSON = require("./package.json")

process.on("uncaughtException", function(error) {
  console.error(error.stack)
  process.exit(1)
})

process.on("unhandledRejection", error => {
  console.error(error.stack)
  process.exit(1)
})

const OPTIONS = [
  {
    names: ["help", "h"],
    type: "bool",
    help: "Print this help and exit.",
  },
  {
    names: ["version", "v"],
    type: "bool",
    help: "Print version and exit",
  },
  {
    names: ["output", "o"],
    env: "ENV_OUTPUT_FILE_PATH",
    type: "string",
    completionType: "filename",
    help: "Output file name for env",
    default: path.join(__dirname, "output.env"),
  },
]

class Command {
  constructor() {
    autoBind(this)
    this.parser = dashdash.createParser({ options: OPTIONS })
  }

  parseOptions() {
    const opts = this.parser.parse(process.argv)

    if (opts.help) {
      this.outputHelp()
      process.exit(0)
    }

    if (opts.version) {
      console.log(packageJSON.version)
      process.exit(0)
    }

    if (!opts.output) {
      this.outputHelp()
      console.error("--output, -o, or ENV_OUTPUT_FILE_PATH is required")
      process.exit(1)
    }

    const outputFilePath = path.resolve(opts.output)

    return { outputFilePath }
  }

  die(error) {
    if (!error) {
      process.exit(0)
    }
    console.error(error.stack)
  }

  outputHelp() {
    console.error(`USAGE: ${packageJSON.name}`)
    console.error("options:")
    console.error(this.parser.help({ includeEnv: true, includeDefaults: true }).trimRight())
  }

  async run() {
    const { outputFilePath } = this.parseOptions()
    const meshbluConfig = new MeshbluConfig().generate()
    const bootstrapServices = new BootstrapServices({ meshbluConfig })
    const env = await bootstrapServices.run()
    await fs.writeFile(outputFilePath, jsonToEnv(env))
  }
}

if (require.main === module) {
  const command = new Command()
  sigtermHandler(async () => {
    command.die()
  })
  command.run()
} else {
  module.exports = Command
}
