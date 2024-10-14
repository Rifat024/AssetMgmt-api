import { Types } from "mongoose";
import { log } from "../../commons/utils/logger";
import { getUserCore } from "../../companyMgmt/userMgmt";
import { addBatchRecord, deleteRecord, getRecord, getRecordWithAggrigation, updateRecord } from "../../commons/utils/dbMgmt";
import { apiError, apiResponse } from "../../commons/http-helpers/api-response";
import { expiryDate } from "../../commons/constants";
import { AppConfig, httpStatusCodes } from "../../commons/environment/appconfig";
import generatedApi from "../../models/generatedApis";

export const createApis = async (record) => {
    const requiredFields = ['companyId'];
    try {
        let recordObj = JSON.parse(record['body']);
        const companyId = record.requestToken.companyId;
        const userId = record.requestToken.userId;
        let userResponse = await getUserCore({
            companyId: companyId,
            userId: userId
        });
        log.debug(`userResponse---->${JSON.stringify(userResponse)}`);
        let addListObj = [];
        for (const data of recordObj) {
            data._id = new Types.ObjectId();
            data.companyId = companyId;
            data.createdBy = userResponse?.payload?._id;
            data.application = new Types.ObjectId(data?.application);
            data.issue = new Types.ObjectId(data?.issue);
            if (data?.tasks) {
                data.tasks = data?.tasks.map(id => new Types.ObjectId(id));
            }
            data.techDesign = new Types.ObjectId(data?.techDesign);
            log.debug(`Post Payload---->${JSON.stringify(data)}`);
            addListObj.push(data);
        }
        let addResponse = await addBatchRecord(addListObj, [], generatedApi);
        log.debug(`addResponse---->${JSON.stringify(addResponse)}`);
        if (addResponse?.statusCode === httpStatusCodes.SUCCESS) {
            return apiResponse(addResponse?.body);
        } else {
            return apiError(500, addResponse);
        }
    } catch (error) {
        log.debug(`Error - ${error}`)
        return apiError(500, error)
    }
}

export const getApiByTechDesign = async (record) => {
    const requiredFields = ['companyId'];
    let recordObj = {};
    try {
        recordObj.companyId = record.requestToken.companyId;
        recordObj.techDesign = record.pathParameters.id;
        const taskIds = record?.queryStringParameters?.tasks?.split(',') || [];
        log.debug(`taskIds--->${JSON.stringify(taskIds)}`);
        let validTasks = [];
        taskIds.forEach(taskId => {
            if (Types.ObjectId.isValid(taskId)) {
                log.debug(`Valid ObjectId Found ---> ${taskId}`);
                validTasks.push(new Types.ObjectId(taskId));
            } else {
                log.debug(`Invalid ObjectId Found ---> ${taskId}`);
            }
        });
        recordObj.tasks = validTasks?.length > 0 ? validTasks : null;
        log.debug(`recordObj--->${JSON.stringify(recordObj)}`);
        let getResponse = await getApiByTechDesignCore(recordObj);
        log.debug(`get Response -> ${JSON.stringify(getResponse)}`);
        return apiResponse(getResponse?.payload);
    } catch (error) {
        log.debug(`error - ${error}`);
        return apiError(500, error);
    }
}

export const getApiDetails = async (record) => {
    const requiredFields = ['companyId'];
    let recordObj = {};
    try {
        recordObj._id = record.pathParameters.id;
        recordObj.companyId = record.requestToken.companyId;

        let getResponse = await getApiCore(recordObj);
        log.debug(`get Response -> ${JSON.stringify(getResponse)}`);
        if (!getResponse?.type || getResponse?.payload === null) {
            return apiError(404, { message: 'Api Not Found' });
        }
        return apiResponse(getResponse?.payload);
    } catch (error) {
        log.debug(`error - ${error}`);
        return apiError(500, error);
    }
}

export const getApiCore = async (recordObj) => {
    try {
        let requiredFields = ["companyId", "_id"];
        const params = {
            $and: [
                { companyId: recordObj?.companyId },
                { _id: recordObj?._id },
                { expiryDate: expiryDate() }
            ]
        };
        log.debug(`Params -> ${JSON.stringify(params)}`);
        let response = await getRecord(recordObj, requiredFields, params, generatedApi);
        log.debug(`get Response -> ${JSON.stringify(response)}`);
        if (response?.statusCode === httpStatusCodes.SUCCESS) {
            return {
                type: true,
                payload: response?.body[0] ?? null
            };
        } else {
            return {
                type: false,
                payload: response ?? null
            };
        }
    } catch (error) {
        log.debug(`Error -> ${error}`);
        return {
            type: false,
            payload: error
        }
    }
};

export const deleteApi = async (record) => {
    const requiredFields = ['companyId'];
    let recordObj = {};
    try {
        recordObj._id = record.pathParameters.id;
        recordObj.companyId = record.requestToken.companyId;
        let getResponse = await getApiCore(recordObj);
        log.debug(`get Response -> ${JSON.stringify(getResponse)}`);
        if (!getResponse?.type || getResponse?.payload === null) {
            return apiError(404, 'Api Not Found');
        }
        const params = {
            $and: [
                { companyId: recordObj?.companyId },
                { _id: recordObj?._id },
                { expiryDate: expiryDate() }
            ]
        };
        log.debug(`Params -> ${JSON.stringify(params)}`);
        let deleteResponse = await deleteRecord(recordObj, requiredFields, params, generatedApi);
        log.debug(`deleteResponse -> ${JSON.stringify(deleteResponse)}`);
        return apiResponse(deleteResponse?.body)
    } catch (error) {
        log.debug(`error - ${error}`)
        return apiError(500, error)
    }
}

