
import { AppConfig } from "../commons/environment/appconfig";
import { invokeLambda } from "../commons/utils/lambdaInvoke";
import { log } from "../commons/utils/logger"
import { LAMBDA_ARNS } from "../utilFunction/routes";

export const getCompanyCore = async (recordObj) => {
    try {
        log.debug(`recordObj Found--->${JSON.stringify(recordObj)}`);
        // const params = {
        //     companyId: recordObj?.companyId,
        // }
        // log.debug(`params Found--->${JSON.stringify(params)}`);
        let companyInfo = await invokeLambda(recordObj, LAMBDA_ARNS.GET_COMPANY_BY_ID);
        log.debug(`companyInfo Found--->${JSON.stringify(companyInfo)}`);
        return {
            type: true,
            payload: companyInfo?.payload ?? null
        }
    } catch (error) {
        log.debug(`Error Found--->${error}`);
        return {
            type: false,
            payload: error
        }
    }
}

export const getCompanyConfigCore = async (recordObj) => {
    try {
        log.debug(`recordObj Found--->${JSON.stringify(recordObj)}`);
        recordObj.type=AppConfig.CONFIG.GIT_HUB;
        let companyInfo = await invokeLambda(recordObj, LAMBDA_ARNS.GET_COMPANY_CONFIG);
        log.debug(`companyInfo Found--->${JSON.stringify(companyInfo)}`);
        return {
            type: true,
            payload: companyInfo?.payload ?? null
        }
    } catch (error) {
        log.debug(`Error Found--->${error}`);
        return {
            type: false,
            payload: error
        }
    }
}