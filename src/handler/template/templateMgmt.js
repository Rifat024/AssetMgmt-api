import { Types } from "mongoose";
import { log } from "../../commons/utils/logger";
import { getUserCore } from "../../companyMgmt/userMgmt";
import { addBatchRecord, addRecord, deleteRecord, getRecord, getRecordCount, getRecordWithAggrigation, updateRecord } from "../../commons/utils/dbMgmt";
import { apiError, apiResponse } from "../../commons/http-helpers/api-response";
import { expiryDate } from "../../commons/constants";
import { AppConfig, httpStatusCodes } from "../../commons/environment/appconfig";
import template from "../../models/template";
const Yup = require('yup');

export const createTemplate = async (record) => {
    const requiredFields = ['companyId'];
    try {
        let recordObj = JSON.parse(record['body']);
        recordObj.companyId = record.requestToken.companyId;
        recordObj.userId = record.requestToken.userId;
        // let addObjList = [];
        // for (const data of recordObj?.items) {
        recordObj._id = new Types.ObjectId();
        let userResponse = await getUserCore(recordObj);
        log.debug(`userResponse---->${JSON.stringify(userResponse)}`);
        recordObj.createdBy = userResponse?.payload?._id;
        log.debug(`Post Payload---->${JSON.stringify(recordObj)}`);
        let validate = await validateData(recordObj);
        log.debug(`validate Payload---->${JSON.stringify(validate)}`);
        if (!validate?.type) {
            return apiError(404, validate?.payload);
        }
        // let checkExist = await getTemplateByTypeCore(recordObj);
        // log.debug(`checkExist---->${JSON.stringify(checkExist)}`);
        // if (checkExist?.type && checkExist?.payload !== null) {
        //     return apiError(404, { message: 'Template already Exist for this Type' });
        // }

        // }
        // log.debug(`addObjList Payload---->${JSON.stringify(addObjList)}`);
        let addResponse = await addRecord(recordObj, requiredFields, template);
        log.debug(`addResponse Module---->${JSON.stringify(addResponse)}`);
        if (addResponse?.statusCode === httpStatusCodes.SUCCESS) {
            return apiResponse(addResponse?.body[0]);
        } else {
            return apiError(500, addResponse);
        }
    } catch (error) {
        log.debug(`Error - ${error}`)
        return apiError(500, error)
    }
};

export const getTemplateDetails = async (record) => {
    const requiredFields = ['companyId'];
    let recordObj = {};
    try {
        recordObj._id = record.pathParameters.id;
        recordObj.companyId = record.requestToken.companyId;
        let getResponse = await getTemplateCore(recordObj);
        log.debug(`get Response -> ${JSON.stringify(getResponse)}`);
        if (!getResponse?.type || getResponse?.payload === null) {
            return apiError(404, { message: 'Template Not Found' });
        }
        return apiResponse(getResponse?.payload);
    } catch (error) {
        log.debug(`error - ${error}`);
        return apiError(500, error);
    }
};

