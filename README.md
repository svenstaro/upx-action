# Strip and run UPX on executables [![GitHub Actions Workflow](https://github.com/svenstaro/upx-action/workflows/PR%20Checks/badge.svg)](https://github.com/svenstaro/upx-action/actions)

This action allows you to select an executable file which is then stripped and run through [upx](https://upx.github.io/) which drastically decreases the size of those executables.
It runs on all operating systems types offered by GitHub.

## Input variables

* `file`: The file you want to compress. It's compressed in-place. **required**
* `args`: Arguments to pass to UPX. *optional*
* `strip`: Whether or not "strip" symbols from object file (default `true`). *optional*
* `strip_args`: Arguments to pass to strip. *optional*

## Usage

This Action is meant to be ran on just-compiled executables in the same CI job.

Simple example:

```yaml
name: Publish

on:
  push:
    tags:
      - '*'

jobs:
  build:
    name: Publish binaries
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Build
      run: cargo build --release --locked
    - name: Compress binaries
      uses: svenstaro/upx-action@v2
      with:
        file: target/release/mything
```

Complex example with more operating systems and inputs:

```yaml
name: Publish

on:
  push:
    tags:
      - '*'

jobs:
  build:
    name: Publish binaries for ${{ matrix.os }}
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        include:
          - os: ubuntu-latest
            file: target/release/mything
            args: --better --lzma
            strip: true
          - os: windows-latest
            file: target/release/mything.exe
            args: -9
            strip: false
          - os: macos-latest
            file: target/release/mything
            args: --better
            strip: true
    steps:
    - uses: actions/checkout@v2
    - name: Build
      run: cargo build --release --locked
    - name: Compress binaries
      uses: svenstaro/upx-action@v2
      with:
        file: ${{ matrix.file }}
        args: ${{ matrix.args }}
        strip: ${{ matrix.strip }}
```
