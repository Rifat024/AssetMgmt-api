import { Types } from "mongoose";
import { log } from "../../commons/utils/logger";
import { getUserCore } from "../../companyMgmt/userMgmt";
import { addBatchRecord, addRecord, deleteRecord, getRecord, getRecordCount, getRecordWithAggrigation, updateRecord } from "../../commons/utils/dbMgmt";
import { apiError, apiResponse } from "../../commons/http-helpers/api-response";
import { expiryDate } from "../../commons/constants";
import { AppConfig, httpStatusCodes } from "../../commons/environment/appconfig";
import { excludeNode, findNode } from "../../utilFunction/utils";
import assets from "../../models/asset";
const Yup = require('yup');

export const createAsset = async (record) => {
    const requiredFields = ['companyId'];
    try {
        let recordObj = JSON.parse(record['body']);
        recordObj.companyId = record.requestToken.companyId;
        recordObj.userId = record.requestToken.userId;
        recordObj._id = new Types.ObjectId();
        let userResponse = await getUserCore(recordObj);
        log.debug(`userResponse---->${JSON.stringify(userResponse)}`);
        recordObj.createdBy = userResponse?.payload?._id;
        recordObj.expiryDate = expiryDate();
        recordObj.assetType = new Types.ObjectId(recordObj?.assetType);
        if (recordObj?.assetDatas && recordObj?.assetDatas?.length !== 0) {
            for (const asset of recordObj?.assetDatas) {
                asset.template = new Types.ObjectId(asset?.template);
            }
        }
        log.debug(`Post Payload---->${JSON.stringify(recordObj)}`);
        let validate = await validateData(recordObj);
        log.debug(`validate Payload---->${JSON.stringify(validate)}`);
        if (!validate?.type) {
            return apiError(404, validate?.payload);
        }
        // if (recordObj?.parentId && Types.ObjectId.isValid(recordObj?.parentId)) {
        //     let getResponse = await getAssetCore({
        //         companyId: recordObj?.companyId,
        //         _id: recordObj.parentId
        //     });
        //     log.debug(`getResponse---->${JSON.stringify(getResponse)}`);
        //     if (!getResponse?.type || getResponse?.payload === null) {
        //         return apiError(404, { message: 'Parent Asset-Type not Found' });
        //     }
        //     let updateObj = JSON.parse(JSON.stringify(getResponse?.payload));
        //     log.debug(`initial updateObj---->${JSON.stringify(updateObj)}`);
        //     delete recordObj?.parentId;
        //     if (recordObj?.nodeParentId && Types.ObjectId.isValid(recordObj?.nodeParentId)) {
        //         let found = findNode(recordObj.nodeParentId, updateObj);
        //         log.debug(`Find Node Response -> ${JSON.stringify(found)}`);
        //         if (!found) {
        //             return apiError(404, { message: 'Parent Node not Found' });
        //         }
        //         delete recordObj?.nodeParentId;
        //         found.children.push(recordObj);
        //     } else {
        //         delete recordObj?.nodeParentId;
        //         updateObj.children = [recordObj];
        //     }
        //     log.debug(`final updateObj---->${JSON.stringify(updateObj)}`);
        //     let updateResponse = await updateAssetCore(updateObj);
        //     log.debug(`updateResponse---->${JSON.stringify(updateResponse)}`);
        //     if (!updateResponse?.type || updateResponse?.payload === null) {
        //         return apiError(404, updateResponse?.payload);
        //     }
        //     return apiResponse(updateResponse?.payload);
        // } else {
        let addResponse = await addRecord(recordObj, requiredFields, assets);
        log.debug(`addResponse Module---->${JSON.stringify(addResponse)}`);
        if (addResponse?.statusCode === httpStatusCodes.SUCCESS) {
            return apiResponse(addResponse?.body[0]);
        } else {
            return apiError(500, addResponse);
        }
        // }
    } catch (error) {
        log.debug(`Error - ${error}`)
        return apiError(500, error)
    }
};

export const getAssetDetails = async (record) => {
    const requiredFields = ['companyId'];
    let recordObj = {};
    try {
        recordObj._id = record.pathParameters.id;
        recordObj.companyId = record.requestToken.companyId;
        // recordObj.nodeId = (record?.queryStringParameters?.nodeId && Types.ObjectId.isValid(record?.queryStringParameters?.nodeId))
        //     ? record?.queryStringParameters?.nodeId
        //     : null;
        let getResponse = await getAssetCore(recordObj);
        log.debug(`get Response -> ${JSON.stringify(getResponse)}`);
        if (!getResponse?.type || getResponse?.payload === null) {
            return apiError(404, { message: 'Asset Not Found' });
        }
        return apiResponse(getResponse?.payload);
    } catch (error) {
        log.debug(`error - ${error}`);
        return apiError(500, error);
    }
};

