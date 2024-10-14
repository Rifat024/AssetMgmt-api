import { Types } from "mongoose";
import { AppConfig } from "../commons/environment/appconfig";
import { apiError, apiResponse } from "../commons/http-helpers/api-response";
import { log } from "../commons/utils/logger";
import { createJiraIssuesCore, updateJiraIssueCore } from "../handler/jiraMgmt/jiraIssueMgmt";
import { createJiraTasksCore } from "../handler/jiraMgmt/jiraTaskMgmt";
const axios = require('axios');

export const snsCreateJiraIssue = async (record) => {
    try {
        let recordObj = JSON.parse(record['Records'][0].Sns.Message);
        log.debug(`Request body of SNS--->${JSON.stringify(recordObj)}`);
        let addListObj = [];
        let addTaskList = [];
        for (const issueKey of recordObj?.keyList) {
            const url = `https://${recordObj?.jiraHost}.atlassian.net/rest/api/2/issue/${issueKey}`;
            const auth = 'Basic ' + Buffer.from(recordObj?.jiraUsername + ':' + recordObj?.jiraPassword).toString('base64');

            const result = await axios.get(url, {
                headers: {
                    'Authorization': auth
                },
                // params: {
                //     fields: 'summary,assignee,status,description,issuetype,created,updated,priority'
                // }
            }
            ).then(response => {
                log.debug(`axios Response-->${response}`);
                return {
                    type: AppConfig.API_RESPONSE.SUCCESS,
                    payload: response.data,
                    statusCode: response?.status ?? 200
                }
            }).catch(error => {
                log.debug(`Error in axios--->${error}`)
                return {
                    type: AppConfig.API_RESPONSE.FAILED,
                    payload: error.response.data,
                    statusCode: error.response.status ?? 500
                }
            });
            log.debug(`result---->${JSON.stringify(result)}`);
            // if (result?.payload?.fields?.issuetype?.name === 'Story') {
            let issueObj = {
                _id: new Types.ObjectId(),
                companyId: recordObj?.companyId,
                createdBy: recordObj?.createdBy,
                application: recordObj?.application,
                jiraProject: recordObj?.jiraProject,
                key: result?.payload?.key,
                name: result?.payload?.name,
                issueId: result?.payload?.id,
                issueData: result?.payload
            }
            addListObj.push(issueObj);
            // } else if (result?.payload?.fields?.issuetype?.name === 'Task') {
            //     const createObj = {
            //         companyId: recordObj?.companyId,
            //         createdBy: recordObj?.createdBy,
            //         jiraProject: recordObj?.jiraProject,
            //         jiraIssue: issueObj?._id,
            //         key: result?.payload?.key,
            //         taskData: result?.payload,
            //         issueId: result?.payload?.id
            //     }
            //     log.debug(`createObj---->${JSON.stringify(createObj)}`);
            //     addTaskList.push(createObj);
            // }
            if (
                // result?.payload?.fields?.issuetype?.name === 'Story' &&
                result?.payload?.fields?.subtasks &&
                result?.payload?.fields?.subtasks?.length !== 0) {
                for (const task of result?.payload?.fields?.subtasks) {
                    const taskUrl = `https://${recordObj?.jiraHost}.atlassian.net/rest/api/2/issue/${task?.key}`;
                    // const auth = 'Basic ' + Buffer.from(recordObj?.jiraUsername + ':' + recordObj?.jiraPassword).toString('base64');

                    const taskDetails = await axios.get(taskUrl, {
                        headers: {
                            'Authorization': auth
                        },
                        // params: {
                        //     fields: 'summary,assignee,status,description,issuetype,created,updated,priority'
                        // }
                    }
                    ).then(response => {
                        log.debug(`axios Response-->${response}`);
                        return {
                            type: AppConfig.API_RESPONSE.SUCCESS,
                            payload: response.data,
                            statusCode: response?.status ?? 200
                        }
                    }).catch(error => {
                        log.debug(`Error in axios--->${error}`)
                        return {
                            type: AppConfig.API_RESPONSE.FAILED,
                            payload: error.response.data,
                            statusCode: error.response.status ?? 500
                        }
                    });
                    log.debug(`taskDetails---->${JSON.stringify(taskDetails)}`);
                    const createObj = {
                        companyId: recordObj?.companyId,
                        createdBy: recordObj?.createdBy,
                        jiraProject: recordObj?.jiraProject,
                        application: recordObj?.application,
                        jiraIssue: issueObj?._id,
                        key: taskDetails?.payload?.key,
                        taskData: taskDetails?.payload,
                        issueId: taskDetails?.payload?.id
                    }
                    log.debug(`createObj---->${JSON.stringify(createObj)}`);
                    addTaskList.push(createObj);
                }
            }
        }
        log.debug(`addListObj---->${JSON.stringify(addListObj)}`);
        let issueResponse = await createJiraIssuesCore(addListObj);
        log.debug(`issueResponse---->${JSON.stringify(issueResponse)}`);
        log.debug(`addTaskList---->${JSON.stringify(addTaskList)}`);
        let taskResponse = await createJiraTasksCore(addTaskList);
        log.debug(`taskResponse---->${JSON.stringify(taskResponse)}`);
        return apiResponse({
            issues: issueResponse?.payload,
            tasks: taskResponse?.payload
        });
    } catch (error) {
        log.debug(`addHistory Error Response -> ${error}`);
        return apiError(error);

    }
};

export const snsUpdateJiraIssue = async (record) => {
    try {
        let recordObj = JSON.parse(record['Records'][0].Sns.Message);
        log.debug(`Request body of SNS--->${JSON.stringify(recordObj)}`);
        let addListObj = [];
        for (const issue of recordObj?.issues) {
            const url = `https://${recordObj?.jiraHost}.atlassian.net/rest/api/2/issue/${issue?.key}`;
            const auth = 'Basic ' + Buffer.from(recordObj?.jiraUsername + ':' + recordObj?.jiraPassword).toString('base64');

            const result = await axios.get(url, {
                headers: {
                    'Authorization': auth
                }
            }
            ).then(response => {
                log.debug(`axios Response-->${response}`);
                return {
                    type: AppConfig.API_RESPONSE.SUCCESS,
                    payload: response.data,
                    statusCode: response?.status ?? 200
                }
            }).catch(error => {
                log.debug(`Error in axios--->${error}`)
                return {
                    type: AppConfig.API_RESPONSE.FAILED,
                    payload: error.response.data,
                    statusCode: error.response.status ?? 500
                }
            });
            log.debug(`result---->${JSON.stringify(result)}`);

            const updateObj = {
                companyId: recordObj?.companyId,
                _id: issue?._id,
                key: issue?.key,
                name: result?.payload?.name,
                issueId: result?.payload?.id,
                issueData: result?.payload
            };
            log.debug(`updateObj---->${JSON.stringify(updateObj)}`);
            let updateResponse = await updateJiraIssueCore(updateObj);
            log.debug(`updateResponse---->${JSON.stringify(updateResponse)}`);
            addListObj.push(updateResponse?.payload);
        }
        log.debug(`addListObj---->${JSON.stringify(addListObj)}`);
        // let issueResponse = await createJiraIssuesCore(addListObj);
        // log.debug(`issueResponse---->${JSON.stringify(issueResponse)}`);
        return apiResponse(addListObj);
    } catch (error) {
        log.debug(`addHistory Error Response -> ${error}`);
        return apiError(error);

    }
};