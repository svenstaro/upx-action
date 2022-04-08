# Strip and run UPX on executables [![GitHub Actions Workflow](https://github.com/svenstaro/upx-action/workflows/PR%20Checks/badge.svg)](https://github.com/svenstaro/upx-action/actions)

This action allows you to select an executable file which is then stripped and run through [upx](https://upx.github.io/) which drastically decreases the size of those executables.
It runs on all operating systems types offered by GitHub.

## Input variables

* `files`: Newline-delimited list of path globs for files to compress. It's compressed in-place. *either files or file requred*
* `file`: The file you want to compress. It's compressed in-place.  
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
    - name: Compress binaries using glob
      uses: svenstaro/upx-action@v2
      with:
        files: |
          target/release/mything
          target/release/*
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
            args: --best --lzma
            strip: true
          - os: windows-latest
            file: target/release/mything.exe
            args: -9
            strip: false
          - os: macos-latest
            file: target/release/mything
            args: --best
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

## Releasing and publishing

The instructions below are only relevant to maintainers of this Action.

- Sadly there's some manual work involved whenever lzma-native is updated.
  After running `npm run all`, it's necessary to fetch prebuilt binaries
from https://node-pre-gyp.addaleax.net/lzma-native/ and extract the prebuilt
bindings into `node_modules/lzma-native`.
For the same reason, we can't use ncc as that only supports a single
platform but we need to support all platforms at once!
- Make sure `CHANGELOG.md` is up-to-date.
- `git tag -sm <version> <version>`
- `git push --tags`
- Make a release at https://github.com/svenstaro/upx-action/releases/new and copy the `CHANGELOG.md` contents there.
