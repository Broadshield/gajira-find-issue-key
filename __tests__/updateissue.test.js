const core = require('@actions/core')
const { config, projectKey, argv, githubEvent } = require('./config/constants')
const UpdateIssue = require('../src/lib/UpdateIssue')

describe('jira Ticket Update', () => {
  it('update a ticket', async () => {
    expect.hasAssertions()
    const j = new UpdateIssue({ githubEvent, argv, config })
    const result = await j.execute()
    expect(result.issue.substr(0, projectKey.length)).toStrictEqual(projectKey)
    core.info(`Updated issue ${result.issue}`)
  })
})
