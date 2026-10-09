import { Type, Schema } from "@google/genai";
import { ai, MODEL_NAME } from '../../utils/ai';

export const EVALUATION_SYSTEM_PROMPT = `
You are an expert, impartial, unbiased academic evaluation engine for formal examinations 
(WAEC, JAMB, CBSE, JEE, GRE, AWS Certifications).

You will receive:
1. The original Exam Session context metadata.
2. All Exam Questions along with their rubrics, correct answers, max marks, and question types.
3. The student's submitted User Responses for each question.

Task:
Perform a rigorous, objective evaluation. Compute deterministic scores for multiple-choice/objective 
types and apply rubrics fairly for short inputs, essays, and code submissions.

Output MUST follow the exact structured JSON evaluation report schema.
`;

const evaluationReportSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    totalMarksObtained: { type: Type.NUMBER },
    totalMaxMarks: { type: Type.NUMBER },
    percentage: { type: Type.NUMBER },
    grade: { type: Type.STRING },
    overallFeedback: { type: Type.STRING },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    improvementAreas: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    categoryBreakdown: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          categoryName: { type: Type.STRING },
          score: { type: Type.NUMBER },
          maxScore: { type: Type.NUMBER },
          percentage: { type: Type.NUMBER },
          status: { type: Type.STRING }
        },
        required: ["categoryName", "score", "maxScore", "percentage", "status"]
      }
    }
  },
  required: [
    "totalMarksObtained",
    "totalMaxMarks",
    "percentage",
    "overallFeedback",
    "strengths",
    "improvementAreas",
    "categoryBreakdown"
  ]
};

export class EvaluationReportAIService {
  static async evaluateSessionSubmission(sessionData: any) {
    const payloadPrompt = `
    Session Details:
    - Exam Name: ${sessionData.examName || "Standard Exam"}
    - Subject: ${sessionData.subject}
    - Category: ${sessionData.category}
    - Target Score: ${sessionData.targetScore}

    Questions & Submitted Answers Payload:
    ${JSON.stringify(sessionData.questions, null, 2)}
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `${EVALUATION_SYSTEM_PROMPT}\n\n${payloadPrompt}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: evaluationReportSchema,
        temperature: 0.1
      }
    });

    const outputText = response.text;
    if (!outputText) throw new Error("Gemini AI failed to yield evaluation report.");
    return JSON.parse(outputText);
  }
}