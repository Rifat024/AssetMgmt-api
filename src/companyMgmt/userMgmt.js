
import { invokeLambda } from "../commons/utils/lambdaInvoke";
import { log } from "../commons/utils/logger"
import { LAMBDA_ARNS } from "../utilFunction/routes";

export const getUserCore = async (recordObj) => {
    try {
        log.debug(`recordObj Found--->${JSON.stringify(recordObj)}`);
        const params = {
            companyId: recordObj?.companyId,
            userIdList: [recordObj?.userId]
        }
        log.debug(`params Found--->${JSON.stringify(params)}`);
        let userList = await invokeLambda(params, LAMBDA_ARNS.GET_USER_BY_IDS);
        log.debug(`userList Found--->${JSON.stringify(userList)}`);
        return {
            type: true,
            payload: userList?.payload[0]
        }
    } catch (error) {
        log.debug(`Error Found--->${error}`);
        return {
            type: false,
            payload: error
        }
    }
}

export const getUserListCore = async (recordObj) => {
    try {
        log.debug(`recordObj Found--->${JSON.stringify(recordObj)}`);
        // const params = {
        //     companyId: recordObj?.companyId,
        //     userIdList: recordObj?.userIdList
        // }
        // log.debug(`params Found--->${JSON.stringify(params)}`);
        let userList = await invokeLambda(recordObj, LAMBDA_ARNS.GET_USER_BY_IDS);
        log.debug(`userList Found--->${JSON.stringify(userList)}`);
        return {
            type: true,
            payload: userList?.payload
        }
    } catch (error) {
        log.debug(`Error Found--->${error}`);
        return {
            type: false,
            payload: error
        }
    }
}