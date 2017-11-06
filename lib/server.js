const server = require("server")
const { post } = server.router
const { doBootstrap } = require("./bootstrap")

const startServer = ({ port = 80, meshbluConfig, outputFilePath }) => {
  // Launch server with options and a couple of routes
  const security = {
    csrf: false,
  }
  server({ port, security }, [
    post("/bootstrap", () => {
      return doBootstrap({ outputFilePath, meshbluConfig })
    }),
  ])
  return server
}

module.exports = startServer
