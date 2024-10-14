import { AppConfig } from "../commons/environment/appconfig";

export const LAMBDA_ARNS = {
    GET_COMPANY_BY_ID: `arn:aws:lambda:${AppConfig.REGION}:${process.env.ACCOUNT_ID}:function:${process.env.PJ_PREFIX}-comp-companymgmt-api-${process.env.env}-getCompanyById`,
    GET_USER_BY_IDS: `arn:aws:lambda:${AppConfig.REGION}:${process.env.ACCOUNT_ID}:function:${process.env.PJ_PREFIX}-comp-companymgmt-api-${process.env.env}-getUsersByUserIds`,
    GET_PROJECTS_BY_IDS: `arn:aws:lambda:${AppConfig.REGION}:${process.env.ACCOUNT_ID}:function:comp-workspace-api-${process.env.env}-getWorkspaceByIds`,
    GET_TEAMS_BY_IDS: `arn:aws:lambda:${AppConfig.REGION}:${process.env.ACCOUNT_ID}:function:${process.env.PJ_PREFIX}-comp-companymgmt-api-${process.env.env}-getTeamsByIds`,
    GET_TEAMS_BY_USERID: `arn:aws:lambda:${AppConfig.REGION}:${process.env.ACCOUNT_ID}:function:${process.env.PJ_PREFIX}-comp-companymgmt-api-${process.env.env}-getTeamsByUserId`,
    GET_ENV_BY_IDS: `arn:aws:lambda:${AppConfig.REGION}:${process.env.ACCOUNT_ID}:function:comp-appenvs-api-${process.env.env}-getEnvsByIds`,
    GET_COMPANY_CONFIG: `arn:aws:lambda:${AppConfig.REGION}:${process.env.ACCOUNT_ID}:function:comp-studio-api-${process.env.env}-getConfigByTypeAndCompany`,
    CREATE_REPO_AND_CREATE_CONTEXT: `arn:aws:lambda:${AppConfig.REGION}:${process.env.ACCOUNT_ID}:function:${process.env.PJ_PREFIX}-comp-code-studio-api-${process.env.env}-handlerUserUploadedBoilerPlate`,
    API_ROUTES: {
        UPDATE_JIRA_STORY: (storyId) => `${process.env.JIRA_API_URL}/jira/issue/${storyId}`,
    }
}