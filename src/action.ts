import * as fs from 'fs'
import * as os from 'os'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as glob from 'glob'
// @ts-ignore
import * as path from 'path'

async function downloadUpx(): Promise<string> {
  const upx_version = '4.2.2'
  const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'upx-action-'))
  if (os.type() == 'Linux') {
    await exec.exec(
      'curl',
      [
        '-LO',
        `https://github.com/upx/upx/releases/download/v${upx_version}/upx-${upx_version}-amd64_linux.tar.xz`
      ],
      {cwd: tmpdir}
    )
    await exec.exec(
      'tar',
      [
        'xvJf',
        `upx-${upx_version}-amd64_linux.tar.xz`,
        '--strip-components=1',
        `upx-${upx_version}-amd64_linux/upx`
      ],
      {cwd: tmpdir}
    )
    return `${tmpdir}/upx`
  } else if (os.type() == 'Darwin') {
    await exec.exec(`brew install upx`)
    return 'upx'
  } else if (os.type() == 'Windows_NT') {
    await exec.exec(`choco install upx --no-progress --version=${upx_version}`)
    return 'upx'
  }
  throw 'unsupported OS'
}

function resolve(input: string): string[] {
  return input
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line)
    .reduce((paths: string[], pattern: string): string[] => {
      return paths.concat(
        glob.sync(pattern).filter(next => fs.lstatSync(next).isFile())
      )
    }, [])
}

export async function run(): Promise<void> {
  try {
    const paths = resolve(
      core.getInput('files', {required: false}) ||
        core.getInput('file', {required: true})
    )

    const args = core.getInput('args')
    const strip = core.getInput('strip') || 'true'
    const strip_args = core.getInput('strip_args')

    if (!paths || paths.length == 0) {
      core.error(`Path input: ${paths}`)
      core.setFailed(`No files found.`)
    }

    if (/true/i.test(strip)) {
      core.info('Running strip...')

      for (const file of paths) {
        const output = await exec.getExecOutput(`strip ${strip_args} ${file}`)
        core.debug(output.stdout)
        core.debug(output.stderr)
      }
    }

    core.info('Downloading UPX...')
    const upx_path = await downloadUpx()

    core.info('Running UPX...')

    for (const file of paths) {
      const output = await exec.getExecOutput(`${upx_path} ${args} ${file}`)
      core.debug(output.stdout)
      core.debug(output.stderr)
    }
  } catch (error: any) {
    core.setFailed(error.message)
    throw error
  }
}
