import ollama from 'ollama';

async function segregateDescriptions(fullDescription) {
    try {
        const response = await ollama.generate({
            model: 'llama3.2', // Or your preferred model
            prompt: `You are an expert at segregating job descriptions from company descriptions. 
                     Given the following text, identify and separate the job description and the company description.
                     
                     Text: ${fullDescription}
                     
                     Respond with a JSON object with "jobDescription" and "companyDescription" fields.  If you cannot determine one of the descriptions then set the value to be an empty string.`,
            format: 'json' //Instructs the model to respond with JSON
        });

        // Parse the JSON response
        try {
            const parsedResponse = JSON.parse(response.response);
            return {
                jobDescription: parsedResponse.jobDescription || '',
                companyDescription: parsedResponse.companyDescription || ''

            };
        } catch (parseError) {
            console.error("Error parsing JSON response from Ollama:", parseError);
            return { jobDescription: '', companyDescription: '' }; // Return empty strings in case of parsing error
        }

    } catch (error) {
        console.error("Error calling Ollama:", error);
        return { jobDescription: '', companyDescription: '' }; // Return empty strings in case of error
    }
}
export { segregateDescriptions };
