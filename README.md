# Strip and run UPX on executables [![GitHub Actions Workflow](https://github.com/svenstaro/upx-action/workflows/PR%20Checks/badge.svg)](https://github.com/svenstaro/upx-action/actions)

This action allows you to select an executable file which is then stripped and run through [upx](https://upx.github.io/) which drastically decreases the size of those executables.
It runs on all operating systems types offered by GitHub.

## Input variables

You must provide:

- `file`: The file you want to compress. It's compressed in-place.

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
    - uses: hecrj/setup-rust-action@v1-release
      with:
        rust-version: stable
    - uses: actions/checkout@v1
    - name: Build
      run: cargo build --release --locked
    - name: Compress binaries
      uses: svenstaro/upx-action@v1-release
      with:
        file: target/release/mything
```
