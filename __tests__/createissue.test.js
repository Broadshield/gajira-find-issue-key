const core = require('@actions/core')
const { config, projectKey, argv, githubEvent } = require('./config/constants')
const CreateIssue = require('../src/lib/CreateIssue')

describe('jira Ticket Creation', () => {
  it('create a ticket', async () => {
    expect.hasAssertions()
    const j = new CreateIssue({ githubEvent, argv, config })
    const result = await j.execute()
    expect(result.issue.substr(0, projectKey.length)).toStrictEqual(projectKey)
    core.info(`Created issue ${result.issue}`)
  })
})
