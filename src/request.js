import fetch from 'node-fetch'
import https from 'https'
import parsers from 'www-authenticate/lib/parsers'

function req(url, opts) {
  const agent = new https.Agent({
    rejectUnauthorized: opts.allowUnauthorized !== true,
  })

  return fetch(url, {
    ...opts,
    agent,
  })
}

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

async function getToken(challenge, creds, opts) {
  const auth = creds != null
    ? basicAuth(creds.username, creds.password)
    : undefined

  const res = await req(`${challenge.parms.realm}?service=${challenge.parms.service}&scope=${challenge.parms.scope}`, {
    headers: {
      'Authorization': auth,
    },
    allowUnauthorized: opts.allowUnauthorized,
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

  let res = await req(url, {
    headers: {
      'Authorization': initialAuth,
    },
    allowUnauthorized: opts.allowUnauthorized,
  })

  if (res.status === 401) {
    const authChallenge = new parsers.WWW_Authenticate(res.headers.get('WWW-Authenticate'))

    if (authChallenge.scheme === 'Basic') {
      throw new Error('Invalid authentication')
    } else if (authChallenge.scheme === 'Bearer') {
      const token = await getToken(authChallenge, creds, opts)

      res = await req(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        allowUnauthorized: opts.allowUnauthorized,
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
