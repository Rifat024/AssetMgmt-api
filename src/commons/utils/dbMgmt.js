import { log } from '../../commons/utils/logger';
import { validateRequestFields } from "../utils/validateUtils";
import { getDbClient } from "../utils/dbConnector";
import { connectMongoDB } from './mongoDB/dbConnector';
import { currentDateTime } from '../constants';


const docClient = getDbClient();


export const addRecord = async (recordObj, requiredFields, tableName) => {
    let response = {};
    try {
        await connectMongoDB();
        const validationResponse = await validateRequestFields(
            recordObj,
            requiredFields
        );
        if (validationResponse === true) {
            // recordObj.creationDate = currentDateTime();
            // recordObj.lastUpdatedDate=currentDateTime();
            // const params = {
            //     TableName: tableName,
            //     Item: recordObj,
            // };

            log.debug(`params -> ${JSON.stringify(recordObj)}`);
            // const data = await docClient.put(params).promise();
            const data = await tableName.insertMany(recordObj);
            log.debug(`data -> ${JSON.stringify(data)}`);
            response = { 'body': data, 'statusCode': '200' }
            log.debug(`response ${JSON.stringify(response)}`)
            return response;
        } else {
            log.debug(`Required data is missing ${validationResponse}`);
            let errorMsg = validationResponse;
            response = { 'body': 'INSERT_FAILED', 'description': errorMsg, 'statusCode': '501' };
            return response;
        }
    } catch (error) {
        log.debug(`addNewReceiverInfo|error -> ${error}`);
        response = { 'body': 'INSERT_FAILED', 'description': error, 'statusCode': '500' }
        return response;
        //throw new Error(error);
    }

};

export const addBatchRecord = async (recordObj, requiredFields, tableName) => {
    let response = {};
    try {
        await connectMongoDB();
        // const validationResponse = await validateRequestFields(
        //   recordObj,
        //   requiredFields
        // );
        // if (validationResponse === true) {
        // recordObj.creationDate = currentDateTime();
        // recordObj.lastUpdatedDate=currentDateTime();
        // const params = {
        //     TableName: tableName,
        //     Item: recordObj,
        // };

        log.debug(`params -> ${JSON.stringify(recordObj)}`);
        // const data = await docClient.put(params).promise();
        const data = await tableName.insertMany(recordObj, { ordered: false });
        log.debug(`data -> ${JSON.stringify(data)}`);
        response = { 'body': data, 'statusCode': '200' }
        log.debug(`response ${JSON.stringify(response)}`)
        return response;
        // } else {
        //   log.debug(`Required data is missing ${validationResponse}`);
        //   let errorMsg = validationResponse;
        //   response = { 'body': 'INSERT_FAILED', 'description': errorMsg, 'statusCode': '501' };

        //   return response;

        // }
    } catch (error) {
        log.debug(`addNewReceiverInfo|error -> ${error}`);
        response = { 'body': 'INSERT_FAILED', 'description': error, 'statusCode': '500' }
        return response;
        //throw new Error(error);
    }

};

export async function updateRecord(recordObj, requiredFields, params, tableName) {
    let response = {};
    try {
        await connectMongoDB();
        const validationResponse = await validateRequestFields(
            recordObj,
            requiredFields
        );
        if (validationResponse === true) {

            // recordObj.lastUpdatedDate = currentDateTime();
            // let updateExpressionInfo = getUpdateExpressions(
            //     recordObj,
            //     pkFieldNm,
            //     skFieldNm
            // );
            // const params = {
            //     TableName: tableName,
            //     // Key: {
            //     //   otpCampaignId: recordObj.otpCampaignId,
            //     //   journeyCode: recordObj.journeyCode,
            //     // },
            //     Key: keyObj,
            //     UpdateExpression: updateExpressionInfo.updateExpression,
            //     ExpressionAttributeValues: {
            //         ...updateExpressionInfo.expressionAttributeValues,
            //     },
            //     ReturnValues: "UPDATED_NEW",
            // };

            log.debug(`params -> ${JSON.stringify(params)}`);
            // const data = await docClient.update(params).promise();
            let data = await tableName.findOneAndUpdate(params, recordObj);
            log.debug(`data is ${JSON.stringify(data)}`);
            let getResponse = await tableName.findOne(params);
            log.debug(`getResponse ${JSON.stringify(getResponse)}`);
            response = { 'body': getResponse, 'statusCode': '200' }
            return response;
        } else {
            log.debug(`Required data is missing ${validationResponse}`);
            let errorMsg = validationResponse;
            response = { 'body': 'UPDATE_FAILED', 'description': errorMsg, 'statusCode': '501' };

            return response;

        }

    } catch (error) {
        log.debug(`updateRecord| error -> ${error}`);
        response = { 'body': 'UPDATE_FAILED', 'description': error, 'statusCode': '500' }
        return response;
        //throw new Error(error);
    }
};

