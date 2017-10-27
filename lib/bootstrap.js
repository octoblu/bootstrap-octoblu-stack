const autoBind = require("auto-bind")
const Services = require("./services")

class Bootstrap {
  constructor({ meshbluConfig, services }) {
    autoBind(this)
    this.services = new Services({ meshbluConfig, services })
  }

  run() {
    return this.services.run()
  }
}

module.exports = Bootstrap
