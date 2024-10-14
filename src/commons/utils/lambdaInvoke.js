import { AppConfig } from '../environment/appconfig';
import { log } from './logger';
const AWS = require('aws-sdk');
AWS.config.update({ region: AppConfig.REGION });
const lambda = new AWS.Lambda();

export const invokeLambda = async (body, functionName) => {
    try {
        const params = {
            FunctionName: functionName,
            InvocationType: 'RequestResponse',
            Payload: JSON.stringify(body)
        };
        const data = await lambda.invoke(params).promise();
        log.debug(`Api Response--->${JSON.stringify(data)}`);
        const responsePayload = JSON.parse(data.Payload);
        log.debug(`responsePayload--->${JSON.stringify(responsePayload)}`);
        return responsePayload;
    } catch (error) {
        log.debug(`Error Found--->${error}`);
        throw error;
    }
}

// Call the function to perform the invocation
// invokeLambda()
//     .then(response => console.log('Response from Lambda:', response))
//     .catch(err => console.error('Lambda invocation failed:', err));
