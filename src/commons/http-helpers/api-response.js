import { log } from '../utils/logger';
import { disconnectDatabase } from '../utils/mongoDB/dbConnector';

export const apiResponse = async (response) => {
  await disconnectDatabase();
  log.debug(`response from apiResponse ==> ${JSON.stringify(response)}`);
  const httpResponse = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*', // Required for CORS support to work
      'Access-Control-Max-Age': '3600',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,HEAD,OPTIONS'
    },
    body: Object.keys(response).length > 0 ? JSON.stringify(response) : '{"status":"NO_RECORDS_FOUND"}'
  };
  log.debug('apiResponse: ' + JSON.stringify(httpResponse));
  return httpResponse;
}


export const apiError = async (statusCode, errorDesc) => {
  await disconnectDatabase();
  log.debug('errorDesc: ' + JSON.stringify(errorDesc));
  const response = {
    statusCode: statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(errorDesc) ?? errorDesc,
  };
  log.debug('api error Response: ' + JSON.stringify(response));
  return response;
}