import { OpenAI } from 'openai'; // import openai package
import * as dotenv from 'dotenv'; // for handling environment variables
dotenv.config(); // load environment variables from .env file

// Initialize the OpenAI instance
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function segregateWithOpenAI(fullDescription: string): Promise<{ companyDescription: string; jobDescription: string }> {
    const prompt = `Separate the following text into a concise company description and a detailed job description:\n\n${fullDescription}\n\nCompany Description:\nJob Description:`;

    try {
        const completion = await openai.completions.create({
            model: "gpt-3.5-turbo-instruct",
            prompt: prompt,
            max_tokens: 500,
            temperature: 0.3,
        });

        const responseText = completion.choices[0].text;

        // Simple splitting - this might need adjustment depending on OpenAI's output
        const parts = responseText.split('Job Description:');
        const companyDescription = parts[0].replace('Company Description:', '').trim();
        const jobDescription = parts[1].trim();

        return { companyDescription, jobDescription };

    } catch (error) {
        console.error('OpenAI Error:', error);
        return { companyDescription: '', jobDescription: '' };
    }
}

// Example usage
const inputDescription = "Your full description text here...";
// segregateWithOpenAI(inputDescription).then(result => {
//     console.log('Company Description:', result.companyDescription);
//     console.log('Job Description:', result.jobDescription);
// });
// export { segregateWithOpenAI };
