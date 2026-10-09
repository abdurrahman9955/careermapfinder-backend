import { Type, Schema } from '@google/genai';
import { ai, MODEL_NAME } from '../../utils/ai';

const evaluationSchema: Schema = {
  type: Type.OBJECT,
  description: 'An executive-level, objective evaluation report analyzing a candidate\'s interview performance against rubrics and role expectations.',
  properties: {
    sessionId: { type: Type.STRING },
    targetJobTitle: { type: Type.STRING },
    overallScore: { 
      type: Type.NUMBER, 
      description: 'Calculated composite score (0-100) reflecting weighted performance across all categories.' 
    },
    hireRecommendation: {
      type: Type.STRING,
      enum: ['Strong Hire', 'Lean Hire', 'Lean No Hire', 'No Hire'],
    },
    executiveSummary: { 
      type: Type.STRING, 
      description: 'Comprehensive, high-level narrative summary (in target language) detailing the candidate\'s overall readiness, key highlights, and notable gaps.' 
    },
    radarMetrics: {
      type: Type.OBJECT,
      properties: {
        technicalProficiency: { type: Type.NUMBER, description: 'Score from 0 to 100.' },
        communicationClarity: { type: Type.NUMBER, description: 'Score from 0 to 100.' },
        problemSolvingLogic: { type: Type.NUMBER, description: 'Score from 0 to 100.' },
        cultureAndLeadership: { type: Type.NUMBER, description: 'Score from 0 to 100.' },
        domainKnowledge: { type: Type.NUMBER, description: 'Score from 0 to 100.' },
      },
      required: [
        'technicalProficiency',
        'communicationClarity',
        'problemSolvingLogic',
        'cultureAndLeadership',
        'domainKnowledge',
      ],
    },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Bullet points highlighting specific technical or behavioral strengths demonstrated in answers.',
    },
    weaknesses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Bullet points outlining missing rubric requirements, inaccuracies, or anti-patterns.',
    },
    keyImprovementAreas: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Actionable recommendations for the candidate to address identified skill or communication gaps.',
    },
    categoryBreakdowns: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          categoryName: { type: Type.STRING },
          score: { type: Type.NUMBER, description: 'Category score from 0 to 100.' },
          status: {
            type: Type.STRING,
            enum: ['EXCELLENT', 'GOOD', 'NEEDS_WORK'],
          },
        },
        required: ['category', 'categoryName', 'score', 'status'],
      },
    },
  },
  required: [
    'sessionId',
    'targetJobTitle',
    'overallScore',
    'hireRecommendation',
    'executiveSummary',
    'radarMetrics',
    'strengths',
    'weaknesses',
    'keyImprovementAreas',
    'categoryBreakdowns',
  ],
};


export async function evaluateInterviewSessionAI(sessionData: any) {
  const language = sessionData.language || 'English';

  const systemPrompt = `You are a Principal Hiring Manager and Global Executive Assessor evaluating a candidate's 
  mock interview performance.
  Your duty is to conduct a rigorous, professional, objective, and unbiased evaluation comparing 
  candidate responses directly against provided question prompts, rubrics, and industry standards.

### STRICT EVALUATION GUIDELINES:
1. **STRICT LANGUAGE MATCHING**: Generate ALL narrative strings (\`executiveSummary\`, \`strengths\`, 
\`weaknesses\`, \`keyImprovementAreas\`, and \`categoryName\`) ENTIRELY in **${language}**.
2. **EVIDENCE-BASED SCORING**:
   - Judge answers strictly based on factual accuracy, logical rigor, depth, trade-off analysis, code quality 
   (if applicable), and STAR structure adherence.
   - Do NOT penalize or favor candidates based on style or length unless it directly impacts clarity or 
   missing rubric expectations.
   - If a candidate left a question completely empty or provided non-responsive text, assign a zero score 
   for that question's category.
3. **RADAR METRICS (0-100 SCALE)**:
   - \`technicalProficiency\`: Correctness of technical concepts, coding solutions, tools, or domain-specific frameworks.
   - \`communicationClarity\`: Structure (e.g., STAR framework), articulation, brevity, and presentation logic.
   - \`problemSolvingLogic\`: Systematic approach to complex scenarios, edge cases, system architecture, or metric calculations.
   - \`cultureAndLeadership\`: Ownership, teamwork, ethical judgment, situational awareness, and adaptability.
   - \`domainKnowledge\`: Depth of alignment with industry standards and job description context.
4. **CATEGORY BREAKDOWN STATUS**:
   - Assign \`EXCELLENT\` for scores >= 80.
   - Assign \`GOOD\` for scores between 60 and 79.
   - Assign \`NEEDS_WORK\` for scores below 60.
5. **HIRE RECOMMENDATION**:
   - \`Strong Hire\`: Composite score >= 85 with no critical gaps.
   - \`Lean Hire\`: Composite score 70 - 84 with minor areas for growth.
   - \`Lean No Hire\`: Composite score 50 - 69 with notable technical/communication gaps.
   - \`No Hire\`: Composite score < 50 or major fundamental errors.`;

  const userPrompt = `
### SESSION METADATA:
- **Session ID**: ${sessionData.id}
- **Language**: ${language}
- **Target Role**: ${sessionData.targetJobTitle}
- **Industry Domain**: ${sessionData.industryDomain}
- **Career Stage**: ${sessionData.careerStage} (${sessionData.yearsOfExperience || 0} YOE)
- **Target Countries**: ${(sessionData.targetCountries || []).join(', ')}

### JOB DESCRIPTION CONTEXT:
"""
${sessionData.jobDescription}
"""

### QUESTIONS & CANDIDATE RESPONSES FOR ASSESSMENT:
${JSON.stringify(
  sessionData.questions.map((q: any) => ({
    questionId: q.id,
    questionNumber: q.questionNumber,
    category: q.category,
    visualLayout: q.visualLayout,
    title: q.title,
    prompt: q.prompt,
    rubricCriteria: q.rubricCriteria,
    codeStarterSnippet: q.codeStarterSnippet,
    supplementaryData: q.supplementaryData,
    candidateResponses: q.candidateResponses || [],
  })),
  null,
  2
)}

### INSTRUCTIONS:
Evaluate all candidate responses thoroughly against the question rubrics and provide the evaluation 
matching the required schema. Ensure the output strictly uses ${language}.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `${systemPrompt}\n\n${userPrompt}`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: evaluationSchema,
      temperature: 0.1, // Low temperature for high evaluation accuracy and consistency
    },
  });

  const rawText = response.text;
  if (!rawText) {
    throw new Error('AI failed to return valid evaluation response.');
  }

  return JSON.parse(rawText);
}

