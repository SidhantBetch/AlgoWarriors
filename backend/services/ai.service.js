const { OpenAI } = require('openai');

const apiKey = process.env.OPENAI_API_KEY;
let openai;
if (apiKey) {
  openai = new OpenAI({ apiKey });
}

/**
 * Generate Interview Questions based on Job Description
 */
const generateQuestions = async (jobTitle, jobDescription, skills, difficulty) => {
  // Mock fallback if no API key
  if (!openai) {
    console.log("No OPENAI_API_KEY found. Using mock questions.");
    return [
      ...Array(5).fill({
        type: 'mcq',
        content: `Mock MCQ for ${jobTitle} (${difficulty}). Which of these is a core skill?`,
        options: ['A', 'B', 'C', skills[0] || 'D'],
        correct_answer: skills[0] || 'D'
      }),
      ...Array(3).fill({
        type: 'nat',
        content: `Mock NAT for ${jobTitle} (${difficulty}). What is the time complexity of binary search? (Enter numerical or short text)`,
        correct_answer: "O(log n)"
      }),
      ...Array(2).fill({
        type: 'coding',
        content: `Mock Coding for ${jobTitle} (${difficulty}). Write a function to reverse a string.`,
        test_cases: [{ input: '"hello"', expected_output: '"olleh"' }]
      })
    ];
  }

  try {
    const prompt = `You are an expert technical interviewer. Create EXACTLY 10 interview questions for a ${jobTitle} role. 
    The skills required are: ${skills.join(', ')}. The difficulty is ${difficulty}. The job description is: ${jobDescription}.
    
    You MUST provide exactly:
    - 5 'mcq' (Multiple Choice Questions) with 4 options each.
    - 3 'nat' (Numerical Answer Type / Short Text) without options.
    - 2 'coding' (Programming challenges requiring C, C++, Python or Java).
    
    Output a JSON array of objects strictly following this format:
    [{
      "type": "mcq" | "nat" | "coding",
      "content": "Question text",
      "options": ["if mcq, provide exactly 4 options"],
      "correct_answer": "if mcq or nat, provide the exact expected answer",
      "test_cases": [{"input": "if coding", "expected_output": "if coding"}]
    }]`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const resultStr = response.choices[0].message.content;
    const resultObj = JSON.parse(resultStr);
    
    // Some models might wrap it in a root object like { questions: [...] }
    if (Array.isArray(resultObj)) return resultObj;
    if (resultObj.questions && Array.isArray(resultObj.questions)) return resultObj.questions;
    
    return [
      { type: 'conceptual', content: 'Fallback: Please describe your background.', correct_answer: 'Any' }
    ];

  } catch (error) {
    console.error("AI Generation Error: ", error);
    throw new Error("Failed to generate questions using AI.");
  }
};

/**
 * Evaluate Candidate Coding Answers & Generate Final Report
 */
const evaluateAnswers = async (codingAnswers, totalScoreFromDeterministic) => {
  // Mock fallback
  if (!openai) {
    console.log("No OPENAI_API_KEY found. Using mock evaluation.");
    return {
      totalScore: totalScoreFromDeterministic + 20, // Add mock coding score
      strengths: ["Good logic", "Understands problem requirements"],
      weaknesses: ["Could improve time complexity"],
      recommendation: "hire",
      report: "Candidate performed well on deterministic questions and wrote acceptable mock code.",
      coding_performance: "Candidate wrote functional code but it lacked optimal efficiency.",
      evaluations: codingAnswers.map(qa => ({ questionId: qa.questionId, score: 10, feedback: "Code looks good." }))
    };
  }

  try {
    const prompt = `You are an expert technical evaluator. The candidate has already been scored on their MCQ and NAT questions (Current Score: ${totalScoreFromDeterministic}). 
    Evaluate their remaining CODING answers below.
    
    Data: ${JSON.stringify(codingAnswers)}
    
    Score each coding answer out of 10.
    Output a JSON strictly matching this format:
    {
      "totalScore": ${totalScoreFromDeterministic} + SUM_OF_CODING_SCORES,
      "strengths": ["string"],
      "weaknesses": ["string"],
      "recommendation": "strong_hire" | "hire" | "weak_hire" | "no_hire",
      "report": "detailed overall summary of their performance",
      "coding_performance": "specific summary of their programming abilities shown",
      "evaluations": [
        { "questionId": "ID exactly as provided", "score": integer_out_of_10, "feedback": "Specific feedback for this code" }
      ]
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    const resultStr = response.choices[0].message.content;
    return JSON.parse(resultStr);

  } catch (error) {
    console.error("AI Evaluation Error: ", error);
    throw new Error("Failed to evaluate answers using AI.");
  }
};

module.exports = {
  generateQuestions,
  evaluateAnswers
};
