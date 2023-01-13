import { rollup, InputOptions, OutputOptions } from 'rollup'
// @ts-ignore
import rollupPluginTypescript from 'rollup-plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'


const CompileTsServiceWorker = () => ({
  name: 'compile-typescript-service-worker',
  async writeBundle() {
    const inputOptions: InputOptions = {
      input: 'src/sw-custom.ts',
      plugins: [rollupPluginTypescript(), nodeResolve()],
    }
    const outputOptions: OutputOptions = {
      file: 'build/custom-sw.js',
      format: 'es',
    }
    const bundle = await rollup(inputOptions)
    await bundle.write(outputOptions)
    await bundle.close()
  }
})

export default CompileTsServiceWorker;