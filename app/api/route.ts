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
                text: "You suggest 5-7 songs the user might enjoy based on the vibe, mood, genre, and artist of the song they enter. Format your response with an intro line, then list the songs as a bullet point list, then end with a follow-up question."
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

    const text = response.output_text; // Get response object

    if (!text) {
        return new Response(
            JSON.stringify({ error: "No output text returned" }),
            { status: 500 }
        );
    }

    return new Response(
    JSON.stringify({ result: text }),
    { status: 200 }
    );
}