const { baseUrl, auth } = require('./config/constants')

describe('validate that jira variables exist', () => {
  it('check for Jira Environment Variables', () => {
    expect.hasAssertions()
    expect(baseUrl).toBeTruthy()
    expect(auth.token).toBeTruthy()
    expect(auth.email).toBeTruthy()
  })
  it('jira Base Url uses HTTPS', () => {
    expect.hasAssertions()
    expect(baseUrl.substr(0, 5)).toStrictEqual('https')
  })
})
