import { ApiError } from "./ApiError.js";
import {getPrimaryKey} from "./getPrimaryKey.js";
import axios from "axios";

const BASE_URL = 'https://codeforces.com/api/user.status?handle=';
// use the base url for fectching submission info

const user_URL = 'https://codeforces.com/api/user.info?handles=';
// this is to get maxRating and currentRating, you can change this to ratedList to get contest wise updates

async function processSubmissions(handle) {
    const encodedHandle = encodeURIComponent(handle);
    const url = `${BASE_URL}${encodedHandle}`;
    const info_url = `${user_URL}${encodedHandle}`;
    try {
        const res = await axios.get(url);
        const userInfo = await axios.get(info_url);

        if(res.data.status!=='OK' || userInfo.data.status!=='OK') {
            throw new ApiError(400, 'Error fetching data from CF API or the Username might be invalid!');
        }

        const currentRating = userInfo.data.result[0].rating; // get this cause you need it
        const maxRating = userInfo.data.result[0].maxRating; // might as well cause you never know

        const doneSolved = new Map();
        for(const submission of res.data.result) {

            if(submission.verdict !== 'OK' || submission.problem.rating === undefined || submission.problem.tags === undefined) {
                continue;
            }

            // the problem has not got any unique key so we will now make it
            const key = getPrimaryKey(submission.problem);
            //console.log(key);

            // additional error handling might be required if the key turns out to be NULL/undefined or invalid
            if(!doneSolved.has(key)) {
                doneSolved.set(key, {
                    problemId : key,
                    rating : submission.problem.rating || null, // this can never be null
                    tags : submission.problem.tags || [], // same for this, else FastApi will throw an error
                    solved_in : submission.creationTimeSeconds // newly added, its in UNIX, need to convert to YR
                });
            }
        }
        
        const jsonForModel = {
            username : handle,
            currentRating: currentRating || 1500,
            maxRating,
            solvedProblems: Array.from(doneSolved.values()),
        } // idk how to use this yet

        //console.log(jsonForModel); // isme for some reason you cant see tags
        //console.log(JSON.stringify(jsonForModel, null, 2)); // this is just needed for debug else the above statement still works
        return jsonForModel;
    } catch (error) {
        console.error(error);
        if (error instanceof ApiError) {
            throw error;
        }
        
        // Handle axios errors (like network issues or 404 from CF API)
        if (error.response && error.response.status === 400) {
            throw new ApiError(404, "User not found. Please check the username and try again.");
        }
        
        // For other errors, throw a generic message
        throw new ApiError(500, "Failed to fetch user data. Please try again later.");
    }
}

export { processSubmissions };