#!/usr/bin/env node
import * as cla from 'command-line-args'
import { OptionDefinition } from 'command-line-args'
import * as fs from 'fs'
import * as path from 'path'
import * as cp from 'child_process'

const console = require('better-console')
const copydir = require('copy-dir')

const mainDefinitions: OptionDefinition[] = [
  { name: 'command', defaultOption: true }
]

const mainOptions = cla(mainDefinitions, { stopAtFirstUnknown: true } as any)
let argv = mainOptions._unknown || []

let command = mainOptions.command

switch (command) {
  case 'create':
    const createDefinitions: OptionDefinition[] = [
      { name: 'project', defaultOption: true },
      { name: 'type', defaultValue: 'javascript', type: String }
    ]
    const createOptions = cla(createDefinitions, { argv, stopAtFirstUnknown: true } as any)
    argv = mainOptions._unknown || []
    let project = createOptions.project
    let type = createOptions.type
    makeNewProject(project, type)
    break
}

let project = mainOptions._unknown[0]

function makeNewProject(project: string, type = 'javascript') {
  type = ['javascript', 'typescript'].includes(type) ? type : 'javascript'
  let cwd = process.cwd()
  let projectDir = path.join(cwd, project)
  fs.stat(projectDir, (err, stats) => {
    if (err) {
      // Could not find the directory, lets create a new one
      return makeProject(projectDir, type)
    }
    // FIXME: Unix allows for files and folders to be same name, Windows does not
    if (stats.isDirectory() || stats.isFile()) {
      // The stats of the path is a directory, we can't overwrite it
      return console.error(`The project "${project}" already exists, delete the directory and run the command again`)
    }
    if (stats.isFile()) {
      // The stats of the path is a file, we can make a new project
      return makeProject(projectDir, type)
    }
  })
}

function makeProject(projectDir: string, type: string) {
  console.info(`Creating project at: ${projectDir}`)
  console.info(`Creating directory...`)
  fs.mkdirSync(projectDir)

  console.info(`Copying the ${type} boilerplate files...`)
  copydir.sync(path.join(__dirname, '../../boilerplate', type), projectDir)

  console.info(`Installing the required node modules...`)
  let npmInstall = cp.exec(`cd ${projectDir} && npm install`)
  npmInstall.stdout.on('data', (data) => console.log(data.toString()))
  npmInstall.stderr.on('data', (data) => console.error(data.toString()))
}