export const getApiByTechDesignCore = async (recordObj) => {
    try {
        let requiredFields = ["companyId"];
        let params = {
            $and: [
                { companyId: recordObj?.companyId },
                { techDesign: new Types.ObjectId(recordObj?.techDesign) },
                { expiryDate: expiryDate() }
            ]
        };
        if (recordObj?.tasks !== null) {
            params.$and.push({ tasks: { $in: recordObj?.tasks } })
        }
        log.debug(`params -> ${JSON.stringify(params)}`);
        let aggrigation = await aggregationApiRes(params);
        log.debug(`aggrigation -> ${JSON.stringify(aggrigation)}`);
        let getResponse = await getRecordWithAggrigation(aggrigation?.payload, generatedApi);
        log.debug(`Get  Response -> ${JSON.stringify(getResponse)}`);
        return {
            type: true,
            payload: {
                total: getResponse?.body?.length ?? 0,
                items: getResponse?.body ?? []
            }
        };
    } catch (error) {
        log.debug(`Error -> ${error}`);
        return {
            type: false,
            payload: error
        }
    }

};

export const updateApi = async (record) => {
    try {
        let recordObj = JSON.parse(record['body']);
        const requiredFields = ['companyId'];
        recordObj._id = record.pathParameters.id;
        recordObj.companyId = record.requestToken.companyId;
        if (recordObj?.tasks) {
            recordObj.tasks = recordObj?.tasks.map(id => new Types.ObjectId(id));
        }
        let getResponse = await getApiCore(recordObj);
        log.debug(`get Response -> ${JSON.stringify(getResponse)}`);
        if (!getResponse?.type || getResponse?.payload === null) {
            return apiError(404, 'Api Not Found');
        }
        const params = {
            $and: [
                { companyId: recordObj?.companyId },
                { _id: recordObj?._id },
                { expiryDate: expiryDate() }
            ]
        };
        log.debug(`Params -> ${JSON.stringify(params)}`);
        let updateResponse = await updateRecord(recordObj, requiredFields, params, generatedApi);
        log.debug(`updateResponse -> ${JSON.stringify(updateResponse)}`);
        return apiResponse(updateResponse?.body);
    } catch (error) {
        log.debug(`error - ${error}`)
        return apiError(500, error)
    }
}

const aggregationApiRes = async (params, limit = 0, skip = 0, sort = null) => {
    try {
        let aggregate = [
            { $match: params },
            {
                $lookup: {
                    from: 'USERS_PROFILE',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdBy',
                    pipeline: [
                        { $project: { _id: 1, userId: 1, fullName: 1, email: 1 } }
                    ]
                }
            },
            {
                $unwind: {
                    path: '$createdBy',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "API_STDIO_PROJECT",
                    localField: "application",
                    foreignField: "_id",
                    as: "application",
                    pipeline: [
                        { $project: { _id: 1, name: 1 } }
                    ],
                }
            },
            {
                $unwind: {
                    path: '$application',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "JIRA_ISSUES",
                    localField: "issue",
                    foreignField: "_id",
                    as: "issue",
                    pipeline: [
                        { $project: { _id: 1, key: 1, 'issueData.fields.summary': 1 } }
                    ],
                }
            },
            {
                $unwind: {
                    path: '$issue',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "JIRA_TASKS",
                    localField: "tasks",
                    foreignField: "_id",
                    as: "tasks",
                    pipeline: [
                        { $project: { _id: 1, key: 1, 'taskData.fields.summary': 1 } }
                    ],
                }
            },
            {
                $lookup: {
                    from: "API_STUDIO_REQ_RES_INFO",
                    localField: "_id",
                    foreignField: "apis",
                    as: "reqInfo",
                    pipeline: [
                        {
                            $match: { $and: [{ type: AppConfig.API_INFO_TYPE.REQUEST }, { expiryDate: expiryDate() }] }
                        }
                    ],
                }
            },
            {
                $lookup: {
                    from: "API_STUDIO_REQ_RES_INFO",
                    localField: "_id",
                    foreignField: "apis",
                    as: "resInfo",
                    pipeline: [
                        {
                            $match: { $and: [{ type: AppConfig.API_INFO_TYPE.RESPONSE }, { expiryDate: expiryDate() }] }
                        }
                    ],
                }
            },
            {
                $lookup: {
                    from: "API_STUDIO_DB_SCHEMA",
                    localField: "_id",
                    foreignField: "apis",
                    as: "dbSchemas",
                    pipeline: [
                        {
                            $match: { $and: [{ expiryDate: expiryDate() }] }
                        }
                    ],
                }
            },
            {
                $lookup: {
                    from: "API_STUDIO_TECH_DESIGNS",
                    localField: "techDesign",
                    foreignField: "_id",
                    as: "techDesign",
                    pipeline: [
                        { $project: { _id: 1, key: 1, 'taskData.fields.summary': 1 } }
                    ],
                }
            },
            {
                $unwind: {
                    path: '$techDesign',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    tasks: {
                        $map: {
                            input: '$tasks',
                            as: 'task',
                            in: '$$task'
                        }
                    },
                    dbSchemas: {
                        $map: {
                            input: '$dbSchemas',
                            as: 'dbSchema',
                            in: '$$dbSchema'
                        }
                    },
                }
            },
        ];

        if (sort !== null) {
            aggregate.push({ $sort: sort });
        } else {
            aggregate.push({ $sort: { createdAt: -1 } });
        }
        if (skip !== 0) {
            aggregate.push({ $skip: skip });
        }
        if (limit !== 0) {
            aggregate.push({ $limit: limit });
        }
        return {
            type: true,
            payload: aggregate
        };
    } catch (error) {
        console.error(`Validation Failed: ${error}`);
        return {
            type: false,
            payload: error
        };
    }
};