export const getTemplateCore = async (recordObj) => {
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
        let response = await getRecord(recordObj, requiredFields, params, template);
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

export const getTemplateByTypeCore = async (recordObj) => {
    try {
        let requiredFields = ["companyId", "type"];
        const params = {
            $and: [
                { companyId: recordObj?.companyId },
                { type: recordObj?.type },
                { expiryDate: expiryDate() }
            ]
        };
        log.debug(`Params -> ${JSON.stringify(params)}`);
        let response = await getRecord(recordObj, requiredFields, params, template);
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

export const deleteTemplate = async (record) => {
    const requiredFields = ['companyId'];
    let recordObj = {};
    try {
        recordObj._id = record.pathParameters.id;
        recordObj.companyId = record.requestToken.companyId;
        let getResponse = await getTemplateCore(recordObj);
        log.debug(`get Response -> ${JSON.stringify(getResponse)}`);
        if (!getResponse?.type || getResponse?.payload === null) {
            return apiError(404, 'Template Not Found');
        }
        const params = {
            $and: [
                { companyId: recordObj?.companyId },
                { _id: recordObj?._id },
                { expiryDate: expiryDate() }
            ]
        };
        log.debug(`Params -> ${JSON.stringify(params)}`);
        let deleteResponse = await deleteRecord(recordObj, requiredFields, params, template);
        log.debug(`deleteResponse -> ${JSON.stringify(deleteResponse)}`);
        return apiResponse(deleteResponse?.body)
    } catch (error) {
        log.debug(`error - ${error}`)
        return apiError(500, error)
    }
};

export const updateTemplate = async (record) => {
    try {
        let recordObj = JSON.parse(record['body']);
        const requiredFields = ['companyId'];
        recordObj._id = record.pathParameters.id;
        recordObj.companyId = record.requestToken.companyId;
        let getResponse = await getTemplateCore(recordObj);
        log.debug(`get Response -> ${JSON.stringify(getResponse)}`);
        if (!getResponse?.type || getResponse?.payload === null) {
            return apiError(404, 'Template Not Found');
        }
        const params = {
            $and: [
                { companyId: recordObj?.companyId },
                { _id: recordObj?._id },
                { expiryDate: expiryDate() }
            ]
        };
        log.debug(`Params -> ${JSON.stringify(params)}`);
        let updateResponse = await updateRecord(recordObj, requiredFields, params, template);
        log.debug(`updateResponse -> ${JSON.stringify(updateResponse)}`);
        return apiResponse(updateResponse?.body);
    } catch (error) {
        log.debug(`error - ${error}`)
        return apiError(500, error)
    }
};

export const getTemplateByCompany = async (record) => {
    const requiredFields = ['companyId'];
    let recordObj = {};
    try {
        recordObj.companyId = record.requestToken.companyId;
        let optionParams = {
            size: isNaN(Number(record?.queryStringParameters?.size)) ? 50 : Number(record?.queryStringParameters?.size),
            page: isNaN(Number(record?.queryStringParameters?.page)) ? 1 : Number(record?.queryStringParameters?.page),
            type: (record?.queryStringParameters?.type?.trim() === "")
                ? null
                : record?.queryStringParameters?.type ?? null,
        };
        log.debug(`recordObj -> ${JSON.stringify(recordObj)}`);
        log.debug(`optionParams -> ${JSON.stringify(optionParams)}`);
        let getResponse = await getTemplateByCompanyCore(recordObj, optionParams);
        log.debug(`get Response -> ${JSON.stringify(getResponse)}`);
        return apiResponse(getResponse?.payload);
    } catch (error) {
        log.debug(`error - ${error}`);
        return apiError(500, error);
    }
};

export const getTemplateByCompanyCore = async (recordObj, optionParams) => {
    try {
        let requiredFields = ["companyId"];
        const params = {
            $and: [
                { companyId: recordObj?.companyId },
                { expiryDate: expiryDate() }
            ]
        };
        if (optionParams?.type !== null) {
            params.$and.push({ type: optionParams?.type })
        }
        // if (optionParams?.assetName !== null) {
        //     params.$and.push({ assetName: { $regex: optionParams?.assetName, $options: "i" } })
        // }
        log.debug(`params -> ${JSON.stringify(params)}`);
        const total = await getRecordCount(params, template);
        log.debug(`total-->${JSON.stringify(total)}`);
        let skip = Number((optionParams?.page - 1) * optionParams?.size);
        log.debug(`total > skip-->${JSON.stringify(total > skip)}`);
        if (total.count > skip === false) {
            skip = 0;
        }
        log.debug(`skip-->${JSON.stringify(skip)}`);
        let aggrigation = await aggregationTemplateRes(params, optionParams?.size, skip);
        log.debug(`aggrigation -> ${JSON.stringify(aggrigation)}`);
        let getResponse = await getRecordWithAggrigation(aggrigation?.payload, template);
        log.debug(`Get  Response -> ${JSON.stringify(getResponse)}`);
        return {
            type: true,
            payload: {
                total: total?.count ?? 0,
                items: getResponse?.body ?? []
            }
        };
    } catch (error) {
        log.debug(`Error -> ${error}`);
        return {
            type: false,
            payload: error
        }
    };
};

const aggregationTemplateRes = async (params, limit = 0, skip = 0, sort = null) => {
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
            // {
            //     $lookup: {
            //         from: 'DEPARTMENTS',
            //         localField: 'department',
            //         foreignField: '_id',
            //         as: 'department',
            //         pipeline: [
            //             { $project: { _id: 1, deptName: 1, deptCode: 1 } }
            //         ]
            //     }
            // },
            // {
            //     $unwind: {
            //         path: '$department',
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


export const validateData = async (recordObj) => {
    try {
        let schema = Yup.object().shape({
            type: Yup.string().oneOf([AppConfig.TEMPLATE_TYPE.LOCATION_TEMP,
            AppConfig.TEMPLATE_TYPE.WARRANTY_TEMP,
            AppConfig.TEMPLATE_TYPE.MAINTAINANCE_TEMP,
            AppConfig.TEMPLATE_TYPE.LEASE_TEMP,
            AppConfig.TEMPLATE_TYPE.PURCHASE_TEMP,
            AppConfig.TEMPLATE_TYPE.RENT_TEMP,
            AppConfig.TEMPLATE_TYPE.FAMILY_TEMP,
            ]).required('Type is required'),
            name: Yup.string().required('name is required'),
            tempData: Yup.object().required('tempData is required'),
            status: Yup.mixed().oneOf([AppConfig.DISCOVERY_STATUS.ACTIVE,
            AppConfig.DISCOVERY_STATUS.IN_ACTIVE])
                .required('status is required'),
        });

        const validationResult = await schema.validate(recordObj);
        log.debug(`Validation Passed--> ${validationResult}`);
        return {
            type: true,
            payload: validationResult
        };
    } catch (error) {
        log.debug(`Validation Failed---> ${error}`);
        return {
            type: false,
            payload: error
        };
    }
};
