import path from 'path'
import fs from 'fs'
import url from 'url'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = relativePath => path.resolve(appDirectory, relativePath)
const resolveOwn = relativePath => path.resolve(__dirname, '..', relativePath)

const nodePaths = (process.env.NODE_PATH || '')
  .split(process.platform === 'win32' ? ';' : ':')
  .filter(Boolean)
  .filter(folder => !path.isAbsolute(folder))
  .map(resolveApp)

const appPath = resolveApp('.')
const appNodeModules = resolveApp('node_modules')

export default {
  appPath,
  appNodeModules,
  appBuild: resolveApp('dist'),
  appPackageJson: resolveApp('package.json'),
  appTemplates: resolveApp('templates'),
  graphicsKit: resolveOwn('../graphics-kit'),
  ownPath: resolveOwn('.'),
  ownPackageJson: resolveOwn('package.json'),
  ownNodeModules: resolveOwn('node_modules'),
  useYarn: fs.existsSync(path.join(appPath, 'yarn.lock')),
  viteBuild: path.join(appNodeModules, '.caspar-graphics', 'build')
}
