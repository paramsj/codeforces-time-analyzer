import {getResponse} from "./fallBack.js";

/**
 * Converts a total number of seconds into a human-readable string of days, hours, and minutes.
 * @param {number} totalSeconds The total time in seconds.
 * @returns {string} A formatted string, e.g., "1 day, 2 hours, and 30 minutes".
 */
function secondsToDuration(totalSeconds) {
    const SECONDS_IN_MINUTE = 60;
    const SECONDS_IN_HOUR = 3600;
    const SECONDS_IN_DAY = 86400;

    let seconds = Math.floor(totalSeconds);
    const days = Math.floor(seconds / SECONDS_IN_DAY);
    seconds %= SECONDS_IN_DAY;
    const hours = Math.floor(seconds / SECONDS_IN_HOUR);
    seconds %= SECONDS_IN_HOUR;
    const minutes = Math.floor(seconds / SECONDS_IN_MINUTE);

    const parts = [];
    if (days > 0) {
        parts.push(`${days} day${days > 1 ? 's' : ''}`);
    }
    if (hours > 0) {
        parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    }
    if (minutes > 0) {
        parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
    }

    if (parts.length === 0) {
        return 'a few seconds';
    }

    if (parts.length > 1) {
        const lastPart = parts.pop();
        return `${parts.join(', ')} and ${lastPart}`;
    }

    return parts[0];
}

/**
 * Calls the Gemini API to get a funny, fact-based response based on a time duration.
 * @param {number} totalSeconds The total time in seconds to use in the prompt.
 * @returns {Promise<string>} The generated funny response as a string.
 */
async function funnyResponse(totalSeconds) {
    // Generate a user-friendly duration string for the prompt
    const duration = secondsToDuration(totalSeconds);

    // The system instruction defines the persona and rules for the model.
    // The previous instruction to generate a single fact has been removed.
    // const systemInstruction = "Act as a witty, self-aware competitive programming enthusiast. Give 1-2 comparisons. Each comparison should be a witty one-liner or a meme-style roast that exaggerates the time. Use pop culture (anime, games), absurd comparisons (sleep cycles, travel), and programmer-specific jokes (loops, bugs).";

    // // The user query provides the specific input for this API call.
    // const userQuery = `I have spent a total duration of ${duration} on competitive programming. Give me a funny comparison.`;

    const finalPrompt = `Act as a witty, self-aware competitive programming enthusiast.
I have spent a total duration of ${duration} on competitive programming. Give me one funny, clever, and concise comparison.
The comparison should:
1. Be a one-liner or a meme-style roast.
2. Exaggerate the time spent.
3. Use a programmer-specific joke, a pop culture reference (like anime or games), or an absurd real-world comparison.`;

    // Use the API key from environment variables for security.
    const apiKey = process.env.GEMINI_API_KEY; 
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

    // const payload = {
    //     contents: [{ parts: [{ text: userQuery }] }],
    //     systemInstruction: {
    //         parts: [{ text: systemInstruction }]
    //     },
    // };
    const payload = {
    contents: [{ parts: [{ text: finalPrompt }] }],
};

    const maxRetries = 3;
    let retryDelay = 1000; // 1 second
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                // If we get a rate limit error (429), retry with exponential backoff.
                if (response.status === 429) {
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                    retryDelay *= 2; // Double the delay
                    continue; // Go to the next retry attempt
                }
                // For other errors, throw an exception
                const res = getResponse(totalSeconds);
                return res.trim();
            }

            const result = await response.json();
            const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) {
                console.error('API response was empty or malformed.');
                return 'Could not generate a response at this time. Please try again.';
            }
            const res = cleanApiResponse(text);
            return (res.trim());
        } catch (error) {
            console.error('Failed to fetch from Gemini API:', error);
            if (i === maxRetries - 1) {
                return 'An error occurred. Please try again later.';
            }
        }
    }
}

// idk to use or not?
function formatFunnyResponse(text) {
    // Split by lines, filter out empty lines, and wrap in <li>
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const items = lines.map(line => `<li>${line.replace(/^\d+\.\s*/, '')}</li>`).join('');
    return `<ol>${items}</ol>`;
}

function cleanApiResponse(text) {
    // Replace markdown italics and bold markers with their plain text equivalent
    let cleanedText = text.replace(/\*/g, ''); // Removes all asterisks
    cleanedText = cleanedText.replace(/_/g, ''); // Removes all underscores
    return cleanedText;
}

export { funnyResponse };
