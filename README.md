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

Then run `runa` and `open http://127.0.0.1:8008`.
