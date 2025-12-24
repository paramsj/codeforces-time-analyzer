import { getResponse } from "./fallBack.js";
import { Groq } from 'groq-sdk';

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
    if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);

    if (parts.length === 0) return 'a few seconds';
    if (parts.length > 1) {
        const lastPart = parts.pop();
        return `${parts.join(', ')} and ${lastPart}`;
    }
    return parts[0];
}

async function funnyResponse(totalSeconds) {
    // ✅ Check if API key exists
    if (!process.env.GROQ_API_KEY) {
        console.warn('GROQ_API_KEY not set. Using fallback response.');
        return getResponse(totalSeconds).trim();
    }

    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,  // ✅ Fixed typo
    });

    const duration = secondsToDuration(totalSeconds);

    const finalPrompt = `Act as a witty, self-aware competitive programming enthusiast.
I have spent a total duration of ${duration} on competitive programming. Give me one funny, clever, and concise comparison.
The comparison should:
1. Be a one-liner or a meme-style roast.
2. Exaggerate the time spent.
3. Use a programmer-specific joke, a pop culture reference (like anime or games), or an absurd real-world comparison.`;

    const maxRetries = 3;
    let retryDelay = 1000;

    for (let i = 0; i < maxRetries; i++) {
        try {
            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "user",
                        content: finalPrompt,
                    },
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.8,
                max_completion_tokens: 1024,
                top_p: 1,
                stream: false,
            });

            const text = chatCompletion.choices[0]?.message?.content;

            if (!text) {
                console.error('Groq response was empty.');
                // ✅ Continue to next retry instead of returning immediately
                if (i === maxRetries - 1) {
                    return getResponse(totalSeconds).trim();
                }
                continue;
            }

            return cleanApiResponse(text).trim();

        } catch (error) {
            console.error(`Groq API error (attempt ${i + 1}/${maxRetries}):`, error.message);

            // ✅ Rate limit handling
            if (error.status === 429 && i < maxRetries - 1) {
                console.warn(`Rate limited. Retrying in ${retryDelay}ms...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                retryDelay *= 2;
                continue;
            }

            // ✅ On final retry, use fallback
            if (i === maxRetries - 1) {
                console.warn('All retries exhausted. Using fallback response.');
                return getResponse(totalSeconds).trim();
            }
        }
    }

    // ✅ Fallback if loop exits without returning
    return getResponse(totalSeconds).trim();
}

function cleanApiResponse(text) {
    return text.replace(/[\*_]/g, '');
}

export { funnyResponse };