export const getAssetCore = async (recordObj) => {
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
        let response = await getRecord(recordObj, requiredFields, params, assets);
        log.debug(`get Response -> ${JSON.stringify(response)}`);
        if (response?.statusCode === httpStatusCodes.SUCCESS) {
            // if (withDetails && recordObj?.nodeId !== null) {
            //     let found = findNode(recordObj.nodeId, response?.body[0]);
            //     log.debug(`Find Node Response -> ${JSON.stringify(found)}`);
            //     if (found) {
            //         return {
            //             type: true,
            //             payload: found ?? null
            //         };
            //     }
            // }
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

// export const getAssetByTypeCore = async (recordObj) => {
//     try {
//         let requiredFields = ["companyId", "type"];
//         const params = {
//             $and: [
//                 { companyId: recordObj?.companyId },
//                 { type: recordObj?.type },
//                 { expiryDate: expiryDate() }
//             ]
//         };
//         log.debug(`Params -> ${JSON.stringify(params)}`);
//         let response = await getRecord(recordObj, requiredFields, params, Asset);
//         log.debug(`get Response -> ${JSON.stringify(response)}`);
//         if (response?.statusCode === httpStatusCodes.SUCCESS) {
//             return {
//                 type: true,
//                 payload: response?.body[0] ?? null
//             };
//         } else {
//             return {
//                 type: false,
//                 payload: response ?? null
//             };
//         }
//     } catch (error) {
//         log.debug(`Error -> ${error}`);
//         return {
//             type: false,
//             payload: error
//         }
//     }
// };

export const deleteAsset = async (record) => {
    const requiredFields = ['companyId'];
    let recordObj = {};
    try {
        recordObj._id = record.pathParameters.id;
        recordObj.companyId = record.requestToken.companyId;
        // recordObj.nodeId = (record?.queryStringParameters?.nodeId && Types.ObjectId.isValid(record?.queryStringParameters?.nodeId))
        //     ? record?.queryStringParameters?.nodeId
        //     : null;
        log.debug(`recordObj -> ${JSON.stringify(recordObj)}`);
        let getResponse = await getAssetCore(recordObj);
        log.debug(`get Response -> ${JSON.stringify(getResponse)}`);
        if (!getResponse?.type || getResponse?.payload === null) {
            return apiError(404, 'Asset Not Found');
        }
        const params = {
            $and: [
                { companyId: recordObj?.companyId },
                { _id: recordObj?._id },
                { expiryDate: expiryDate() }
            ]
        };
        log.debug(`Params -> ${JSON.stringify(params)}`);
        // let updateObj = JSON.parse(JSON.stringify(getResponse?.payload));
        // log.debug(`updateObj initial -> ${JSON.stringify(updateObj)}`);
        // if (recordObj?.nodeId !== null) {
        //     let found = excludeNode(recordObj?.nodeId, updateObj);
        //     log.debug(`excludeNode Response -> ${JSON.stringify(found)}`);
        //     if (found) {
        //         log.debug(`final updateObj---->${JSON.stringify(updateObj)}`);
        //         let updateResponse = await updateAssetCore(updateObj);
        //         log.debug(`updateResponse---->${JSON.stringify(updateResponse)}`);
        //         if (!updateResponse?.type || updateResponse?.payload === null) {
        //             return apiError(404, updateResponse?.payload);
        //         }
        //         return apiResponse(updateResponse?.payload);
        //     } else {
        //         return apiError(404, { message: 'Node Item not Found' });
        //     }
        // } else {
        let deleteResponse = await deleteRecord(recordObj, requiredFields, params, assets);
        log.debug(`deleteResponse -> ${JSON.stringify(deleteResponse)}`);
        return apiResponse(deleteResponse?.body);
        // }
    } catch (error) {
        log.debug(`error - ${error}`)
        return apiError(500, error)
    }
};

export const updateAsset = async (record) => {
    try {
        let recordObj = JSON.parse(record['body']);
        const requiredFields = ['companyId'];
        recordObj._id = record.pathParameters.id;
        recordObj.companyId = record.requestToken.companyId;
        recordObj.userId = record.requestToken.userId;
        let getResponse = await getAssetCore(recordObj);
        log.debug(`get Response -> ${JSON.stringify(getResponse)}`);
        if (!getResponse?.type || getResponse?.payload === null) {
            return apiError(404, 'Asset Not Found');
        };
        // let updateObj = JSON.parse(JSON.stringify(getResponse?.payload));
        // log.debug(`initial updateObj---->${JSON.stringify(updateObj)}`);
        // let updateResponse;
        // if (recordObj?.nodeId && Types.ObjectId.isValid(recordObj?.nodeId)) {
        //     let found = findNode(recordObj.nodeId, updateObj);
        //     log.debug(`Find Node Response -> ${JSON.stringify(found)}`);
        //     if (!found) {
        //         return apiError(404, { message: 'Node not Found' });
        //     }
        //     delete recordObj?.nodeId;
        //     found = {
        //         ...recordObj,
        //         children: found.children
        //     };
        //     log.debug(`updated found -> ${JSON.stringify(found)}`);
        //     log.debug(`Final updateObj---->${JSON.stringify(updateObj)}`);
        //     updateResponse = await updateAssetCore(updateObj);
        //     log.debug(`updateResponse -> ${JSON.stringify(updateResponse)}`);
        // } else {
        updateResponse = await updateAssetCore(recordObj);
        log.debug(`updateResponse -> ${JSON.stringify(updateResponse)}`);
        // }
        if (!updateResponse?.type || updateResponse?.payload === null) {
            return apiError(404, updateResponse?.payload);
        }
        return apiResponse(updateResponse?.payload);
    } catch (error) {
        log.debug(`error - ${error}`)
        return apiError(500, error)
    }
};

export const updateAssetCore = async (recordObj) => {
    try {
        const requiredFields = ['companyId'];
        const params = {
            $and: [
                { companyId: recordObj?.companyId },
                { _id: recordObj?._id },
                { expiryDate: expiryDate() }
            ]
        };
        log.debug(`Params -> ${JSON.stringify(params)}`);
        let updateResponse = await updateRecord(recordObj, requiredFields, params, assets);
        log.debug(`updateResponse -> ${JSON.stringify(updateResponse)}`);
        return {
            type: true,
            payload: updateResponse?.body ?? null
        };
    } catch (error) {
        log.debug(`error - ${error}`)
        return {
            type: false,
            payload: error
        };
    }
}

export const getAssetByCompany = async (record) => {
    const requiredFields = ['companyId'];
    let recordObj = {};
    try {
        recordObj.companyId = record.requestToken.companyId;
        let optionParams = {
            size: isNaN(Number(record?.queryStringParameters?.size)) ? 50 : Number(record?.queryStringParameters?.size),
            page: isNaN(Number(record?.queryStringParameters?.page)) ? 1 : Number(record?.queryStringParameters?.page),
            searchName: (record?.queryStringParameters?.searchName?.trim() === "")
                ? null
                : record?.queryStringParameters?.searchName ?? null,
        };
        log.debug(`recordObj -> ${JSON.stringify(recordObj)}`);
        log.debug(`optionParams -> ${JSON.stringify(optionParams)}`);
        let getResponse = await getAssetByCompanyCore(recordObj, optionParams);
        log.debug(`get Response -> ${JSON.stringify(getResponse)}`);
        return apiResponse(getResponse?.payload);
    } catch (error) {
        log.debug(`error - ${error}`);
        return apiError(500, error);
    }
};

export const getAssetByCompanyCore = async (recordObj, optionParams) => {
    try {
        let requiredFields = ["companyId"];
        const params = {
            $and: [
                { companyId: recordObj?.companyId },
                { expiryDate: expiryDate() }
            ]
        };
        // if (optionParams?.type !== null) {
        //     params.$and.push({ type: optionParams?.type })
        // }
        if (optionParams?.searchName !== null) {
            params.$and.push({ name: { $regex: optionParams?.searchName, $options: "i" } })
        }
        log.debug(`params -> ${JSON.stringify(params)}`);
        const total = await getRecordCount(params, assets);
        log.debug(`total-->${JSON.stringify(total)}`);
        let skip = Number((optionParams?.page - 1) * optionParams?.size);
        log.debug(`total > skip-->${JSON.stringify(total > skip)}`);
        if (total.count > skip === false) {
            skip = 0;
        }
        log.debug(`skip-->${JSON.stringify(skip)}`);
        let aggrigation = await aggregationAssetRes(params, optionParams?.size, skip);
        log.debug(`aggrigation -> ${JSON.stringify(aggrigation)}`);
        let getResponse = await getRecordWithAggrigation(aggrigation?.payload, assets);
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

const aggregationAssetRes = async (params, limit = 0, skip = 0, sort = null) => {
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
                    from: "TEMPLATE",
                    localField: "assetDatas.template",
                    foreignField: "_id",
                    as: "templates",
                    pipeline: [
                        { $match: { expiryDate: expiryDate() } },
                    ],
                }
            },
            {
                $addFields: {
                    templates: {
                        $map: {
                            input: '$templates',
                            as: 'template',
                            in: '$$template'
                        }
                    }
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


export const validateData = async (recordObj) => {
    try {
        let schema = Yup.object().shape({
            name: Yup.string().required('name is required'),
            // family: Yup.string().required('family is required'),
            // name: Yup.string().required('name is required'),
            // family: Yup.object().required('family is required'),
            // name: Yup.string().required('name is required'),
            // family: Yup.object().required('family is required'),
            // name: Yup.string().required('name is required'),
            // family: Yup.object().required('family is required'),
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
