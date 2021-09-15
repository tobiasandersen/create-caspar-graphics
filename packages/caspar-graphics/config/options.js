const commandLineArgs = require('command-line-args')
const paths = require('./paths')
const packageJson = require(paths.appPackageJson)
const defaultOptions = packageJson['caspar-graphics']

const cmdOptions = commandLineArgs(
  [
    { name: 'mode', alias: 'm', type: String },
    { name: 'gzip', alias: 'z' },
    { name: 'host', alias: 'h', type: String },
    { name: 'port', alias: 'p', type: Number },
    { name: 'include', alias: 'i', type: String, multiple: true },
    { name: 'exclude', alias: 'e', type: String, multiple: true }
  ],
  { argv: process.argv }
)

if (cmdOptions.gzip !== 'both' && cmdOptions.gzip !== undefined) {
  cmdOptions.gzip = cmdOptions.gzip === null || cmdOptions.gzip === 'true'
}

const host = cmdOptions.host ?? process.env.HOST ?? '0.0.0.0'
const port =
  cmdOptions.port ?? process.env.PORT ? parseInt(process.env.PORT, 10) : 8080
const gzip = cmdOptions.gzip ?? defaultOptions?.gzip ?? false
const mode = cmdOptions.mode ?? defaultOptions?.mode ?? '1080p'
const size = mode.startsWith('720p')
  ? { width: 1280, height: 720 }
  : { width: 1920, height: 1080 }

module.exports = {
  host,
  port,
  mode,
  size,
  gzip,
  include: cmdOptions.includes,
  exclude: cmdOptions.excludes
}
