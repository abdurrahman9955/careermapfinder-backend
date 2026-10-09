import { Type, Schema } from '@google/genai';
import { ai, MODEL_NAME } from '../../utils/ai';

export interface GenerateInterviewInput {
  language?: string;
  targetJobTitle: string;
  industryDomain: string;
  careerStage: string;
  workArrangement: string[];
  targetCountries: string[];
  isExperienced: boolean;
  highestDegree: string;
  institution?: string;
  mostRecentEmployer?: string;
  yearsOfExperience: number;
  currentJobTitle?: string;
  coreSkills: string[];
  summaryOfAchievements: string;
  selectedCategories: string[];
  interviewerStyle: string;
  estimatedDurationMins: number;
  jobDescription: string;
}

const interviewQuestionsSchema: Schema = {
  type: Type.ARRAY,
  description: 'A structured list of AI-generated interview questions matching the candidate profile, target role, and selected categories.',
  items: {
    type: Type.OBJECT,
    properties: {
      questionNumber: { 
        type: Type.INTEGER, 
        description: 'Sequential order of the question, starting from 1.' 
      },
      category: {
        type: Type.STRING,
        enum: [
          'TECHNICAL_LIVE_CODING',
          'SYSTEM_DESIGN_ARCHITECTURE',
          'BEHAVIORAL_STAR',
          'DOMAIN_SPECIFIC',
          'CASE_STUDY_PROBLEM_SOLVING',
          'HR_RECRUITER_SCREENING',
        ],
      },
      visualLayout: {
        type: Type.STRING,
        enum: [
          'CODE_EDITOR',
          'WHITEBOARD_DIAGRAM',
          'STAR_STRUCTURED',
          'METRIC_TABLE',
          'TEXT_MARKDOWN',
        ],
      },
      title: { 
        type: Type.STRING, 
        description: 'Concise headline or title for the question.' 
      },
      prompt: { 
        type: Type.STRING, 
        description: 'Detailed, highly specific interview question scenario or problem description.' 
      },
      timeAllocationMins: { 
        type: Type.INTEGER, 
        description: 'Estimated time in minutes allocated to answer this specific question.' 
      },
      codeStarterSnippet: { 
        type: Type.STRING, 
        nullable: true, 
        description: 'Code boilerplate or starter snippet if visualLayout is CODE_EDITOR.' 
      },
      codeLanguage: { 
        type: Type.STRING, 
        nullable: true, 
        description: 'Programming language identifier (e.g., typescript, python, sql) if applicable.' 
      },
      supplementaryData: {
        type: Type.OBJECT,
        nullable: true,
        properties: {
          tableHeaders: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            nullable: true,
          },
          tableRows: {
            type: Type.ARRAY,
            items: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            nullable: true,
          },
          diagramNodes: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            nullable: true,
          },
          caseMetrics: {
            type: Type.OBJECT,
            nullable: true,
            description: 'Key values/metrics map for case studies or architectural benchmarks.',
          },
        },
      },
      rubricCriteria: {
        type: Type.OBJECT,
        properties: {
          expectedKeyPoints: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Key evaluation concepts or answers expected from an ideal response.',
          },
          optimalSolutionSummary: { 
            type: Type.STRING, 
            nullable: true,
            description: 'Summary of the benchmark or ideal high-score response.'
          },
          pitfallsToAvoid: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            nullable: true,
            description: 'Common red flags, mistakes, or anti-patterns to watch out for.',
          },
          starBreakdown: {
            type: Type.OBJECT,
            nullable: true,
            properties: {
              situation: { type: Type.STRING },
              task: { type: Type.STRING },
              action: { type: Type.STRING },
              result: { type: Type.STRING },
            },
            description: 'Expected STAR breakdown if category is BEHAVIORAL_STAR or layout is STAR_STRUCTURED.',
          },
        },
        required: ['expectedKeyPoints'],
      },
    },
    required: [
      'questionNumber',
      'category',
      'visualLayout',
      'title',
      'prompt',
      'timeAllocationMins',
      'rubricCriteria',
    ],
  },
};

