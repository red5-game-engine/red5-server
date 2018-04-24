#!/usr/bin/env node
import * as cla from 'command-line-args'
import { OptionDefinition } from 'command-line-args'
import * as glob from 'glob'
import * as fs from 'fs'
import * as path from 'path'
import * as cp from 'child_process'
process.argv.push('--color')
import chalk from 'chalk'

const copyDir = require('copy-dir')

const error = chalk.bold.red
const warning = chalk.bold.yellow
const info = chalk.bold.cyan

interface CreateOptions {
  project: string
  type: 'typescript' | 'javascript'
}

const mainDefinitions: OptionDefinition[] = [
  { name: 'command', defaultOption: true },
  { name: 'version', alias: 'v', defaultValue: '1' }
]

const mainOptions = cla(mainDefinitions, { stopAtFirstUnknown: true } as any)
let argv = mainOptions._unknown || []
if (mainOptions.version === null) {
  let json = require(path.join(__dirname, '../../package.json'))
  console.log(json.version)
} else {
  try {
    switch (mainOptions.command) {
      case 'create':
        const createDefinitions: OptionDefinition[] = [
          { name: 'project', defaultOption: true },
          { name: 'type', defaultValue: 'typescript', type: String }
        ]
        const createOptions: CreateOptions = cla(createDefinitions, { argv, stopAtFirstUnknown: true } as any)
        argv = mainOptions._unknown || []
        makeNewProject(createOptions)
        break
      case 'serve':
        let pkg = require(path.join(process.cwd(), './package.json'))
        let main: string = pkg.main || ''
        if (main.length == 0) throw new Error('project.json requires a "main" property')
        cp.spawn('node', [main], { cwd: process.cwd() })
        break
      default:
        console.log(error('Missing command'))
        console.log('  red5 <command> [options]')
        break
    }
  } catch (e) {
    console.log(error(e.message))
  }
}
function makeNewProject(createOptions: CreateOptions) {
  let project = createOptions.project
  let type = createOptions.type
  type = ['javascript', 'typescript'].includes(type) ? type : 'typescript'
  let cwd = process.cwd()
  let projectDir = path.join(cwd, project)
  fs.stat(projectDir, (err, stats) => {
    if (err) {
      // Could not find the directory, lets create a new one
      return makeProject(projectDir, type)
    }
    if (process.platform == 'win32') {
      // Windows does not allow for files and directories to be named the same
      if (stats.isDirectory() || stats.isFile()) {
        // The stats of the path is a directory, we can't overwrite it
        return console.log(error(`The project "${project}" already exists, delete the directory and run the command again`))
      } else {
        return makeProject(projectDir, type)
      }
    } else {
      if (stats.isDirectory()) {
        // The stats of the path is a directory, we can't overwrite it
        return console.log(error(`The project "${project}" already exists, delete the directory and run the command again`))
      } else {
        // The stats of the path is a file, we can make a new project
        return makeProject(projectDir, type)
      }
    }
  })
}

async function makeProject(projectDir: string, type: 'typescript' | 'javascript') {
  console.log(info(`Creating project at: ${projectDir}`))
  console.log(info('Creating directory...'))
  fs.mkdirSync(projectDir)

  console.log(info(`Copying the ${type} boilerplate files...`))
  let root = path.join(__dirname, '../../boilerplate')
  if (type == 'typescript') {
    copyDir.sync(path.join(__dirname, '../../boilerplate/typescript'), projectDir)
  } else if (type == 'javascript') {
    let root = path.join(__dirname, '../../boilerplate/typescript')
    let files = glob.sync(path.join(root, '**/*.ts'), { cwd: projectDir }).map(f => `"${f}"`)
    if (files.length > 0) {
      try {
        cp.execSync('tsc --target es2016 --module commonjs --outDir "' + projectDir + '/server" ' + files.join(' '))
      } catch (e) { }
    }
  }
  await copyFile(path.join(root, 'package.json'), path.join(projectDir, 'package.json'))

  console.log(info('Installing the required node modules...'))
  let npmInstall = cp.exec('npm install --color always', { cwd: projectDir })
  npmInstall.stdout.on('data', (data) => console.log(data))
  npmInstall.stderr.on('data', (data) => console.log(data))
  npmInstall.on('exit', () => {
    if (type == 'typescript') {
      console.log(info('Compiling TypeScript files...'))
      let tsc = cp.exec('tsc -p . --pretty', { cwd: projectDir })
      tsc.stdout.on('data', (data) => console.log(data))
      tsc.stderr.on('data', (data) => console.log(data))
    }
  })
}

async function copyFile(from: string, to: string) {
  return new Promise(resolve => {
    fs.createReadStream(from)
      .pipe(fs.createWriteStream(to))
      .on('close', () => resolve())
  })
}