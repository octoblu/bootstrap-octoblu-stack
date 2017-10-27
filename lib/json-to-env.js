const join = require("lodash/fp/join")
const pipe = require("lodash/fp/pipe")
const objectMap = require("lodash/fp/map").convert({ cap: false })

module.exports = pipe(objectMap((value, key) => `${key}=${value}`), join("\n"))
