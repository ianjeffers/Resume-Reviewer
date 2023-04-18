import axios from 'axios';

export default async function handler(req, res) {
  const { resumeText, careerField, yearsOfExperience } = req.body;

  const messages = [
    {
      role: 'system',
      content: `You are an AI that helps improve resumes. The user has ${yearsOfExperience} years of experience in the ${careerField} field. Please review and provide a list of suggestions for the following resume:`,
    },
    {
      role: 'user',
      content: resumeText,
    },
  ];
  try {
    console.log("Trying api call")
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        messages,
        max_tokens: 150,
        n: 1,
        stop: null,
        temperature: 0.5,
        model: 'gpt-3.5-turbo',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const issues = response.data.choices[0].message.content
      .split('\n')
      .filter((line) => line.length > 0);

    res.status(200).json({ issues });
  } catch (error) {
    console.error('Error in OpenAI API call:', error.response.data);
    res.status(500).json({ message: 'Error analyzing resume', error: error.response.data });
  }
}
