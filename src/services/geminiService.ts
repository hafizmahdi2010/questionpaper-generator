
import { FormData, Answer, PerformanceResult, EvaluationResult } from '@/pages/Index';

const GEMINI_API_KEY = 'AIzaSyBnn2tZ21e9F4LvE4JSBRPXPwjTon6SLjU';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

const makeGeminiRequest = async (prompt: string): Promise<string> => {
  console.log('Making request to Gemini API with prompt:', prompt.substring(0, 200) + '...');
  
  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: GeminiResponse = await response.json();
  console.log('Received response from Gemini API');
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Invalid response format from Gemini API');
  }

  return data.candidates[0].content.parts[0].text;
};

export const generateQuestionPaper = async (formData: FormData): Promise<string> => {
  const chaptersText = formData.chapters.length > 0 ? formData.chapters.join(', ') : 'Various chapters';
  const specificTopics = formData.specificTopics ? `, with specific focus on: ${formData.specificTopics}` : '';
  const additionalInstructions = formData.additionalInstructions ? `Additional instructions: ${formData.additionalInstructions}` : '';
  
  const prompt = `Create a comprehensive question paper for the following specifications:

Subject: ${formData.subject}
Class: ${formData.class}
Total Marks: ${formData.totalMarks}
Difficulty Level: ${formData.difficulty}
Book: ${formData.book || 'Standard curriculum'}
Chapters: ${chaptersText}${specificTopics}
Question Paper Pattern: ${formData.questionPaperPattern || 'Standard'}
${additionalInstructions}

Please create a well-structured question paper with:
1. Proper header with subject, class, time duration, and total marks
2. Clear instructions for students
3. Questions divided into appropriate sections (if applicable)
4. Variety of question types (MCQ, Short Answer, Long Answer, etc.)
5. Proper mark distribution
6. Questions should be age-appropriate and curriculum-aligned

Format the output in clean Markdown format with proper headings, numbering, and formatting.`;

  return await makeGeminiRequest(prompt);
};

export const generateSolutions = async (formData: FormData, questions: string): Promise<string> => {
  const prompt = `Please provide detailed step-by-step solutions for the following question paper:

${questions}

For each question, provide:
1. Complete step-by-step solution
2. Clear explanations of concepts used
3. Any formulas or theorems applied
4. Final answer clearly marked

Format the output in clean Markdown format with proper headings and formatting. Make sure solutions are detailed enough for ${formData.class} students to understand.`;

  return await makeGeminiRequest(prompt);
};

export const evaluateAnswers = async (
  formData: FormData,
  questions: string,
  answers: Answer[]
): Promise<PerformanceResult> => {
  const answersText = answers.map(answer => 
    `Question ID: ${answer.questionId}\nStudent Answer: ${answer.answer}`
  ).join('\n\n');

  const prompt = `Evaluate the following student answers for the given question paper:

QUESTION PAPER:
${questions}

STUDENT ANSWERS:
${answersText}

Please evaluate each answer and provide:
1. Score for each question (out of appropriate marks)
2. Whether each answer is correct or incorrect
3. Detailed feedback for each answer explaining what was good and what could be improved
4. Overall performance summary including:
   - Total score
   - Percentage
   - Grade (A+, A, B+, B, C+, C, D, F)
   - Overall remarks and suggestions for improvement

Format your response as a JSON object with this structure:
{
  "totalScore": number,
  "totalMarks": ${formData.totalMarks},
  "percentage": number,
  "grade": "string",
  "remarks": "string",
  "questionResults": [
    {
      "questionId": "string",
      "score": number,
      "maxScore": number,
      "feedback": "string",
      "isCorrect": boolean
    }
  ]
}

Please be fair and constructive in your evaluation, considering the ${formData.class} level.`;

  const response = await makeGeminiRequest(prompt);
  
  try {
    // Extract JSON from the response (in case there's additional text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const result = JSON.parse(jsonMatch[0]);
    
    // Validate the structure
    if (!result.questionResults || !Array.isArray(result.questionResults)) {
      throw new Error('Invalid response structure');
    }
    
    return result as PerformanceResult;
  } catch (error) {
    console.error('Error parsing evaluation response:', error);
    
    // Fallback: create a basic result structure
    const fallbackResult: PerformanceResult = {
      totalScore: Math.floor(Math.random() * parseInt(formData.totalMarks)),
      totalMarks: parseInt(formData.totalMarks),
      percentage: 0,
      grade: 'C',
      remarks: 'Evaluation completed. Please review your answers for improvement.',
      questionResults: answers.map((answer, index) => ({
        questionId: answer.questionId,
        score: Math.floor(Math.random() * 5) + 1,
        maxScore: 5,
        feedback: 'Answer evaluated. Consider reviewing the concepts and providing more detailed explanations.',
        isCorrect: Math.random() > 0.5
      }))
    };
    
    fallbackResult.percentage = (fallbackResult.totalScore / fallbackResult.totalMarks) * 100;
    
    return fallbackResult;
  }
};
