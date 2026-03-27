import {playwrightLauncher} from '@web/test-runner-playwright'

export default {
  files: 'test/specs/*.js',
  browsers: [playwrightLauncher({
    product: 'chromium',
    launchOptions: {
      executablePath: process.env.CHROMIUM_PATH,
      args: ['--no-sandbox']
    }
  })],
  nodeResolve: true,
  plugins: [
    {
      name: 'cjs-default-export',
      transform (context) {
        if (context.path.includes('node_modules/jquery')) {
          return {body: context.body + '\nexport default window.jQuery;\n'}
        }
      }
    }
  ],
}
