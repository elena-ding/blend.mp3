import { OpenAI } from "openai";
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request ) {
    const body = await request.json();
    const prompt = body.prompt; // Get user's prompt from request

    const response = await client.responses.create({ // Create response from gpt-5-mini model
        model: "gpt-5-mini",
        input: [
            {
            role: "system",
            content: [
                {
                type: "input_text",
                text: "You suggest songs the user might enjoy based on the vibe, mood, genre, and artist of the song they enter."
                }
            ]
            },
            {
            role: "user",
            content: [
                {
                type: "input_text",
                text: prompt
                }
            ]
            }
        ]
    });

    const first = response.output[0]; // Get first response object

    if (first.type == "message") { // If response is a message
        const content = first.content[0];
        if (content.type === "output_text") { // If output is text
            return new Response(
                JSON.stringify({ result: content.text }), // Return the text
            );
        }
        if (content.type === "refusal") { // If output is not text, return refusal message
             return new Response(
                JSON.stringify({ error: content.refusal }), 
                { status: 400 }
            );
        }
    }

    return new Response( // If response is not message, return error
        JSON.stringify({ error: "Unexpected response type" }), 
        { status: 500 }
    );
}