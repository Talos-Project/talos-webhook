# Talos CI
[![Docker Image CI](https://github.com/aspartame21/talos/workflows/Docker%20Image%20CI/badge.svg)](https://github.com/aspartame21/talos/packages/)
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

Or you can implement functionality for your business needs by writing your plugin. For such a case, you can start from forking [talos-plugin-boilerplate](https://github.com/aspartame21/talos-plugin-boilerplate).

## Getting Started

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
Following the [guide](#Configuration) configure the project and run
```bash
npm start
```

### Docker
Make sure you are logged in to docker.pkg.github.com from docker-cli. If you don't generate a Github OAuth token and use the following command to login
```bash
docker login docker.pkg.github.com -u <Github Username> -p <Github OAuth token>
```
Prepare the [config file](#Configuration) and run the following command
``` bash
docker run -v "$PWD/.config.yaml:/usr/src/app/.config.yaml" -p 3000:3000 docker.pkg.github.com/aspartame21/talos/talos-webhook-full
```

## Configuration
Create a file with name `.talos.yaml` and populate it with values. You can see all the [configuration options](#Configuration-Options) bellow.

### Configuration Options
Name | Description | Default Value
--- | --- | ---
git.client | Git Client Provider | talos-gitlab-client
git.host | Host of git server | https://gitlab.com/
git.token |  OAuth Token to perform actions | -
plugins | Plugins for webhook | []
> **Tip:**
> You can use `.talos.example.yaml` file as a reference

## Contribution
If you want to help the project grab an issue and send us a pull request :wink:

## Support
If you have any questions file an [issue](https://github.com/aspartame21/talos/issues) or join our [slack workspace](https://join.slack.com/t/talos-project/shared_invite/enQtODUyMTAyMDAzMzAwLTliNmNhZTk0NGQ0OTA4MGNlYTdiZDk2ZDEzMmI3NjJjZWUyNTNkYjU4ODE1NjI1NWYyNTk3MDA3MWU2MzRhODY).

## License

[MIT](https://github.com/aspartame21/talos/blob/master/LICENSE)

---
_Copyright 2019 [Talos CI](https://github.com/aspartame21/talos/graphs/contributors)_
