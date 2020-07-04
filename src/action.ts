import * as fs from 'fs'
import * as os from 'os'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import download from 'download'
// @ts-ignore
import decompressTarxz from 'decompress-tarxz'
import * as path from 'path'

async function downloadUpx(): Promise<string> {
  const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'upx-action-'))
  if (os.type() == 'Linux') {
    await download(
      'https://github.com/upx/upx/releases/download/v3.96/upx-3.96-amd64_linux.tar.xz',
      tmpdir,
      {
        extract: true,
        plugins: [decompressTarxz()]
      }
    )
    const upx_path = `${tmpdir}/upx-3.96-amd64_linux/upx`
    fs.chmodSync(upx_path, '755')
    return upx_path
  } else if (os.type() == 'Darwin') {
    await exec.exec('brew install upx')
    return 'upx'
  } else if (os.type() == 'Windows_NT') {
    await download(
      'https://github.com/upx/upx/releases/download/v3.96/upx-3.96-win64.zip',
      tmpdir,
      {
        extract: true
      }
    )
    const upx_path = `${tmpdir}/upx-3.96-win64/upx.exe`
    return upx_path
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
      core.setFailed(`⛔ File ${file} wasn't found.`)
    }

    if (/true/i.test(strip)) {
      core.info('🏃 Running strip...')
      await exec.exec(`strip ${strip_args} ${file}`)
    }

    core.info('⬇️  Downloading UPX...')
    const upx_path = await downloadUpx()

    core.info('🏃 Running UPX...')
    await exec.exec(`${upx_path} ${args} ${file}`)
  } catch (error) {
    core.setFailed(error.message)
    throw error
  }
}
