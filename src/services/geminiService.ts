import { FormData, Answer, PerformanceResult } from '@/pages/Index';

const OPENROUTER_API_KEY = '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';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const FREE_MODELS = [
  'openai/gpt-oss-120b:free',
  'z-ai/glm-4.5-air:free',
  'google/gemma-4-31b-it:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
  'poolside/laguna-xs.2:free',
  'moonshotai/kimi-k2.6:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen3-next-80b-a3b-instruct:free',
  'nousresearch/hermes-3-llama-3.1-405b:free',
  'qwen/qwen3-coder:free',
];

const makeRequest = async (prompt: string, model: string): Promise<string> => {
  const chosenModel = model || FREE_MODELS[1];
  console.log('OpenRouter request using model:', chosenModel);

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
      'X-Title': 'Question Paper Generator',
    },
    body: JSON.stringify({
      model: chosenModel,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('OpenRouter error:', response.status, errText);
    throw new Error(`OpenRouter error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from OpenRouter');
  return content;
};

export const generateQuestionPaper = async (formData: FormData): Promise<string> => {
  const chaptersText = formData.chapters.length > 0 ? formData.chapters.join(', ') : 'Various chapters';
  const specificTopics = formData.specificTopics ? `, with specific focus on: ${formData.specificTopics}` : '';
  const additionalInstructions = formData.additionalInstructions ? `Additional instructions: ${formData.additionalInstructions}` : '';
  const syllabusBlock = formData.syllabusPdfText
    ? `\n\nSYLLABUS REFERENCE (extracted from uploaded PDF — base questions strictly on this content):\n${formData.syllabusPdfText.slice(0, 12000)}`
    : '';

  const prompt = `Create a comprehensive question paper for the following specifications:

Subject: ${formData.subject}
Class: ${formData.class}
Total Marks: ${formData.totalMarks}
Difficulty Level: ${formData.difficulty}
Book: ${formData.book || 'Standard curriculum'}
Chapters: ${chaptersText}${specificTopics}
Question Paper Pattern: ${formData.questionPaperPattern || 'Standard'}
${additionalInstructions}${syllabusBlock}

Please create a well-structured question paper with:
1. Proper header with subject, class, time duration, and total marks
2. Clear instructions for students
3. Questions divided into appropriate sections (if applicable)
4. Variety of question types (MCQ, Short Answer, Long Answer, etc.)
5. Proper mark distribution
6. Questions should be age-appropriate and curriculum-aligned

Format the output in clean Markdown format with proper headings, numbering, and formatting.`;

  return await makeRequest(prompt, formData.model);
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

  return await makeRequest(prompt, formData.model);
};

export const evaluateAnswers = async (
  formData: FormData,
  questions: string,
  answers: Answer[]
): Promise<PerformanceResult> => {
  const answersText = answers.map(a => `Question ID: ${a.questionId}\nStudent Answer: ${a.answer}`).join('\n\n');

  const prompt = `Evaluate the following student answers for the given question paper.

QUESTION PAPER:
${questions}

STUDENT ANSWERS:
${answersText}

Respond ONLY with a JSON object (no markdown, no commentary) of this exact shape:
{
  "totalScore": number,
  "totalMarks": ${formData.totalMarks},
  "percentage": number,
  "grade": "A+|A|B+|B|C+|C|D|F",
  "remarks": "string",
  "questionResults": [
    { "questionId": "string", "score": number, "maxScore": number, "feedback": "string", "isCorrect": boolean }
  ]
}

Be fair and constructive, considering the ${formData.class} level.`;

  const response = await makeRequest(prompt, formData.model);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    const result = JSON.parse(jsonMatch[0]);
    if (!result.questionResults || !Array.isArray(result.questionResults)) {
      throw new Error('Invalid response structure');
    }
    return result as PerformanceResult;
  } catch (error) {
    console.error('Error parsing evaluation response:', error);
    const fallback: PerformanceResult = {
      totalScore: 0,
      totalMarks: parseInt(formData.totalMarks),
      percentage: 0,
      grade: 'C',
      remarks: 'Evaluation could not be parsed. Please review your answers.',
      questionResults: answers.map(a => ({
        questionId: a.questionId,
        score: 0,
        maxScore: 5,
        feedback: 'Could not parse AI evaluation for this answer.',
        isCorrect: false,
      })),
    };
    return fallback;
  }
};
