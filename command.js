const OctoDash = require("octodash")
const sigtermHandler = require("sigterm-handler")
const startServer = require("./lib/server")
const packageJSON = require("./package.json")
const MeshbluConfig = require("meshblu-config")
const path = require("path")

const CLI_OPTIONS = [
  {
    names: ["port", "p"],
    type: "number",
    env: "PORT",
    required: true,
    default: 80,
    help: "Port to run webservice on",
    helpArg: "NUMBER",
  },
  {
    names: ["output", "o"],
    env: "ENV_OUTPUT_FILE_PATH",
    type: "string",
    completionType: "filename",
    help: "Output file name for env",
    default: path.join(__dirname, "data", "output.env"),
  },
]

class Command {
  constructor({ argv }) {
    this.octoDash = new OctoDash({
      argv: argv,
      cliOptions: CLI_OPTIONS,
      name: packageJSON.name,
      version: packageJSON.version,
    })
  }

  run() {
    const { port, output } = this.octoDash.parseOptions()
    const meshbluConfig = new MeshbluConfig().generate()
    const server = startServer(
      {
        port,
        meshbluConfig,
        outputFilePath: output,
      },
      error => {
        if (error) throw error
      },
    )
    sigtermHandler(() => {
      server.close()
      return Promise.resolve()
    })
  }
}

new Command({ argv: process.argv }).run()
