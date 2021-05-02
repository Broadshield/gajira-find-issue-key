const { get } = require('lodash')

const serviceName = 'jira'
const client = require('./client')(serviceName)

class Jira {
  constructor({ baseUrl, token, email }) {
    this.baseUrl = baseUrl
    this.token = token
    this.email = email
  }

  async getCreateMeta(query, version = '2') {
    return this.fetch('getCreateMeta', { pathname: `/rest/api/${version}/issue/createmeta`, query })
  }

  async getUpdateMeta(query, version = '2') {
    return this.fetch('getUpdateMeta', { pathname: `/rest/api/${version}/issue/updatemeta`, query })
  }

  async createIssue(body, version = '2') {
    return this.fetch(
      'createIssue',
      { pathname: `/rest/api/${version}/issue` },
      { method: 'POST', body },
    )
  }

  async deleteIssue(issue, version = '3') {
    return this.fetch(
      'deleteIssue',
      { pathname: `/rest/api/${version}/issue/${issue}` },
      { method: 'DELETE' },
    )
  }

  async getIssue(issueId, query = {}, version = '2') {
    const { fields = [], expand = [] } = query

    try {
      const res = await this.fetch('getIssue', {
        pathname: `/rest/api/${version}/issue/${issueId}`,
        query: {
          fields: fields.join(','),
          expand: expand.join(','),
        },
      })

      return res
    } catch (error) {
      if (get(error, 'res.status') === 404) {
        return
      }

      throw error
    }
  }

  async getIssueTransitions(issueId, version = '2') {
    return this.fetch(
      'getIssueTransitions',
      {
        pathname: `/rest/api/${version}/issue/${issueId}/transitions`,
      },
      {
        method: 'GET',
      },
    )
  }

  async transitionIssue(issueId, data, version = '2') {
    return this.fetch(
      'transitionIssue',
      {
        pathname: `/rest/api/${version}/issue/${issueId}/transitions`,
      },
      {
        method: 'POST',
        body: data,
      },
    )
  }

  async fetch(apiMethodName, { host, pathname, query }, { method, body, headers = {} } = {}) {
    const urlFormat = new URL(host || this.baseUrl)
    urlFormat.port = 443
    urlFormat.pathname = pathname
    urlFormat.search = new URLSearchParams(query).toString()

    const url = urlFormat.href

    if (!method) {
      method = 'GET'
    }

    if (headers['Content-Type'] === undefined) {
      headers['Content-Type'] = 'application/json'
    }

    if (headers.Accept === undefined) {
      headers.Accept = 'application/json'
    }

    if (headers.Authorization === undefined) {
      headers.Authorization = `Basic ${Buffer.from(`${this.email}:${this.token}`).toString(
        'base64',
      )}`
    }

    // strong check for undefined
    // cause body variable can be 'false' boolean value
    if (body && headers['Content-Type'] === 'application/json') {
      body = JSON.stringify(body)
    }

    const state = {
      req: {
        method,
        headers,
        body,
        url,
      },
    }

    try {
      await client(state, `${serviceName}:${apiMethodName}`)
    } catch (error) {
      const fields = {
        originError: error,
        source: 'jira',
      }

      delete state.req.headers

      throw Object.assign(
        new Error(`Jira API error: ${error}, ${JSON.stringify(state, null, ' ')}`),
        state,
        fields,
      )
    }

    return state.res.body
  }
}

module.exports = Jira
