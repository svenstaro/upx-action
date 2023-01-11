import * as fs from 'fs'
import * as os from 'os'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
// @ts-ignore
import * as path from 'path'

async function downloadUpx(): Promise<string> {
  const upx_version = '4.0.1'
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
    await exec.exec('brew install upx')
    return 'upx'
  } else if (os.type() == 'Windows_NT') {
    await exec.exec('choco install upx')
    return 'upx'
  }
  throw 'unsupported OS'
}

export async function run(): Promise<void> {
  try {
    const file = core.getInput('file', {required: true})
    const args = core.getInput('args')
    const strip = core.getInput('strip') || 'true'
    const strip_args = core.getInput('strip_args')

    if (!fs.existsSync(file)) {
      core.setFailed(`File ${file} wasn't found.`)
    }

    if (/true/i.test(strip)) {
      core.info('Running strip...')
      await exec.exec(`strip ${strip_args} ${file}`)
    }

    core.info('Downloading UPX...')
    const upx_path = await downloadUpx()

    core.info('Running UPX...')
    await exec.exec(`${upx_path} ${args} ${file}`)
  } catch (error: any) {
    core.setFailed(error.message)
    throw error
  }
}
