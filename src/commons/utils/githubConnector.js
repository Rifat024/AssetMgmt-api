import { Octokit } from "@octokit/rest";
import fetch from "node-fetch";
import { log } from "./logger";

export const connectGithub = async (authToken) => {
    try {
        const octokit = new Octokit({
            auth: authToken,
            request: {
                fetch: fetch
            }
        });
        return {
            type: true,
            payload: octokit
        };
    } catch (error) {
        log.debug(`Error Found-->${error}`);
        return {
            type: true,
            payload: error
        };
    }
}