import { Types } from "mongoose";
import { log } from "../../commons/utils/logger";
import { getUserCore } from "../../companyMgmt/userMgmt";
import { addBatchRecord, addRecord, deleteRecord, getRecord, getRecordCount, getRecordWithAggrigation, updateRecord } from "../../commons/utils/dbMgmt";
import { apiError, apiResponse } from "../../commons/http-helpers/api-response";
import { expiryDate } from "../../commons/constants";
import { AppConfig, httpStatusCodes } from "../../commons/environment/appconfig";
import normalization from "../../models/normalization";
import { updateDiscoveryFlagCore } from "./discoveryMgmt";
const Yup = require('yup');

export const createNormalization = async (record) => {
    const requiredFields = ['companyId'];
    try {
        let recordObj = JSON.parse(record['body']);
        const companyId = record.requestToken.companyId;
        const userId = record.requestToken.userId;
        let addObjList = [];
        let discoveries = [];
        for (const data of recordObj?.items) {
            data._id = new Types.ObjectId();
            let userResponse = await getUserCore({ companyId: companyId, userId: userId });
            log.debug(`userResponse---->${JSON.stringify(userResponse)}`);
            data.createdBy = userResponse?.payload?._id;
            data.companyId = companyId;
            data.discovery = new Types.ObjectId(data.discovery);
            discoveries.push(data?.discovery);
            log.debug(`Post Payload---->${JSON.stringify(data)}`);
            let validate = await validateData(data);
            log.debug(`validate Payload---->${JSON.stringify(validate)}`);
            if (!validate?.type) {
                return apiError(404, validate?.payload);
            }
            let checkExist = await getNormalizationByDiscoveryCore(data);
            log.debug(`checkExist---->${JSON.stringify(checkExist)}`);
            if (!checkExist?.type || checkExist?.payload === null) {
                addObjList.push(data);
            }

        }
        log.debug(`addObjList Payload---->${JSON.stringify(addObjList)}`);
        let addResponse = await addBatchRecord(addObjList, [], normalization);
        log.debug(`addResponse Module---->${JSON.stringify(addResponse)}`);
        if (addResponse?.statusCode === httpStatusCodes.SUCCESS) {
            let updateResponse = await updateDiscoveryFlagCore({
                $and: [
                    { _id: { $in: discoveries } },
                    { expiryDate: expiryDate() }
                ]
            });
            log.debug(`updateResponse---->${JSON.stringify(updateResponse)}`);
            return apiResponse(addResponse?.body);
        } else {
            return apiError(500, addResponse);
        }
    } catch (error) {
        log.debug(`Error - ${error}`)
        return apiError(500, error)
    }
};

export const getNormalizationDetails = async (record) => {
    const requiredFields = ['companyId'];
    let recordObj = {};
    try {
        recordObj._id = record.pathParameters.id;
        recordObj.companyId = record.requestToken.companyId;
        let getResponse = await getNormalizationCore(recordObj);
        log.debug(`get Response -> ${JSON.stringify(getResponse)}`);
        if (!getResponse?.type || getResponse?.payload === null) {
            return apiError(404, { message: 'Normalization Not Found' });
        }
        return apiResponse(getResponse?.payload);
    } catch (error) {
        log.debug(`error - ${error}`);
        return apiError(500, error);
    }
};

