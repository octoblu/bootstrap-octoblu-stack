const autoBind = require("auto-bind")
const dashdash = require("dashdash")
const sigtermHandler = require("sigterm-handler")
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

    return {}
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
    const {} = this.parseOptions()
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
