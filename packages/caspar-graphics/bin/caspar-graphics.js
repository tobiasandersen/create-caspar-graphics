#!/usr/bin/env node

await import('../src/node/cli.js')
try {
} catch (err) {
  console.log(err)
}
// import { cac } from 'cac'
// import chalk from 'chalk'
//
// const cli = cac('caspar-graphics')
//
// // Start
// cli
//   .command('[root]', 'start dev server')
//   .option('--host', 'Specify which IP addresses the server should listen on.')
//   .action(async (root, options) => {
//      try {
//       const { createServer } = await import('./start.js')
//       // const server = await createServer({ host: options.host })
//       // await server.listen()
//       //
//       // console.log(chalk.green('Caspar Graphics v1.0.0'))
//       // server.printUrls()
//     } catch (e) {
//       console.log(k)
//       process.exit(1)
//     }
//   })
//
// cli.help()
// cli.version('1.0.0')
// cli.parse()
//
// const script = process.argv[2]
// const args = process.argv.slice(3)
//
// if (script !== 'build' && script !== 'start') {
//   return
// }
//
// const result = spawn.sync(
//   'node',
//   [require.resolve('./' + script)].concat(args),
//   { stdio: 'inherit' }
// )
//
// if (!result.signal) {
//   process.exit(result.status)
// }
//
// if (result.signal === 'SIGKILL') {
//   console.log(
//     'The build failed because the process exited too early. ' +
//       'This probably means the system ran out of memory or someone called ' +
//       '`kill -9` on the process.'
//   )
// } else if (result.signal === 'SIGTERM') {
//   console.log(
//     'The build failed because the process exited too early. ' +
//       'Someone might have called `kill` or `killall`, or the system could ' +
//       'be shutting down.'
//   )
// }
//
// process.exit(1)
