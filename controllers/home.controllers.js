import { ApiError} from "../utils/ApiError.js";
import { ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler } from "../utils/asyncHandler.js";
import { processSubmissions} from "../utils/processSubmissions.js";
import { processSubmissionsinRange} from "../utils/processSubmissionsinRange.js";
// import { funnyResponse } from "../utils/funnyResponse.js";
import { getResponse } from "../utils/fallBack.js";
import { funnyResponse } from "../utils/GroqResponse.js";

const getHome = (req, res) => {
    res.status(200).json({
        message: "Welcome to the Home Page"
    });
}; // this is still messy

const getPredictions = asyncHandler(async(req,res)=>{
    const {username} = req.body;
    try {

        if(!username) {
            throw new ApiError(400, "Username is required");
        };
        const result = await processSubmissions(username);
        // commnent this out
        //return res.status(200).json(new ApiResponse(200, result, "User data fetched successfully"));
        // the flask server point
        console.log(result);
        if(!result || !result.solvedProblems || result.solvedProblems.length === 0) {
            throw new ApiError(400,"Either the username is invalid or you haven't solved any problems :(")
        }

        // adding count by rating here
    const ratingCounts = {};
    const yearCounts = {};
    
    result.solvedProblems.forEach(problem => {
        const year = new Date(problem.solved_in * 1000).getFullYear();
        const rating = problem.rating;
        console.log(year);
        if(year===2025) {
            ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
        }
        yearCounts[year] = (yearCounts[year] || 0) + 1;
    });



        // we need to change this as i cannot change the fastapi structure
        const requestBody = {
            user_rating: result.currentRating,
            problems: result.solvedProblems.map(prob => ({
                name: prob.problemId,      
                rating: prob.rating,
                tags: prob.tags
            }))
        };
        console.log(requestBody);

        console.log(process.env.NORMAL_URl);
        
        const predictions = await fetch(process.env.FASTAPI_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' ,
                'Authorization' : `Bearer ${process.env.TIME_TALE_GET_TOKEN}`
            },
            body: JSON.stringify(requestBody)
        });

        if(!predictions.ok) {
            throw new ApiError(500, `There is some issue with the FastApi ${predictions.status}`);
        }

        console.log(predictions);
        const data = await predictions.json();
        // Sum all predicted_time_seconds values in the predictions array
        const totalSeconds = data?.predictions
        ?.map(pred => Number(pred.predicted_time_seconds) || 0)
        .reduce((sum, seconds) => sum + seconds, 0);

        // If predictionData or predictions is missing, totalSeconds will be 0
        
        const funny = await funnyResponse(totalSeconds); // for now remove 
        //const funny = "hello here once again"; // temporarily 
        return res.status(200).json(new ApiResponse(200, {totalSeconds, funny, ratingCounts}, "Predictions fetched successfully"));

    } catch(error) {
        throw error;
    }
});


// could be overloaded in the future
const getPredictionsinRange = asyncHandler(async(req,res)=>{
    const {username , minRating , maxRating} = req.body;

    // letss hope this works
    if(!username) {
        throw new ApiError(400, "Username is required");
    };
    try {
        const result = await processSubmissionsinRange(username, minRating, maxRating);

        // commnent this out
        //return res.status(200).json(new ApiResponse(200, result, "User data fetched successfully"));
        // the flask server point

        console.log(result);    
        // we need to change this as i cannot change the fastapi structure
        if(!result || !result.solvedProblems || result.solvedProblems.length === 0) {
            throw new ApiError(400,"Either the username is invalid or you haven't solved any problems in this range :(")
        }
        const requestBody = {
            user_rating: result.currentRating,
            problems: result.solvedProblems.map(prob => ({
                name: prob.name,      
                rating: prob.rating,
                tags: prob.tags
            }))
        };
        console.log(requestBody);

        const predictions = await fetch(process.env.FASTAPI_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' ,
                'Authorization' : `Bearer ${process.env.TIME_TALE_GET_TOKEN}`
            },
            body: JSON.stringify(requestBody)
        });

        if(!predictions.ok) {
            throw new ApiError(500, `There is some issue with the FastApi ${predictions.status}`);
        }
        const data = await predictions.json();

        const predictionsWithMeta = data.predictions.map((pred, idx) => {
            const prob = result.solvedProblems[idx];
            return {
                ...pred,
                contestId: prob.contestId,
                index: prob.index,
                rating : prob.rating
            };
        });

        return res.status(200).json(new ApiResponse(200, predictionsWithMeta, "Predictions fetched successfully"));
    } catch(error) {
        console.log(error);
        throw error;
    }
});

export {getHome,getPredictions , getPredictionsinRange};