export async function getRecord(recordObj, requiredFields, params, tableName, limit = 0, skip = 0, sortBy = null, projection = null) {
    let response = {};
    try {
        await connectMongoDB();
        const validationResponse = await validateRequestFields(
            recordObj,
            requiredFields
        );
        log.debug(`validationResponse -> ${validationResponse}`);
        if (validationResponse === true) {
            log.debug(`params -> ${JSON.stringify(params)}`);
            log.debug(`sortBy -> ${JSON.stringify(sortBy)}`);
            log.debug(`projection -> ${JSON.stringify(projection)}`);
            let query;
            if (projection !== null) {
                query = tableName.find(params, projection)
            } else {
                query = tableName.find(params);
            }
            if (limit > 0) {
                query = query.limit(limit);
            }
            if (skip > 0) {
                query = query.skip(skip);
            }
            if (sortBy !== null) {
                query = query.sort(sortBy)
            } else {
                query = query.sort({ createdAt: -1 });
            }
            const dataResponse = await query;
            log.debug(`data is waitin.....`);
            log.debug(`data is ${JSON.stringify(dataResponse)}`);
            response = { 'body': dataResponse, 'statusCode': '200' };
            return response;
        } else {
            log.debug(`Required data is missing ${validationResponse}`);
            let errorMsg = validationResponse;
            response = { 'body': 'GET_FAILED', 'description': errorMsg, 'statusCode': '501' };

            return response;
        }
    } catch (error) {
        log.debug("here............errorrrrrr 3333333333333");
        log.debug(`here............errorrrrrr ${error}`);
        log.debug(`getRecord|  error -> ${error}`);
        response = { 'body': 'GET_FAILED', 'description': error, 'statusCode': '500' }
        return response;
        //throw new Error(error);
    }
}

export async function getRecordWithAggrigation(params, tableName) {
    let response = {};
    try {
        await connectMongoDB();
        log.debug(`params -> ${JSON.stringify(params)}`);
        const dataResponse = await tableName.aggregate(params);
        log.debug(`data is waitin.....`);
        log.debug(`data is ${JSON.stringify(dataResponse)}`);
        response = { 'body': dataResponse, 'statusCode': '200' };
        return response;
    } catch (error) {
        log.debug("here............errorrrrrr 3333333333333");
        log.debug(`here............errorrrrrr ${error}`);
        log.debug(`getRecord|  error -> ${error}`);
        response = { 'body': 'GET_FAILED', 'description': error, 'statusCode': '500' }
        return response;
        //throw new Error(error);
    }
}

export async function getRecordCount(params, tableName) {
    let response = {};
    try {
        await connectMongoDB();
        // const validationResponse = await validateRequestFields(
        //   recordObj,
        //   requiredFields
        // );
        // log.debug(`validationResponse -> ${validationResponse}`);
        // if (validationResponse === true) {
        // log.debug(`params -> ${JSON.stringify(params)}`);
        // log.debug(`sortBy -> ${JSON.stringify(sortBy)}`);
        let dataResponse = await tableName.countDocuments(params);
        // if (limit > 0) {
        //   query = query.limit(limit);
        // }
        // if (skip > 0) {
        //   query = query.skip(skip);
        // }
        // if (sortBy !== null) {
        //   query = query.sort(sortBy)
        // }
        // const dataResponse = await query;
        log.debug(`data is waitin.....`);
        log.debug(`data is ${JSON.stringify(dataResponse)}`);
        response = { 'count': dataResponse, 'statusCode': '200' };
        return response;
        // } else {
        //   log.debug(`Required data is missing ${validationResponse}`);
        //   let errorMsg = validationResponse;
        //   response = { 'body': 'GET_FAILED', 'description': errorMsg, 'statusCode': '501' };

        //   return response;
        // }
    } catch (error) {
        log.debug("here............errorrrrrr 3333333333333");
        log.debug(`here............errorrrrrr ${error}`);
        log.debug(`getRecord|  error -> ${error}`);
        response = { 'body': 'GET_FAILED', 'description': error, 'statusCode': '500' }
        return response;
        //throw new Error(error);
    }
}

export const deleteRecord = async (recordObj, requiredFields, params, tableName) => {
    let response = {};
    try {
        await connectMongoDB();
        const validationResponse = validateRequestFields(recordObj, requiredFields);

        if (validationResponse === true) {
            // const params = {
            //     TableName: tableName,
            //     Key: keyObj
            // };

            // if (conditionExpression != null && expressionAttributeValues != null) {
            //     params.ConditionExpression = conditionExpression;
            //     params.ExpressionAttributeValues = expressionAttributeValues;
            // }
            log.debug(`delete params -> ${JSON.stringify(params)}`);

            // const data = await docClient.delete(params).promise();
            recordObj.expiryDate = currentDateTime()
            const data = await tableName.findOneAndUpdate(params, recordObj);
            log.debug(`delete response is ${JSON.stringify(data)}`);
            params.$and = params.$and.filter(obj => !obj.expiryDate);
            log.debug(`delete params after pop expiryDate -> ${JSON.stringify(params)}`);
            let getResponse = await tableName.findOne(params);
            log.debug(`getResponse ${JSON.stringify(getResponse)}`);
            response = { 'body': getResponse, 'statusCode': '200' }

            return response;
        } else {
            log.debug(`Required data is missing ${validationResponse}`);
            let errorMsg = validationResponse;
            response = { 'body': 'DELETE_FAILED', 'description': errorMsg, 'statusCode': '501' };

            return response;

        }

    } catch (error) {
        log.debug(`deleteRecord| error -> ${error}`);
        response = { 'body': 'DELETE_FAILED', 'description': error, 'statusCode': '500' }
        return response;
        //throw new Error(error);
    }
}

