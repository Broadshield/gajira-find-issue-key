const core = require('@actions/core')
const Jira = require('../common/net/Jira')

module.exports = class {
    constructor({ githubEvent, argv, config }) {
        this.Jira = new Jira({
            baseUrl: config.baseUrl,
            token: config.token,
            email: config.email,
        })

        this.config = config
        this.argv = argv
        this.githubEvent = githubEvent
    }

    async execute() {
        const { argv } = this
        const projectKey = argv.project
        const issuetypeName = argv.issuetype

        // map custom fields
        const { projects } = await this.Jira.getCreateMeta({
            expand: 'projects.issuetypes.fields',
            projectKeys: projectKey,
            issuetypeNames: issuetypeName,
        }, '2')



        if (projects.length === 0) {
            core.error(`project '${projectKey}' not found`)

            return
        }
        const [project] = projects

        core.info(`Project Metadata: ${JSON.stringify(project, null, ' ')}`)

        if (project.issuetypes.length === 0) {
            core.error(`issuetype '${issuetypeName}' not found`)

            return
        }

        let providedFields = [{
            key: 'project',
            value: {
                key: projectKey,
            },
        }, {
            key: 'issuetype',
            value: {
                name: issuetypeName,
            },
        }, {
            key: 'summary',
            value: argv.summary,
        }]

        if (argv.description) {
            providedFields.push({
                key: 'description',
                value: argv.description,
            })
        }

        if (argv.fields) {
            providedFields = [...providedFields, ...this.transformFields(argv.fields)]
        }

        const payload = providedFields.reduce((acc, field) => {
            acc.fields[field.key] = field.value

            return acc
        }, {
            fields: {},
        })

        const issue = await this.Jira.createIssue(payload, '2')

        return { issue: issue.key }
    }

    transformFields(fieldsString) {
        const fields = JSON.parse(fieldsString)

        return Object.keys(fields).map(fieldKey => ({
            key: fieldKey,
            value: fields[fieldKey],
        }))
    }
}