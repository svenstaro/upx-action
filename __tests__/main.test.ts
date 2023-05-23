import * as fs from 'fs'
import * as os from 'os'
import * as exec from '@actions/exec'
import * as path from 'path'
import {run} from '../src/action'

beforeAll(async () => {
  const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'upx-action-'))
  console.log(tmpdir)
  if (os.type() == 'Linux') {
    await exec.exec(
      'curl',
      [
        '-LO',
        'https://github.com/svenstaro/proxyboi/releases/download/0.1.5/proxyboi-linux-amd64'
      ],
      {cwd: tmpdir}
    )
    fs.chmodSync(`${tmpdir}/proxyboi-linux-amd64`, '755')
    process.env['INPUT_FILES'] = `${tmpdir}/proxyboi-linux-amd64`
  } else if (os.type() == 'Darwin') {
    await exec.exec(
      'curl',
      [
        '-LO',
        'https://github.com/svenstaro/proxyboi/releases/download/0.1.5/proxyboi-macos-amd64'
      ],
      {cwd: tmpdir}
    )
    fs.chmodSync(`${tmpdir}/proxyboi-macos-amd64`, '755')
    process.env['INPUT_FILES'] = `${tmpdir}/proxyboi-macos-amd64`
  } else if (os.type() == 'Windows_NT') {
    await exec.exec(
      'curl',
      [
        '-LO',
        'https://github.com/svenstaro/proxyboi/releases/download/0.1.5/proxyboi-windows-amd64.exe'
      ],
      {cwd: tmpdir}
    )
    process.env['INPUT_FILES'] = `${tmpdir}/proxyboi-windows-amd64.exe`
  }
})

describe('UPX Action', () => {
  it('can compress stuff', async () => {
    const file_path = process.env['INPUT_FILES'] as string
    const old_size = fs.statSync(file_path).size
    await run()
    const new_size = fs.statSync(file_path).size
    expect(new_size).toBeLessThan(old_size)
  })
})
