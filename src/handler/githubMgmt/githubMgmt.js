import { AppConfig } from "../../commons/environment/appconfig";
import { apiError, apiResponse } from "../../commons/http-helpers/api-response";
import { connectGithub } from "../../commons/utils/githubConnector";
import { log } from "../../commons/utils/logger";
import { getCompanyConfigCore, getCompanyCore } from "../../companyMgmt/companyMgmt";
import { getCodeSpecificationCore } from "../specificationMgmt/codeSpecificationMgmt";

export const getGitHubRepos = async (record) => {
    try {
        let recordObj = {};
        recordObj.companyId = record.requestToken.companyId;
        recordObj.userId = record.requestToken.userId;
        recordObj.isAdmin = true;
        log.debug(`recordObj---->${JSON.stringify(recordObj)}`);
        let companyInfo = await getCompanyConfigCore(recordObj);
        log.debug(`companyInfo---->${JSON.stringify(companyInfo)}`);
        if (!companyInfo?.type || companyInfo?.payload === null) {
            return apiError(404, { message: 'GitHub Credentials not Found in Company Level.Please set githubAuth and try again' })
        }
        const octokit = await connectGithub(companyInfo?.payload?.data?.githubAuth);
        log.debug(`octokit---->${JSON.stringify(octokit)}`);
        const response = await octokit.payload.rest.repos.listForAuthenticatedUser({
            type: 'owner',
            per_page: 100
        });
        log.debug(`response---->${JSON.stringify(response)}`);
        return apiResponse(response?.data);
    } catch (error) {
        log.debug(`error---->${error}`);
        return apiError(error);
    }
}

export const getRepoContentPath = async (record) => {
    try {
        let recordObj = JSON.parse(record['body']);
        recordObj.companyId = record.requestToken.companyId;
        recordObj.userId = record.requestToken.userId;
        recordObj.isAdmin = true;
        log.debug(`recordObj---->${JSON.stringify(recordObj)}`);
        let companyInfo = await getCompanyConfigCore(recordObj);
        log.debug(`companyInfo---->${JSON.stringify(companyInfo)}`);
        if (!companyInfo?.type || companyInfo?.payload === null) {
            return apiError(404, { message: 'GitHub Credentials not Found in Company Level.Please set githubAuth and try again' })
        }
        const octokit = await connectGithub(companyInfo?.payload?.data?.githubAuth);
        log.debug(`octokit---->${JSON.stringify(octokit)}`);

        let getResponse = await getCodeSpecificationCore({
            companyId: recordObj?.companyId,
            _id: recordObj?.repoId
        });
        log.debug(`getResponse---->${JSON.stringify(getResponse)}`);
        if (!getResponse?.type || getResponse?.payload === null) {
            return apiError(404, { message: "Code Specification Not Found" });
        }
        const owner = getResponse?.payload?.owner?.login;
        const repo = getResponse?.payload?.repoName;
        const path = ''
        let response = await fetchAllFiles(owner, repo, path, recordObj?.branch, octokit?.payload);
        log.debug(`response---->${JSON.stringify(response)}`);
        return apiResponse(response);
    } catch (error) {
        log.debug(`error---->${error}`);
        return apiError(error);
    }
}

export const getRepoContents = async (record) => {
    try {
        let recordObj = JSON.parse(record['body']);
        recordObj.companyId = record.requestToken.companyId;
        recordObj.userId = record.requestToken.userId;
        recordObj.isAdmin = true;
        log.debug(`recordObj---->${JSON.stringify(recordObj)}`);
        let companyInfo = await getCompanyConfigCore(recordObj);
        log.debug(`companyInfo---->${JSON.stringify(companyInfo)}`);
        if (!companyInfo?.type || companyInfo?.payload === null) {
            return apiError(404, { message: 'GitHub Credentials not Found in Company Level.Please set githubAuth and try again' })
        }
        const octokit = await connectGithub(companyInfo?.payload?.data?.githubAuth);
        log.debug(`octokit---->${JSON.stringify(octokit)}`);

        let getResponse = await getCodeSpecificationCore({
            companyId: recordObj?.companyId,
            _id: recordObj?.repoId
        });
        log.debug(`getResponse---->${JSON.stringify(getResponse)}`);
        if (!getResponse?.type || getResponse?.payload === null) {
            return apiError(404, { message: "Code Specification Not Found" });
        }
        const owner = getResponse?.payload?.owner?.login;
        const repo = getResponse?.payload?.repoName;
        // const path = ''
        let response = await fetchFileContent(owner, repo, recordObj?.path, recordObj?.branch, octokit?.payload);
        log.debug(`response---->${JSON.stringify(response)}`);
        const fileContent = Buffer.from(response?.content, 'base64').toString('utf8');
        log.debug(`fileContent---->${JSON.stringify(fileContent)}`);
        // const jsonObj = JSON.parse(fileContent);
        // log.debug(`jsonObj---->${JSON.stringify(jsonObj)}`);
        return apiResponse({ fileContent: fileContent });
    } catch (error) {
        log.debug(`error---->${error}`);
        return apiError(error);
    }
}


async function fetchAllFiles(owner, repo, path = '', branch = 'main', octokit) {
    try {
        const { data } = await octokit.repos.getContent({
            owner,
            repo,
            path,
            ref: branch,
        });
        log.debug(`data---->${JSON.stringify(data)}`);
        // if (typeof data === 'object' && data !== null) {
        //     return data;
        // }
        let files = [];

        for (const item of data) {
            if (item.type === 'file') {
                files.push(item.path);
            } else if (item.type === 'dir') {
                const dirFiles = await fetchAllFiles(owner, repo, item.path, branch, octokit);
                files = files.concat(dirFiles);
            }
        }
        return files;
    } catch (error) {
        log.debug('Error fetching files:', error);
        return [];
    }
}

export const fetchFileContent = async (owner, repo, path, branch, octokit) => {
    try {
        const { data } = await octokit.repos.getContent({
            owner,
            repo,
            path,
            ref: branch,
        });
        log.debug(`data---->${JSON.stringify(data)}`);
        if (typeof data === 'object' && data !== null) {
            return data;
        }
        // let files = [];

        // for (const item of data) {
        //     if (item.type === 'file') {
        //         files.push(item.path);
        //     } else if (item.type === 'dir') {
        //         const dirFiles = await fetchAllFiles(owner, repo, item.path, branch, octokit);
        //         files = files.concat(dirFiles);
        //     }
        // }
        // return files;
    } catch (error) {
        log.debug('Error fetching files:', error);
        return [];
    }
}

export const formatFileContent = async (input) => {
    try {
        const lines = input.split('\n').filter(line => line.trim() !== '');
        const result = [];

        lines.forEach(line => {
            const [key, value] = line.split('=').map(part => part.trim());
            result.push({
                key: key,
                value: value,
                type: "String"
            })
        });
        log.debug(`Result-->${JSON.stringify(result)}`)
        return {
            type: true,
            payload: result
        }
    } catch (error) {
        console.error(`Error Found: ${error}`);
        return {
            type: false,
            payload: error
        };
    }
}
