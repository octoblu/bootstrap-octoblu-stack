const autoBind = require("auto-bind")

class Bootstrap {
  constructor() {
    autoBind(this)
  }
}

module.exports = Bootstrap
