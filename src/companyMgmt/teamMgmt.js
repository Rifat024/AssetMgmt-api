import { invokeLambda } from "../commons/utils/lambdaInvoke";
import { log } from "../commons/utils/logger";
import { LAMBDA_ARNS } from "../utilFunction/routes";


export const getTeamsCore = async (recordObj) => {
    try {
        log.debug(`recordObj Found--->${JSON.stringify(recordObj)}`);
        const params = {
            companyId: recordObj?.companyId,
            idList: recordObj?.teamIdList
        }
        log.debug(`params Found--->${JSON.stringify(params)}`);
        let teamList = await invokeLambda(params, LAMBDA_ARNS.GET_TEAMS_BY_IDS);
        log.debug(`teamList Found--->${JSON.stringify(teamList)}`);
        return {
            type: true,
            payload: teamList?.payload
        }
    } catch (error) {
        log.debug(`Error Found--->${error}`);
        return {
            type: false,
            payload: error
        }
    }
}

export const getTeamsByUserIdCore = async (recordObj) => {
    try {
        log.debug(`recordObj Found--->${JSON.stringify(recordObj)}`);
        // const params = {
        //     companyId: recordObj?.companyId,
        //     idList: recordObj?.teamIdList
        // }
        // log.debug(`params Found--->${JSON.stringify(params)}`);
        let teamList = await invokeLambda(recordObj, LAMBDA_ARNS.GET_TEAMS_BY_USERID);
        log.debug(`teamList Found--->${JSON.stringify(teamList)}`);
        return {
            type: true,
            payload: teamList?.payload
        }
    } catch (error) {
        log.debug(`Error Found--->${error}`);
        return {
            type: false,
            payload: error
        }
    }
}