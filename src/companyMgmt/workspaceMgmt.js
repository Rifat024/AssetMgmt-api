import { invokeLambda } from "../commons/utils/lambdaInvoke";
import { log } from "../commons/utils/logger";
import { LAMBDA_ARNS } from "../utilFunction/routes";


export const getProjectCore = async (recordObj) => {
    try {
        log.debug(`recordObj Found--->${JSON.stringify(recordObj)}`);
        const params = {
            companyId: recordObj?.companyId,
            IdList: [recordObj?.projectId]
        }
        log.debug(`params Found--->${JSON.stringify(params)}`);
        let projectList = await invokeLambda(params, LAMBDA_ARNS.GET_PROJECTS_BY_IDS);
        log.debug(`projectList Found--->${JSON.stringify(projectList)}`);
        return {
            type: true,
            payload: projectList?.payload[0]
        }
    } catch (error) {
        log.debug(`Error Found--->${error}`);
        return {
            type: false,
            payload: error
        }
    }
}

export const getProjectListCore = async (recordObj) => {
    try {
        log.debug(`recordObj Found--->${JSON.stringify(recordObj)}`);
        const params = {
            companyId: recordObj?.companyId,
            IdList: recordObj?.IdList
        }
        log.debug(`params Found--->${JSON.stringify(params)}`);
        let projectList = await invokeLambda(params, LAMBDA_ARNS.GET_PROJECTS_BY_IDS);
        log.debug(`projectList Found--->${JSON.stringify(projectList)}`);
        return {
            type: true,
            payload: projectList?.payload
        }
    } catch (error) {
        log.debug(`Error Found--->${error}`);
        return {
            type: false,
            payload: error
        }
    }
}