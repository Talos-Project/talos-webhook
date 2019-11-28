# Talos CI
[![Maintainability](https://api.codeclimate.com/v1/badges/7bfaa50447194347659a/maintainability)](https://codeclimate.com/github/aspartame21/talos/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/7bfaa50447194347659a/test_coverage)](https://codeclimate.com/github/aspartame21/talos/test_coverage)


Talos CI is a webhook based application that is mainly focused on providing some extensions to existing platforms and automation for some events. 
Because of its high modularity, every use case is a plugin. You can choose one of the existing plugins:

- [talos-welcome](https://github.com/aspartame21/talos-welcome)
- [talos-blunderbuss](https://github.com/aspartame21/talos-blunderbuss)
- [talos-testrunner](https://github.com/aspartame21/talos-testrunner)
- [talos-lgtm](https://github.com/aspartame21/talos-lgtm)
- [talos-approve](https://github.com/aspartame21/talos-approve)
- [talos-caturday](https://github.com/aspartame21/talos-caturday)

Or you can implement functionality for your business needs by writing your plugin. For such case you can start from forking [talos-plugin-boilerplate](https://github.com/aspartame21/talos-plugin-boilerplate).

## Use cases

## Installation
### Node Environment
Talos requires [Node.js](https://nodejs.org) v8+ to run.

Clone the repo and cd into it
```bash
git clone https://github.com/aspartame21/talos.git talos && cd $_
```
Install dependencies
```bash
npm i
```
Build the project
```bash
npm run build
```
If you are using Gitlab install gitlab-client
```bash
npm i talos-gitlab-client
```
Install plugins you want to include to your project (optional)
```bash
npm i <plugin name>
```

### Docker Swarm

### Kubernetes

## Configuration
## Contribution


## License

[MIT](https://github.com/aspartame21/talos/blob/master/LICENSE)

---
_Copyright 2019 [Talos CI](https://github.com/aspartame21/talos/graphs/contributors)_
