# runa

Process manager for developement with a web interface.

:warning: work-in-progress

## Installation

```
npm install runa --save-dev
```

## Usage

Define tasks in `package.json`
```json
{
  "runa": {
    "tasks": [
      ["node", "--version"],
      "npm --version"
    ]
  }
}
```

Then run
```
runa
```
