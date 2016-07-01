import fetch from 'node-fetch'
import parsers from 'www-authenticate/lib/parsers'

function basicAuth(username, password) {
  return `Basic ${new Buffer(`${username}:${password}`).toString('base64')}`
}

function tryJSON(input, url = '') {
  try {
    return JSON.parse(input)
  } catch (ex) {
    throw new Error('Cannot parse JSON from ' + input + ' for ' + url)
  }
}

async function getToken(challenge, creds) {
  const res = await fetch(`${challenge.parms.realm}?service=${challenge.parms.service}&scope=${challenge.parms.scope}`, {
    headers: {
      'Authorization': basicAuth(creds.username, creds.password),
    },
  })

  if (res.status === 401) {
    throw new Error('Invalid authentication')
  }

  return (await res.json()).token
}

async function registryRequest(endpoint, opts) {
  const creds = opts.credentials
  const url = `${opts.registry}/v2/${endpoint}`

  const initialAuth = creds != null
    ? basicAuth(creds.username, creds.password)
    : undefined

  let res = await fetch(url, {
    headers: {
      'Authorization': initialAuth,
      'Content-Type': 'application/vnd.docker.distribution.manifest.list.v2+json',
    },
  })

  if (res.status === 401) {
    const authChallenge = new parsers.WWW_Authenticate(res.headers.get('WWW-Authenticate'))

    if (authChallenge.scheme === 'Basic') {
      throw new Error('Invalid authentication')
    } else if (authChallenge.scheme === 'Bearer') {
      if (!creds) {
        throw new Error('No credentials provided but are required by the registry')
      }

      const token = await getToken(authChallenge, creds)

      res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/vnd.docker.distribution.manifest.list.v2+json',
        },
      })

      if (res.status === 401) {
        throw new Error('Access denied')
      }
    }
  }

  if (res.status === 404) {
    const err = {
      body: tryJSON(await res.text(), url),
    }

    throw err
  }

  return tryJSON(await res.text(), url)
}

export {registryRequest}
