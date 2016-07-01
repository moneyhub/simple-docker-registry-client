simple-docker-registry-client [![Downloads](https://img.shields.io/npm/dm/simple-docker-registry-client.svg)](https://npmjs.com/package/simple-docker-registry-client) [![NPM](https://img.shields.io/npm/v/simple-docker-registry-client.svg)](https://npmjs.com/package/simple-docker-registry-client) [![Github Issues](https://img.shields.io/github/license/momentumft/simple-docker-registry-client.svg)](https://github.com/momentumft/simple-docker-registry-client)
==================

> A simple docker registry client for Node

## Install

```sh
$ npm i --save simple-docker-registry-client
```

## Usage

At the moment this library only handles Basic and Digest authentication for the registry and doesn't wrap any endpoints.
It works with the official Docker Registry, other 3rd party services like Quay.io and any other custom V2 registry.

```javascript
import {registryRequest} from 'simple-docker-registry-client'

registryRequest('some/image/manifests/latest', {
  registry: 'https://registry-1.docker.io',
  credentials: {
    username: 'foo',
    password: 'bar',
  },
})
.then(manifest => {
  ...
})
```

## License

Licensed under the MIT License.

[View the full license here](https://raw.githubusercontent.com/momentumft/simple-docker-registry-client/master/LICENSE).
