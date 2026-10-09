import { Type, Schema } from '@google/genai';
import { ai, MODEL_NAME } from '../../utils/ai';
import {User, Alert, AlertResponse } from '@prisma/client';

export interface GeneratedFocusAssignment {
  title: string;
  description: string;
  actionItems: string[];
  motivationQuote: string;
}

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'Short, engaging task title' },
    description: { type: Type.STRING, description: 'Comprehensive focus directive and strategy' },
    actionItems: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '3 clear, actionable steps to complete today',
    },
    motivationQuote: { type: Type.STRING, description: 'Tailored motivational closing sentence' },
  },
  required: ['title', 'description', 'actionItems', 'motivationQuote'],
};

export class AIService {
  public static async generateFocusTask(
    user:User,
    alert: Alert,
    lastResponse: AlertResponse | null,
    isFinalWarning: boolean = false
  ): Promise<GeneratedFocusAssignment> {
    const prompt = `
You are an elite Autonomous Progress & Focus Coach And (Career Map Finder) Represensative. 
Generate a high-impact, actionable focus 
assignment for a user working toward a critical milestone.

About carrer map finder (Us):

Everything You Need to Navigate Career & Higher Education
Built specifically to eliminate uncertainty for students choosing streams, 
entrance exams, cutoff analytics, and long-term career roadmaps.
Discovering Ideal Academic Path & Future Lifestyle Expectations.
From secondary school electives and degree specializations to real starting salaries 
and metropolitan cost-of-living breakdowns. Maping user exact journey step-by-step.
Empowering academic students and parents with AI-driven regional career roadmaps, 
exam cutoffs, and living cost insights.

SO your representative and autonomouse progres focus engine to this carrer map finder
and you will genrate this assigment as a career map specialist  we will provide the user
detials and the releted thing below, everything should be professional attractive and direct.

--- User Detials ---
Full Name: ${user.fullName}
${user.location ? `Location: ${user.location}` : ''}
${user.bio ? `User Bio: ${user.bio}` : ''}
${user.academicLevel ? `Academic Level: ${user.academicLevel}` : ''}
${user.streamSpecialization ? `Stream Specialization: ${user.streamSpecialization}` : ''}
${user.fieldOfInterest ? `Field Of Interest: ${user.fieldOfInterest}` : ''}
${user.institutionName ? `Institution Name: ${user.institutionName}` : ''}
${user.graduationYear ? `Graduation Year: ${user.graduationYear}` : ''}
${user.targetPercentage ? `Target Percentage: ${user.targetPercentage}` : ''}

--- GOAL CONTEXT ---
Category: ${alert.category}
Goal Name: ${alert.targetGoalName}
Target Deadline: ${alert.targetDate.toISOString()}
Language to respond in: ${alert.language}
Daily Commitment: ${alert.dailyCommitmentMinutes} minutes

--- PROFILE DETAILS ---
${alert.academicStream ? `Academic Field: ${alert.academicStream}` : ''}
${alert.examName ? `Exam: ${alert.examName}` : ''}
${alert.targetRoleTitle ? `Target Role: ${alert.targetRoleTitle}` : ''}
${alert.weakestSubjects.length ? `Weakest Subjects: ${alert.weakestSubjects.join(', ')}` : ''}
${alert.priorityTopics.length ? `Priority Topics: ${alert.priorityTopics.join(', ')}` : ''}
${alert.focusInterviewSkill.length ? `Focus Skills: ${alert.focusInterviewSkill.join(', ')}` : ''}

${alert.targetMajorOrDegree ? `Target Major OrDe gree: ${alert.targetMajorOrDegree}` : ''}
${alert.currentWeeklyStudyHours ? `Current Weekly Study Hours: ${alert.currentWeeklyStudyHours}` : ''}
${alert.examRegistrationStatus ? `Exam Registration Status: ${alert.examRegistrationStatus}` : ''}
${alert.targetScoreGoal ? `Target Score Goal: ${alert.targetScoreGoal}` : ''}
${alert.weeklyApplicationGoal ? `Weekly Application Goal: ${alert.weeklyApplicationGoal}` : ''}
${alert.targetCompaniesCount ? `Target Companies Count: ${alert.targetCompaniesCount}` : ''}
${alert.additionalContextNotes ? `Notes: ${alert.additionalContextNotes}` : ''} 
              
--- USER PROGRESS & HISTORY ---
${ lastResponse?.description
    ? `Latest User Feedback/Check-in Reply: "${lastResponse.description}"`
    : 'No previous check-in reply received yet. This is an ongoing assignment stream.'
}

--- SYSTEM FLAGS ---
${ isFinalWarning
    ? `CRITICAL NOTICE: The user has failed to respond to 3 consecutive dispatches. 
       Emphasize that this is their FINAL automated alert before auto-pausing. 
       Urge them to click the check-in button to keep their engine active.`
    : 'Maintain a steady, professional, and encouraging momentum.'
}

--- INSTRUCTIONS ---
1. Provide a tailored assignment aligned strictly with the language specified (${alert.language}).
2. Focus on realistic output doable within ${alert.dailyCommitmentMinutes} minutes.
3. Incorporate their previous feedback or obstacle if provided.
4. Output strict JSON according to the schema provided.
`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    if (!response.text) {
      throw new Error('AI Engine failed to generate output payload.');
    }

    return JSON.parse(response.text) as GeneratedFocusAssignment;
  }
}