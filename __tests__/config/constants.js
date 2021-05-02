export const auth = { email: process.env.JIRA_EMAIL, token: process.env.JIRA_TOKEN }
export const baseUrl = process.env.JIRA_BASE_URL
export const config = {
  ...auth,
  baseUrl,
}
export const projectKey = 'UNICORN'
export const issuetypeName = 'Task'
export const argv = {
  project: projectKey,
  issuetype: issuetypeName,
  summary: 'GAJIRA This is a summary ref/head/blah',
  description: 'This is a description ref/head/blah',
  fields: '{"customfield_10027":{"value":"API"},"fixVersions":[{"name":"2.16.0 - API"}] }',
}

export const githubEvent = {}
