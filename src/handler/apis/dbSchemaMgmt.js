import { Types } from "mongoose";
import { log } from "../../commons/utils/logger";
import { getUserCore } from "../../companyMgmt/userMgmt";
import { addBatchRecord, deleteRecord, getRecord, getRecordCount, getRecordWithAggrigation, updateRecord } from "../../commons/utils/dbMgmt";
import { apiError, apiResponse } from "../../commons/http-helpers/api-response";
import { expiryDate } from "../../commons/constants";
import { httpStatusCodes } from "../../commons/environment/appconfig";
import dbSchema from "../../models/DbSchema";

export const createDbSchemas = async (record) => {
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
            if (data?.apis) {
                data.apis = data?.apis.map(id => new Types.ObjectId(id));
            }
            log.debug(`Post Payload---->${JSON.stringify(data)}`);
            addListObj.push(data);
        }
        let addResponse = await addBatchRecord(addListObj, [], dbSchema);
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

export const getDbSchemaByApplication = async (record) => {
    const requiredFields = ['companyId'];
    let recordObj = {};
    try {
        recordObj.companyId = record.requestToken.companyId;
        recordObj.application = record.pathParameters.id;
        let optionParams = {
            size: isNaN(Number(record?.queryStringParameters?.size)) ? 50 : Number(record?.queryStringParameters?.size),
            page: isNaN(Number(record?.queryStringParameters?.page)) ? 1 : Number(record?.queryStringParameters?.page),
            schemaType: (record?.queryStringParameters?.schemaType?.trim() === "")
                ? null
                : record?.queryStringParameters?.schemaType ?? null,
            api: (record?.queryStringParameters?.api && Types.ObjectId.isValid(record?.queryStringParameters?.api))
                ? new Types.ObjectId(record?.queryStringParameters?.api)
                : null
        };
        log.debug(`optionParams--->${JSON.stringify(optionParams)}`);
        log.debug(`recordObj--->${JSON.stringify(recordObj)}`);
        let getResponse = await getDbSchemaByApplicationCore(recordObj, optionParams);
        log.debug(`get Response -> ${JSON.stringify(getResponse)}`);
        return apiResponse(getResponse?.payload);
    } catch (error) {
        log.debug(`error - ${error}`);
        return apiError(500, error);
    }
}

export const getApiDbSchemaDetails = async (record) => {
    const requiredFields = ['companyId'];
    let recordObj = {};
    try {
        recordObj._id = record.pathParameters.id;
        recordObj.companyId = record.requestToken.companyId;

        let getResponse = await getDbSchemaCore(recordObj);
        log.debug(`get Response -> ${JSON.stringify(getResponse)}`);
        if (!getResponse?.type || getResponse?.payload === null) {
            return apiError(404, { message: 'DB-Schema Not Found' });
        }
        return apiResponse(getResponse?.payload);
    } catch (error) {
        log.debug(`error - ${error}`);
        return apiError(500, error);
    }
}

export const getDbSchemaCore = async (recordObj) => {
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
        let response = await getRecord(recordObj, requiredFields, params, dbSchema);
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

export const deleteDbSchema = async (record) => {
    const requiredFields = ['companyId'];
    let recordObj = {};
    try {
        recordObj._id = record.pathParameters.id;
        recordObj.companyId = record.requestToken.companyId;
        let getResponse = await getDbSchemaCore(recordObj);
        log.debug(`get Response -> ${JSON.stringify(getResponse)}`);
        if (!getResponse?.type || getResponse?.payload === null) {
            return apiError(404, 'DB-Schema Not Found');
        }
        const params = {
            $and: [
                { companyId: recordObj?.companyId },
                { _id: recordObj?._id },
                { expiryDate: expiryDate() }
            ]
        };
        log.debug(`Params -> ${JSON.stringify(params)}`);
        let deleteResponse = await deleteRecord(recordObj, requiredFields, params, dbSchema);
        log.debug(`deleteResponse -> ${JSON.stringify(deleteResponse)}`);
        return apiResponse(deleteResponse?.body)
    } catch (error) {
        log.debug(`error - ${error}`)
        return apiError(500, error)
    }
}

export const getDbSchemaByApplicationCore = async (recordObj, optionParams) => {
    try {
        let requiredFields = ["companyId"];
        let params = {
            $and: [
                { companyId: recordObj?.companyId },
                { application: new Types.ObjectId(recordObj?.application) },
                { expiryDate: expiryDate() }
            ]
        };
        if (optionParams?.api !== null) {
            params.$and.push({ api: new Types.ObjectId(recordObj?.api) })
        }
        if (optionParams?.schemaType !== null) {
            params.$and.push({ schemaType: recordObj?.schemaType })
        }
        log.debug(`params -> ${JSON.stringify(params)}`);
        const total = await getRecordCount(params, dbSchema);
        log.debug(`total-->${JSON.stringify(total)}`);
        let skip = Number((optionParams?.page - 1) * optionParams?.size);
        log.debug(`total > skip-->${JSON.stringify(total > skip)}`);
        if (total.count > skip === false) {
            skip = 0;
        }
        log.debug(`skip-->${JSON.stringify(skip)}`);
        let aggrigation = await aggregationDbSchemaRes(params, optionParams?.size, skip);
        log.debug(`aggrigation -> ${JSON.stringify(aggrigation)}`);
        let getResponse = await getRecordWithAggrigation(aggrigation?.payload, dbSchema);
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

export const updateDbSchema = async (record) => {
    try {
        let recordObj = JSON.parse(record['body']);
        const requiredFields = ['companyId'];
        recordObj._id = record.pathParameters.id;
        recordObj.companyId = record.requestToken.companyId;
        if (recordObj?.apis) {
            recordObj.apis = recordObj?.apis.map(id => new Types.ObjectId(id));
        }
        let getResponse = await getDbSchemaCore(recordObj);
        log.debug(`get Response -> ${JSON.stringify(getResponse)}`);
        if (!getResponse?.type || getResponse?.payload === null) {
            return apiError(404, 'DB-Schema Not Found');
        }
        const params = {
            $and: [
                { companyId: recordObj?.companyId },
                { _id: recordObj?._id },
                { expiryDate: expiryDate() }
            ]
        };
        log.debug(`Params -> ${JSON.stringify(params)}`);
        let updateResponse = await updateRecord(recordObj, requiredFields, params, dbSchema);
        log.debug(`updateResponse -> ${JSON.stringify(updateResponse)}`);
        return apiResponse(updateResponse?.body);
    } catch (error) {
        log.debug(`error - ${error}`)
        return apiError(500, error)
    }
}

const aggregationDbSchemaRes = async (params, limit = 0, skip = 0, sort = null) => {
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
                    from: "API_STUDIO_GENERATED_API",
                    localField: "apis",
                    foreignField: "_id",
                    as: "apis",
                    pipeline: [
                        { $project: { _id: 1, apiName: 1, summary: 1 } }
                    ],
                }
            },
            // {
            //     $unwind: {
            //         path: '$api',
            //         preserveNullAndEmptyArrays: true
            //     }
            // },
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

