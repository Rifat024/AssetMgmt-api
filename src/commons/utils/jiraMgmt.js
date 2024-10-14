import { log } from './logger';

const JiraClient = require('jira-client');

export const connectJira = async (recordObj) => {
    const config = {
        protocol: 'https',
        host: `${recordObj?.jiraHost}.atlassian.net`,
        username: recordObj?.jiraUsername,
        password: recordObj?.jiraPassword,
        apiVersion: '3',
        strictSSL: true
    }
    log.debug(`Config--->${JSON.stringify(config)}`)
    return new JiraClient(config);
}