export async function generateInterviewQuestionsAI(input: GenerateInterviewInput) {
  const language = input.language || 'English';

  const systemPrompt = 
  `You are a world-class Executive, Technical, and Industry-agnostic Interview Panel Lead operating globally across tech, 
   finance, healthcare, engineering, legal, marketing, and enterprise fields.

   Your objective is to design an elite, highly realistic, professional mock interview tailored strictly to a 
   candidate's profile, job description, target country standards, and selected question categories.

### CORE OPERATING RULES:
1. **STRICT LANGUAGE MATCH**: Write all prompts, titles, descriptions, metrics, and rubric evaluation points ENTIRELY in 
 **${language}**.
2. **INTERVIEW PERSONA ADAPTATION**: Emulate the requested Interviewer Style Persona (${input.interviewerStyle}):
   - \`SUPPORTIVE_COACH\`: Constructive, encouraging, scenario-guided questions.
   - \`STRICT_TECH_LEAD\`: Rigorous, detail-oriented, trade-off heavy, deep-dive technical questions.
   - \`TOP_TECH_ASSESSOR\`: High-bar competitive questions assessing top-percentile problem solving.
   - \`TALENT_ACQUISITION\`: Focus on culture fit, career trajectory, achievements, and behavioral alignment.
3. **PRACTICAL TIME & QUESTION COUNT BALANCING**:
   - Design a realistic question sequence where the sum of \`timeAllocationMins\` roughly equals the total 
     estimated session time of **${input.estimatedDurationMins} minutes**.
   - Adjust total question count naturally:
     - For long technical/case study/system design questions (15-20 mins each), produce fewer questions (e.g., 2-3 questions).
     - For screening/behavioral questions (3-7 mins each), produce more questions (e.g., 5-8 questions).
4. **CATEGORY & VISUAL LAYOUT ALIGNMENT**:
   - Only choose categories from the user's allowed selection: [${input.selectedCategories.join(', ')}].
   - Match \`visualLayout\` logically to the question type:
     - \`TECHNICAL_LIVE_CODING\` -> \`CODE_EDITOR\` (MUST provide \`codeStarterSnippet\` and \`codeLanguage\`).
     - \`SYSTEM_DESIGN_ARCHITECTURE\` -> \`WHITEBOARD_DIAGRAM\` (Provide \`diagramNodes\` in \`supplementaryData\`).
     - \`BEHAVIORAL_STAR\` -> \`STAR_STRUCTURED\` (MUST populate \`starBreakdown\` in \`rubricCriteria\`).
     - \`CASE_STUDY_PROBLEM_SOLVING\` -> \`METRIC_TABLE\` or \`TEXT_MARKDOWN\` (Provide \`tableHeaders\`/\`tableRows
     \` or \`caseMetrics\` in \`supplementaryData\` when beneficial).
     - General questions -> \`TEXT_MARKDOWN\`.
5. **CANDIDATE HYPER-PERSONALIZATION**:
   - Tailor difficulty strictly to Career Stage (${input.careerStage}) and Years of Experience (${input.yearsOfExperience} YOE).
   - Directly tie scenarios to the provided Job Description, core skills, candidate background, 
   and regional nuances for ${input.targetCountries.join(', ')}.`;

  const userPrompt = `
### TARGET CANDIDATE & ROLE CONTEXT:
- **Target Role Title**: ${input.targetJobTitle}
- **Industry/Domain**: ${input.industryDomain}
- **Career Stage**: ${input.careerStage} (${input.yearsOfExperience} Years of Experience)
- **Current / Recent Role**: ${input.currentJobTitle || 'N/A'} at ${input.mostRecentEmployer || 'N/A'}
- **Education**: ${input.highestDegree} (${input.institution || 'N/A'})
- **Target Location(s)**: ${input.targetCountries.join(', ')}
- **Work Arrangements**: ${input.workArrangement.join(', ')}
- **Core Candidate Skills**: ${input.coreSkills.join(', ')}
- **Candidate Achievements**: ${input.summaryOfAchievements}

### INTERVIEW CONFIGURATION:
- **Target Session Duration**: ${input.estimatedDurationMins} Minutes
- **Interviewer Style**: ${input.interviewerStyle}
- **Allowed Question Categories**: ${input.selectedCategories.join(', ')}
- **Language**: ${language}

### JOB DESCRIPTION DATA:
"""
${input.jobDescription}
"""

### INSTRUCTION:
Generate a complete, structured list of interview questions adhering strictly to the JSON schema. 
Ensure every field matches the target language (${language}) and meets global professional hiring standards.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `${systemPrompt}\n\n${userPrompt}`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: interviewQuestionsSchema,
      temperature: 0.3,
    },
  });

  const rawText = response.text;
  if (!rawText) {
    throw new Error('AI failed to generate interview questions. Empty response returned.');
  }

  return JSON.parse(rawText);
}

