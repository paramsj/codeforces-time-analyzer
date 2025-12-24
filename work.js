import axios from 'axios';

const BASE_URL = 'https://codeforces.com/api/user.status?handle=';
// use the base url for fectching submission info

const user_URL = 'https://codeforces.com/api/user.info?handles=';
// this is to get maxRating and currentRating, you can change this to ratedList to get contest wise updates

function getPrimaryKey(problem) {
    if(problem.contestId && problem.index) {
        return `${problem.contestId}${problem.index}`;
    }
    if(problem.problemsetName && problem.index) {
        return `${problem.problemsetName}${problem.index}`;
    }
    return `${problem.name}${problem.index}`;
}

async function processSubmissions(handle) {
    const url = `${BASE_URL}${handle}`;
    const info_url = `${user_URL}${handle}`;
    try {
        const res = await axios.get(url);
        const userInfo = await axios.get(info_url);

        if(res.data.status!=='OK' || userInfo.data.status!=='OK') {
            throw new Error('Error fetching data from CF API or the Username might be invalid!');
        }

        const currentRating = userInfo.data.result[0].rating; // get this cause you need it
        const maxRating = userInfo.data.result[0].maxRating; // might as well cause you never know

        const doneSolved = new Map();

        const submissionByRating = {};
        const submissionByYear = {};

        for(const submission of res.data.result) {

            if(submission.verdict !== 'OK') {
                continue;
            }

            // the problem has not got any unique key so we will now make it
            const key = getPrimaryKey(submission.problem);
            //console.log(key);

            // additional error handling might be required if the key turns out to be NULL/undefined or invalid
            if(!doneSolved.has(key)) {
                doneSolved.set(key, {
                    problemId : key,
                    rating : submission.problem.rating || null,
                    tags : submission.problem.tags || [],
                    solved_in : submission.creationTimeSeconds, // we have nnow added this time as well?
                });
                if(submission.problem.rating!=null) {
                    submissionByRating[submission.problem.rating] = (submissionByRating[submission.problem.rating]||0 )+ 1;
                }
                const getYear = new Date(submission.creationTimeSeconds*1000).getFullYear();
                submissionByYear[getYear] = (submissionByYear[getYear] || 0  )+ 1 ;
            }
        }

        console.log("Rating Counts:", submissionByRating);
        console.log("Yearly Counts:", submissionByYear);

        const jsonForModel = {
            username : handle,
            currentRating,
            maxRating,
            solvedProblems: Array.from(doneSolved.values()),
        } // idk how to use this yet

        //console.log(jsonForModel); // isme for some reason you cant see tags
        //console.log(JSON.stringify(jsonForModel, null, 2)); // this is just needed for debug else the above statement still works

        
    } catch (error) {
        console.error(error);
    }
}

processSubmissions('paramj');


//const res = await axios.get(url);

// console.log(res.data.result?.[0].problem.contestId);
// console.log(res.data.result?.[0].problem.index);
// console.log(res.data.result?.[0].problem.tags);

// const key = getPrimaryKey(res.data.result?.[0].problem);


// console.log(key);