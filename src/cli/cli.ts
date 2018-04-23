let args = process.argv
args.shift()
let command = (args.shift() || '').toLowerCase() as string

function makeNewProject(projectName: string) {
  console.log(process.cwd())
}

switch (command) {
  case 'create':
    let projectName = args.shift() || ''
    makeNewProject(projectName)
    break
}