export const getNormalizationCore = async (recordObj) => {
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
        let response = await getRecord(recordObj, requiredFields, params, normalization);
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

export const getNormalizationByCodeCore = async (recordObj) => {
    try {
        let requiredFields = ["companyId", "assetCode"];
        const params = {
            $and: [
                { companyId: recordObj?.companyId },
                { assetCode: recordObj?.assetCode },
                { expiryDate: expiryDate() }
            ]
        };
        log.debug(`Params -> ${JSON.stringify(params)}`);
        let response = await getRecord(recordObj, requiredFields, params, normalization);
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

export const getNormalizationByDiscoveryCore = async (recordObj) => {
    try {
        let requiredFields = ["companyId", "discovery"];
        const params = {
            $and: [
                { companyId: recordObj?.companyId },
                { discovery: new Types.ObjectId(recordObj?.discovery) },
                { expiryDate: expiryDate() }
            ]
        };
        log.debug(`Params -> ${JSON.stringify(params)}`);
        let response = await getRecord(recordObj, requiredFields, params, normalization);
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

export const deleteNormalization = async (record) => {
    const requiredFields = ['companyId'];
    let recordObj = {};
    try {
        recordObj._id = record.pathParameters.id;
        recordObj.companyId = record.requestToken.companyId;
        let getResponse = await getNormalizationCore(recordObj);
        log.debug(`get Response -> ${JSON.stringify(getResponse)}`);
        if (!getResponse?.type || getResponse?.payload === null) {
            return apiError(404, 'Normalization Not Found');
        }
        const params = {
            $and: [
                { companyId: recordObj?.companyId },
                { _id: recordObj?._id },
                { expiryDate: expiryDate() }
            ]
        };
        log.debug(`Params -> ${JSON.stringify(params)}`);
        let deleteResponse = await deleteRecord(recordObj, requiredFields, params, normalization);
        log.debug(`deleteResponse -> ${JSON.stringify(deleteResponse)}`);
        return apiResponse(deleteResponse?.body)
    } catch (error) {
        log.debug(`error - ${error}`)
        return apiError(500, error)
    }
};

export const updateNormalization = async (record) => {
    try {
        let recordObj = JSON.parse(record['body']);
        const requiredFields = ['companyId'];
        recordObj._id = record.pathParameters.id;
        recordObj.companyId = record.requestToken.companyId;
        let getResponse = await getNormalizationCore(recordObj);
        log.debug(`get Response -> ${JSON.stringify(getResponse)}`);
        if (!getResponse?.type || getResponse?.payload === null) {
            return apiError(404, 'Normalization Not Found');
        }
        const params = {
            $and: [
                { companyId: recordObj?.companyId },
                { _id: recordObj?._id },
                { expiryDate: expiryDate() }
            ]
        };
        log.debug(`Params -> ${JSON.stringify(params)}`);
        let updateResponse = await updateRecord(recordObj, requiredFields, params, normalization);
        log.debug(`updateResponse -> ${JSON.stringify(updateResponse)}`);
        return apiResponse(updateResponse?.body);
    } catch (error) {
        log.debug(`error - ${error}`)
        return apiError(500, error)
    }
};

export const getNormalizationByCompany = async (record) => {
    const requiredFields = ['companyId'];
    let recordObj = {};
    try {
        recordObj.companyId = record.requestToken.companyId;
        // recordObj.application = record.pathParameters.id;
        // recordObj.codeSpec = (record?.queryStringParameters?.codeSpec && Types.ObjectId.isValid(record?.queryStringParameters?.codeSpec))
        //     ? new Types.ObjectId(record?.queryStringParameters?.codeSpec)
        //     : null;
        // recordObj.envSpec = record?.queryStringParameters?.envSpec
        //     ? record.queryStringParameters.envSpec.split(',').map(spec =>
        //         Types.ObjectId.isValid(spec) ? new Types.ObjectId(spec) : null
        //     ).filter(spec => spec !== null)
        //     : null;
        let optionParams = {
            size: isNaN(Number(record?.queryStringParameters?.size)) ? 50 : Number(record?.queryStringParameters?.size),
            page: isNaN(Number(record?.queryStringParameters?.page)) ? 1 : Number(record?.queryStringParameters?.page),
            assetType: (record?.queryStringParameters?.assetType?.trim() === "")
                ? null
                : record?.queryStringParameters?.assetType ?? null,
            assetName: (record?.queryStringParameters?.assetName?.trim() === "")
                ? null
                : record?.queryStringParameters?.assetName ?? null,
            discovery: (record?.queryStringParameters?.discovery && Types.ObjectId.isValid(record?.queryStringParameters?.discovery))
                ? new Types.ObjectId(record?.queryStringParameters?.discovery)
                : null,
            // department: (record?.queryStringParameters?.department && Types.ObjectId.isValid(record?.queryStringParameters?.department))
            //     ? new Types.ObjectId(record?.queryStringParameters?.department)
            //     : null
            department: (record?.queryStringParameters?.department?.trim() === "")
                ? null
                : record?.queryStringParameters?.department ?? null,
        };
        log.debug(`recordObj -> ${JSON.stringify(recordObj)}`);
        log.debug(`optionParams -> ${JSON.stringify(optionParams)}`);
        let getResponse = await getNormalizationByCompanyCore(recordObj, optionParams);
        log.debug(`get Response -> ${JSON.stringify(getResponse)}`);
        return apiResponse(getResponse?.payload);
    } catch (error) {
        log.debug(`error - ${error}`);
        return apiError(500, error);
    }
};

export const getNormalizationByCompanyCore = async (recordObj, optionParams) => {
    try {
        let requiredFields = ["companyId"];
        const params = {
            $and: [
                { companyId: recordObj?.companyId },
                { expiryDate: expiryDate() }
            ]
        };
        if (optionParams?.discovery !== null) {
            params.$and.push({ discovery: new Types.ObjectId(optionParams?.discovery) })
        }
        if (optionParams?.department !== null) {
            params.$and.push({ department: optionParams?.department })
        }
        if (optionParams?.assetType !== null) {
            params.$and.push({ assetType: optionParams?.assetType })
        }
        if (optionParams?.assetName !== null) {
            params.$and.push({ assetName: { $regex: optionParams?.assetName, $options: "i" } })
        }
        log.debug(`params -> ${JSON.stringify(params)}`);
        const total = await getRecordCount(params, normalization);
        log.debug(`total-->${JSON.stringify(total)}`);
        let skip = Number((optionParams?.page - 1) * optionParams?.size);
        log.debug(`total > skip-->${JSON.stringify(total > skip)}`);
        if (total.count > skip === false) {
            skip = 0;
        }
        log.debug(`skip-->${JSON.stringify(skip)}`);
        let aggrigation = await aggregationNormalizationRes(params, optionParams?.size, skip);
        log.debug(`aggrigation -> ${JSON.stringify(aggrigation)}`);
        let getResponse = await getRecordWithAggrigation(aggrigation?.payload, normalization);
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

const aggregationNormalizationRes = async (params, limit = 0, skip = 0, sort = null) => {
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
            assetCode: Yup.string().required('assetCode is required'),
            assetName: Yup.string().required('assetName is required'),
            assetType: Yup.string().required('assetType is required'),
            serialNumber: Yup.string().required('serialNumber is required'),
            modelNumber: Yup.string().required('modelNumber is required'),
            location: Yup.string().required('location is required'),
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
