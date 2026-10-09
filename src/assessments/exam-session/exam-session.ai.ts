import { Type, Schema } from "@google/genai";
import { ai, MODEL_NAME } from '../../utils/ai';
import { ExamSession, ExamFormat } from "@prisma/client";

export const EXAM_QUESTION_GENERATION_PROMPT = `
You are a senior academic evaluation specialist and psychometrician expert in global standardized 
examination systems (e.g., WAEC, JAMB, NECO, CBSE, ICSE, SAT, GRE, JEE Main/Advanced, AWS, Cisco, CompTIA Certifications).

Your task is to analyze the provided ExamSession metadata and dynamically determine:
1. The standard exam format (OBJECTIVE_ONLY, THEORY_ONLY, HYBRID, PRACTICAL_CODING) best suited for this exam.
2. The realistic duration in minutes (timeLimitMinutes) for completing this specific assessment.
3. The exact real-world question distribution, structure, format, language, duration, and style matching the 
specified board or vendor standard.

Strict Operational Rules:
1. LANGUAGE CONSISTENCY: Strictly generate ALL prompts, section titles, options, rubrics, and markdown content in the requested 'language' parameter (e.g., 'en', 'fr', 'es', 'ar').
2. FORMAT & DURATION SELECTION: Evaluate the examName, certVendor, category, subject, and country to determine the standard 'format' and exact 'timeLimitMinutes'.
3. ACCURATE QUESTION COUNT & STRUCTURE: Unless explicitly restricted by questionCountOverride, generate the standard real-world question count and structure used by the exam standard (e.g., JAMB UTME usually 40-50 per subject, AWS Solutions Architect ~65 questions).
4. COMPLETE DATA PAYLOADS: Ensure every question object includes clear prompts, correct answers for objective types, options (A, B, C, D, E as applicable), maxMarks, detailed rubrics for written/code questions, and supplementaryData where required.
`;

const examGenerationOutputSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    format: {
      type: Type.STRING,
      enum: ["OBJECTIVE_ONLY", "THEORY_ONLY", "HYBRID", "PRACTICAL_CODING"],
      description: "AI-determined best fitting exam format"
    },
    timeLimitMinutes: {
      type: Type.INTEGER,
      description: "AI-calculated standard time limit in minutes for the exam"
    },
    questions: {
      type: Type.ARRAY,
      description: "List of generated exam questions",
      items: {
        type: Type.OBJECT,
        properties: {
          questionNumber: { type: Type.INTEGER },
          sectionTitle: { type: Type.STRING },
          questionType: {
            type: Type.STRING,
            enum: [
              "MULTIPLE_CHOICE",
              "MULTIPLE_SELECT",
              "SHORT_INPUT",
              "ESSAY_LONG_TEXT",
              "CODE_EXECUTION"
            ]
          },
          visualType: {
            type: Type.STRING,
            enum: ["TEXT", "MARKDOWN", "CODE", "TABLE", "IMAGE"]
          },
          prompt: { type: Type.STRING },
          supplementaryData: {
            type: Type.OBJECT,
            description: "Supplementary payload details",
            properties: {
              codeLanguage: { type: Type.STRING },
              codeSnippet: { type: Type.STRING },
              tableHeaders: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              tableData: {
                type: Type.ARRAY,
                items: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              imageUrl: { type: Type.STRING },
              markdownText: { type: Type.STRING }
            }
          },
          options: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                text: { type: Type.STRING }
              },
              required: ["label", "text"]
            }
          },
          maxMarks: { type: Type.INTEGER },
          rubric: {
            type: Type.OBJECT,
            description: "Scoring criteria for non-deterministic answers",
            properties: {
              keyPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              sampleAnswer: { type: Type.STRING },
              scoringCriteria: {
                type: Type.OBJECT,
                description: "Key-value pair criteria description"
              }
            }
          },
          correctAnswer: { type: Type.STRING }
        },
        required: ["questionNumber", "questionType", "prompt", "maxMarks"]
      }
    }
  },
  required: ["format", "timeLimitMinutes", "questions"]
};

export interface AIQuestionGenerationResult {
  format: ExamFormat;
  timeLimitMinutes: number;
  questions: Array<{
    questionNumber: number;
    sectionTitle?: string;
    questionType: "MULTIPLE_CHOICE" | "MULTIPLE_SELECT" | "SHORT_INPUT" | "ESSAY_LONG_TEXT" | "CODE_EXECUTION";
    visualType?: "TEXT" | "MARKDOWN" | "CODE" | "TABLE" | "IMAGE";
    prompt: string;
    supplementaryData?: {
      codeLanguage?: string;
      codeSnippet?: string;
      tableHeaders?: string[];
      tableData?: string[][];
      imageUrl?: string;
      markdownText?: string;
    };
    options?: Array<{ label: string; text: string }>;
    maxMarks: number;
    rubric?: {
      keyPoints?: string[];
      sampleAnswer?: string;
      scoringCriteria?: Record<string, string>;
    };
    correctAnswer?: string;
  }>;
}

export class ExamSessionAIService {
  static async generateQuestionsForSession(
    session: ExamSession,
    targetCount?: number
  ): Promise<AIQuestionGenerationResult> {
    const userPrompt = `
    Input Exam Context:
    - Target Language: ${session.language || "en"}
    - Category: ${session.category}
    - Country/State: ${session.country || "Global"} / ${session.state || "N/A"}
    - Exam Name: ${session.examName || "Standard Assessment"}
    - Subject: ${session.subject || "General Knowledge"}
    - Stream: ${session.stream || "N/A"}
    - Target Program / Career: ${session.targetProgram || "N/A"} / ${session.targetCareer || "N/A"}
    - Industry / Certification Vendor: ${session.industry || "N/A"} / ${session.certVendor || "N/A"}
    - Primary Objective: ${session.primaryObjective || "N/A"}
    - Academic Background: ${session.academicBackground || "N/A"}
    - Exam Description: ${session.examDescription || "N/A"}
    - Difficulty: ${session.difficulty}
    - User Target Score: ${session.targetScore}
    - Explicit Question Count Override: ${targetCount ? targetCount : "Determine standard board length"}

    Analyze all parameters carefully. Output valid JSON strictly formatted in the target language ("${session.language || "en"}").
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `${EXAM_QUESTION_GENERATION_PROMPT}\n\n${userPrompt}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: examGenerationOutputSchema,
        temperature: 0.2
      }
    });

    const content = response.text;

    if (!content) {
      throw new Error("Gemini AI failed to return valid JSON output for exam question generation.");
    }

    return JSON.parse(content) as AIQuestionGenerationResult;
  }
}