export const deleteRecordHard = async (recordObj, requiredFields, params, tableName) => {
    let response = {};
    try {
        await connectMongoDB();
        const validationResponse = validateRequestFields(recordObj, requiredFields);

        if (validationResponse === true) {
            log.debug(`delete params -> ${JSON.stringify(params)}`);
            // // const data = await docClient.delete(params).promise();
            // recordObj.expiryDate = currentDateTime()
            // const data = await tableName.findOneAndUpdate(params, recordObj);
            // log.debug(`delete response is ${JSON.stringify(data)}`);
            // params.$and = params.$and.filter(obj => !obj.expiryDate);
            // log.debug(`delete params after pop expiryDate -> ${JSON.stringify(params)}`);
            let deleteResponse = await tableName.deleteOne(params);
            log.debug(`deleteResponse ${JSON.stringify(deleteResponse)}`);
            response = { 'body': deleteResponse, 'statusCode': '200' }

            return response;
        } else {
            log.debug(`Required data is missing ${validationResponse}`);
            let errorMsg = validationResponse;
            response = { 'body': 'DELETE_FAILED', 'description': errorMsg, 'statusCode': '501' };

            return response;

        }

    } catch (error) {
        log.debug(`deleteRecord| error -> ${error}`);
        response = { 'body': 'DELETE_FAILED', 'description': error, 'statusCode': '500' }
        return response;
        //throw new Error(error);
    }
}

export const deleteBatchRecords = async (recordObj, requiredFields, params, tableName) => {
    let response = {};
    try {
        await connectMongoDB();
        const validationResponse = validateRequestFields(recordObj, requiredFields);

        if (validationResponse === true) {
            // const params = {
            //     TableName: tableName,
            //     Key: keyObj
            // };

            // if (conditionExpression != null && expressionAttributeValues != null) {
            //     params.ConditionExpression = conditionExpression;
            //     params.ExpressionAttributeValues = expressionAttributeValues;
            // }
            log.debug(`delete params -> ${JSON.stringify(params)}`);

            // const data = await docClient.delete(params).promise();
            const data = await tableName.deleteMany(params);
            log.debug(`delete response is ${JSON.stringify(data)}`);

            response = { 'body': data, 'statusCode': '200' }

            return response;
        } else {
            log.debug(`Required data is missing ${validationResponse}`);
            let errorMsg = validationResponse;
            response = { 'body': 'DELETE_FAILED', 'description': errorMsg, 'statusCode': '501' };

            return response;

        }

    } catch (error) {
        log.debug(`deleteRecord| error -> ${error}`);
        response = { 'body': 'DELETE_FAILED', 'description': error, 'statusCode': '500' }
        return response;
        //throw new Error(error);
    }
}

export async function updateBatchRecord(recordObj, requiredFields, params, tableName) {
    let response = {};
    try {
        await connectMongoDB();
        // const validationResponse = await validateRequestFields(
        //   recordObj,
        //   requiredFields
        // );
        // if (validationResponse === true) {

        log.debug(`params -> ${JSON.stringify(params)}`);
        let data = await tableName.updateMany(params, recordObj);
        // Check if any documents were updated
        if (data.matchedCount === 0) {
            response = { 'body': 'No records found to update', 'statusCode': '404' };
            return response;
        }
        log.debug(`data is ${JSON.stringify(data)}`);
        params.$and = params.$and.filter(obj => !obj.expiryDate);
        let getResponse = await tableName.find(params);
        log.debug(`getResponse ${JSON.stringify(getResponse)}`);
        response = { 'body': getResponse, 'statusCode': '200' }
        return response;
        // } else {
        //   log.debug(`Required data is missing ${validationResponse}`);
        //   let errorMsg = validationResponse;
        //   response = { 'body': 'UPDATE_FAILED', 'description': errorMsg, 'statusCode': '501' };

        //   return response;

        // }

    } catch (error) {
        log.debug(`updateRecord| error -> ${error}`);
        response = { 'body': 'UPDATE_FAILED', 'description': error, 'statusCode': '500' }
        return response;
        //throw new Error(error);
    }
};
