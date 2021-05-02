const github = require('@actions/github')
const core = require('@actions/core')

const githubToken = core.getInput('token') || core.getInput('github-token')

export const octokit = github.getOctokit(githubToken)

export const { context } = github
export async function getPreviousReleaseRef(octo) {
  if (!context.repository || !octo) {
    return
  }
  const releases = await octo.repos.getLatestRelease({
    ...context.repo,
  })

  const { tag_name } = releases.payload

  return tag_name
}

export function upperCaseFirst(str) {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1))
}

export const issueIdRegEx = /([a-zA-Z0-9]+-[0-9]+)/g

export const startJiraToken = 'JIRA-ISSUE-TEXT-START'
export const endJiraToken = 'JIRA-ISSUE-TEXT-END'

export const eventTemplates = {
  branch: '{{event.ref}}',
  commits: "{{event.commits.map(c=>c.message).join(' ')}}",
}

export function assignJiraTransition(_context, _argv) {
  if (_context.eventName === 'pull_request') {
    if (_context.payload.action in ['closed'] && _context.payload.pull_request.merged === 'true') {
      return _argv.transitionOnPrMerge
    } else if (_context.payload.action in ['opened']) {
      return _argv.transitionOnPrOpen
    }
  } else if (_context.eventName === 'pull_request_review') {
    if (_context.payload.state === 'APPROVED') {
      return _argv.transitionOnPrApproval
    }
  } else if (_context.eventName in ['create']) {
    return _argv.transitionOnNewBranch
  }
}

export function assignRefs(_githubEvent, _context, _argv) {
  let headRef, baseRef
  if (Object.prototype.hasOwnProperty.call(_githubEvent, 'pull_request')) {
    headRef = _githubEvent.pull_request.head.ref || null
    baseRef = _githubEvent.pull_request.base.ref || null
  } else if (Object.prototype.hasOwnProperty.call(_githubEvent, 'ref')) {
    headRef = _githubEvent.ref || null
    baseRef = null
  }
  if (_context.eventName === 'pull_request') {
    headRef = headRef || _context.payload.pull_request.head.ref || null
    baseRef = baseRef || _context.payload.pull_request.base.ref || null
  } else if (_context.eventName === 'push') {
    if (_context.payload.ref.startsWith('refs/tags')) {
      baseRef = baseRef || getPreviousReleaseRef(github)
    }
    headRef = headRef || _context.payload.ref || null
  }
  headRef = _argv.headRef || headRef || null
  baseRef = _argv.baseRef || baseRef || null
  return { headRef, baseRef }
}
