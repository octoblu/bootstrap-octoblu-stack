const server = require("server")
const { get, post } = server.router
const { doBootstrap } = require("./bootstrap")

const startServer = ({ port = 80, meshbluConfig, outputFilePath }) => {
  // Launch server with options and a couple of routes
  const security = {
    csrf: false,
  }
  server({ port, security }, [
    get("/healthcheck", () => '{"online": true}'),
    post("/bootstrap", () => {
      return doBootstrap({ outputFilePath, meshbluConfig })
    }),
  ])
  return server
}

module.exports = startServer
