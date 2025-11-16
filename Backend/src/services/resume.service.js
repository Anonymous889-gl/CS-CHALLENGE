const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

/**
 * MOCK SERVICE for parsing a resume.
 * In a real app, this would make an HTTP call to an external parser API.
 *
 * @param {string} filePath - The path to the saved resume file.
 * @returns {Promise<Object>} A promise that resolves to structured resume JSON.
 */
exports.parseResume = async (filePath) => {
  console.log(`[ResumeService] Simulating API call to parser for: ${filePath}`);

  // --- REAL API CALL LOGIC (Example) ---
  // const form = new FormData();
  // form.append('file', fs.createReadStream(filePath));
  //
  // try {
  //   const response = await axios.post(process.env.RESUME_PARSER_API_ENDPOINT, form, {
  //     headers: {
  //       ...form.getHeaders(),
  //       'Authorization': `Bearer ${process.env.RESUME_PARSER_API_KEY}`
  //     }
  //   });
  //   return response.data; // Return the actual API response
  // } catch (error) {
  //   console.error('Error calling resume parser API:', error.message);
  //   throw new Error('Failed to parse resume via external API.');
  // }
  // --- END REAL API CALL ---

  // --- MOCK DATA (for testing without a real API) ---
  // Simulate a network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return mock structured JSON
  return {
    personal_details: {
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      phone: '555-123-4567',
      location: 'New York, NY',
    },
    summary:
      'Innovative Full-Stack Developer with 5+ years of experience in Node.js, React, and cloud-native technologies. Proven track record of leading projects from concept to deployment.',
    skills: [
      'JavaScript (ES6+)',
      'Node.js',
      'Express',
      'React',
      'MongoDB',
      'AWS',
      'Docker',
      'CI/CD',
    ],
    experience: [
      {
        title: 'Senior Software Engineer',
        company: 'TechCorp Inc.',
        years: '2020 - Present',
        description:
          'Led development of a high-availability microservices backend.',
      },
      {
        title: 'Software Engineer',
        company: 'WebSolutions LLC',
        years: '2018 - 2020',
        description: 'Built and maintained client-facing React applications.',
      },
    ],
    education: [
      {
        degree: 'B.S. in Computer Science',
        institution: 'State University',
        year: '2018',
      },
    ],
  };
};

/**
 * MOCK SERVICE for getting an AI review.
 * This is the stub for your friend's LLM model.
 *
 * @param {Object} parsedData - The structured JSON from parseResume.
 * @param {string} jobDescription - The job description text.
 * @returns {Promise<Object>} A promise that resolves to the AI review JSON.
 */
exports.getAiReview = async (parsedData, jobDescription) => {
  console.log(
    '[ResumeService] STUB: Simulating AI LLM review call.'
  );
  // console.log('AI would be reviewing this data:', parsedData);
  // console.log('Against this JD:', jobDescription);

  // --- REAL LLM CALL (would go here) ---
  // const prompt = `
  //   You are a world-class technical recruiter...
  //   Job Description: ${jobDescription}
  //   Candidate Resume: ${JSON.stringify(parsedData)}
  //   ...
  //   Please return a JSON object with keys: score, summary, suggestions.
  // `;
  // const aiResponse = await yourFriendLlmApi.generate(prompt);
  // return JSON.parse(aiResponse);
  // --- END REAL LLM CALL ---

  // --- MOCK DATA (for testing) ---
  // Simulate an AI thinking delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Return mock review JSON
  return {
    matchScore: 88,
    summary:
      "Strong candidate. Excellent match for Node.js and React skills. 5+ years of experience aligns well with the senior role requirements. Clear leadership experience at TechCorp Inc.",
    pros: [
      "Direct experience with 5/6 of the required primary skills (Node.js, React, MongoDB, AWS, Docker).",
      "Progressive career path from Engineer to Senior Engineer.",
      "Quantifiable achievements mentioned in experience.",
    ],
    cons: [
      "No explicit mention of 'GraphQL', which was a 'nice to have' in the JD.",
      "Education is a B.S., not the preferred M.S.",
    ],
    suggestedQuestions: [
      "Tell me about the scale of the microservices backend you led at TechCorp Inc.",
      "How have you handled container orchestration in your CI/CD pipeline?",
      "Describe a complex technical tradeoff you had to make in your last project.",
    ],
  };
};

