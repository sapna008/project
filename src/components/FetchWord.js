import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

const FIREBASE_URL = import.meta.env.VITE_API_URL;
const MAX_RETRIES = 3;
const INITIAL_BACKOFF = 1000;

export async function fetchUniqueWord() {
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let retries = 0;
    let backoff = INITIAL_BACKOFF;

    while (retries < MAX_RETRIES) {
        try {
            // 1. Fetch existing words from Firebase *before* generating a new word
            const existingWords = await fetchExistingWord();
            const prompt = `
                Return ONLY the JSON without backticks or language specifiers.
                Generate a random word commonly used in daily life or useful for vocabulary enhancement.
                Ensure that the word is NOT one of the following words: ${existingWords.join(", ")}
                Provide the result in JSON format: {word: "word", meaning: "meaning"}. 
                Return ONLY the JSON response without additional text, explanations, or formatting.
                Return ONLY the JSON without backticks or language specifiers.
            `;

            const result = await model.generateContent(prompt);
            const newWordData = JSON.parse(result.response.text());

            // 2. No need to check again, directly post if the API returned a valid JSON
            if (newWordData && newWordData.word && newWordData.meaning) { // Basic validation
              await axios.post(FIREBASE_URL, newWordData);
              return newWordData;
            } else {
              console.error("Invalid JSON received from API:", newWordData);
              return { word: "Error", meaning: "Invalid word data from API" };
            }
        } catch (error) {
            // ... (rest of the error handling and retry logic remains the same)
            console.error("Error generating content:", error);

            if (error.response && error.response.status === 429) {
                // ... (retry and backoff)
                retries++;
                console.log(`Too Many Requests, retrying in ${backoff / 1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, backoff)); // Backoff
                backoff *= 2; // Exponential backoff
            } else {
                // Other errors (e.g., network issues)
                console.error("Non-429 error:", error);
                return { word: "Error", meaning: "Could not fetch word" }; // Stop retrying for other errors
            }
        }
    }
     return { word: "Error", meaning: "Could not fetch word after multiple retries" };
}


async function fetchExistingWord() {
    try {
        const response = await axios.get(FIREBASE_URL);
        const existingWords = response.data ? Object.values(response.data).map(w => w.word) : [];
        return existingWords;
    } catch (error) {
        console.error("Error fetching words from Firebase:", error);
        return []; // Return empty array if there's an error
    }
}


// ... (Your FloatingWordGame component - no changes needed in this file)