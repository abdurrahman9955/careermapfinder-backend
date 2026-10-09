import { Type, Schema } from '@google/genai';
import { ai, MODEL_NAME } from '../utils/ai';
import { CareerExplorerIntake } from '@prisma/client';

export const careerReportSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    // Page 1: Career Identity & Overview
    careerName: { type: Type.STRING },
    careerOverview: { type: Type.STRING },
    whatProfessionalDoes: { type: Type.STRING },
    whyChooseThisCareer: { type: Type.STRING },
    whoIsSuitableFor: { type: Type.STRING },
    requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
    importantSubjects: { type: Type.ARRAY, items: { type: Type.STRING } },
    workEnvironmentDesc: { type: Type.STRING },
    typicalDayLife: { type: Type.STRING },

    // Page 2: Education & Eligibility Roadmap
    class10Requirements: { type: Type.STRING },
    class11_12Stream: { type: Type.STRING },
    subjectsRequired: { type: Type.ARRAY, items: { type: Type.STRING } },
    minQualification: {
      type: Type.STRING,
      enum: [
        'DIPLOMA',
        'BACHELORS',
        'MASTERS',
        'DOCTORATE_PHD',
        'PROFESSIONAL_CERTIFICATION',
        'FELLOWSHIP_SPECIALIZATION',
      ],
    },
    ageLimit: { type: Type.STRING, nullable: true },
    nationalityEligibility: { type: Type.STRING, nullable: true },
    medicalRequirements: { type: Type.STRING, nullable: true },
    courseOptions: { type: Type.ARRAY, items: { type: Type.STRING } },
    courseDuration: { type: Type.STRING },
    degreeRequired: { type: Type.STRING },

    // Page 3: Entrance Examinations & Strategy
    entranceExams: { type: Type.ARRAY, items: { type: Type.STRING } },
    nationalExams: { type: Type.ARRAY, items: { type: Type.STRING } },
    stateExams: { type: Type.ARRAY, items: { type: Type.STRING } },
    universityExams: { type: Type.ARRAY, items: { type: Type.STRING } },
    examEligibility: { type: Type.STRING },
    examPattern: { type: Type.STRING },
    examSubjects: { type: Type.ARRAY, items: { type: Type.STRING } },
    numberOfQuestions: { type: Type.INTEGER, nullable: true },
    markingScheme: { type: Type.STRING, nullable: true },
    examFrequency: { type: Type.STRING, nullable: true },
    applicationProcess: { type: Type.STRING },
    applicationFees: { type: Type.STRING, nullable: true },
    importantDates: { type: Type.STRING, nullable: true },
    prepStrategy: { type: Type.STRING },
    recommendedBooks: { type: Type.ARRAY, items: { type: Type.STRING } },
    prepTimeline: { type: Type.STRING },

    // Page 4: Admissions & College Guidance
    admissionProcess: { type: Type.STRING },
    counsellingProcess: { type: Type.STRING },
    quotaReservations: { type: Type.STRING, nullable: true },
    topGovtColleges: { type: Type.ARRAY, items: { type: Type.STRING } },
    topPrivateColleges: { type: Type.ARRAY, items: { type: Type.STRING } },
    collegeSelectionGuide: { type: Type.STRING },
    expectedCutoffs: { type: Type.STRING, nullable: true },
    feeStructure: { type: Type.STRING },
    availableScholarships: { type: Type.ARRAY, items: { type: Type.STRING } },

    // Page 5: Career Journey & Growth Milestones
    stepByStepRoadmap: { type: Type.STRING },
    internshipRequirements: { type: Type.STRING },
    licensingRegistration: { type: Type.STRING, nullable: true },
    entryLevelRoles: { type: Type.ARRAY, items: { type: Type.STRING } },
    midLevelRoles: { type: Type.ARRAY, items: { type: Type.STRING } },
    seniorLevelRoles: { type: Type.ARRAY, items: { type: Type.STRING } },
    specializations: { type: Type.ARRAY, items: { type: Type.STRING } },
    superSpecializations: { type: Type.ARRAY, items: { type: Type.STRING } },
    higherEducationPaths: { type: Type.ARRAY, items: { type: Type.STRING } },
    alternativeCareerPaths: { type: Type.ARRAY, items: { type: Type.STRING } },

    // Page 6: Employment Sectors & Opportunities
    govtJobOpportunities: { type: Type.STRING },
    privateJobOpportunities: { type: Type.STRING },
    selfEmploymentOptions: { type: Type.STRING },
    hiringIndustries: { type: Type.ARRAY, items: { type: Type.STRING } },
    topGlobalEmployers: { type: Type.ARRAY, items: { type: Type.STRING } },
    primeWorkLocations: { type: Type.ARRAY, items: { type: Type.STRING } },
    homeVsAbroadOverview: { type: Type.STRING },
    freelanceOpportunities: { type: Type.STRING, nullable: true },

    // Page 7: Financial Analytics & Salary Trajectory
    startingSalaryRange: { type: Type.STRING },
    averageSalary: { type: Type.STRING },
    experiencedSalary: { type: Type.STRING },
    highestPotentialEarnings: { type: Type.STRING },
    govtSalaryScale: { type: Type.STRING, nullable: true },
    privateSectorSalary: { type: Type.STRING },
    selfEmploymentEarnings: { type: Type.STRING, nullable: true },
    salaryByExperience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          stage: { type: Type.STRING },
          range: { type: Type.STRING },
        },
        required: ['stage', 'range'],
      },
    },
    salaryBySpecialization: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          specialization: { type: Type.STRING },
          avgSalary: { type: Type.STRING },
        },
        required: ['specialization', 'avgSalary'],
      },
    },
    keySalaryFactors: { type: Type.ARRAY, items: { type: Type.STRING } },

    // Page 8: Global Mobility & Practice Abroad
    topCountriesAbroad: { type: Type.ARRAY, items: { type: Type.STRING } },
    requiredExamsAbroad: { type: Type.ARRAY, items: { type: Type.STRING } },
    licensingAbroad: { type: Type.STRING },
    educationEquivalency: { type: Type.STRING },
    salaryAbroadComparison: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          country: { type: Type.STRING },
          avgSalary: { type: Type.STRING },
          visaEase: { type: Type.STRING },
        },
        required: ['country', 'avgSalary', 'visaEase'],
      },
    },
    immigrationRelocationPath: { type: Type.STRING },

    // Page 9: Realities, Stress & Work-Life Balance
    advantages: { type: Type.ARRAY, items: { type: Type.STRING } },
    disadvantages: { type: Type.ARRAY, items: { type: Type.STRING } },
    keyChallenges: { type: Type.ARRAY, items: { type: Type.STRING } },
    workLifeBalanceRating: { type: Type.INTEGER },
    typicalWorkingHours: { type: Type.STRING },
    stressLevel: { type: Type.STRING },
    jobSecurityRating: { type: Type.INTEGER },
    competitionLevel: { type: Type.STRING },
    careerGrowthVelocity: { type: Type.STRING },

    // Page 10: Future-Proofing, AI Impact & Tech Horizons
    futureDemandOutlook: { type: Type.STRING },
    aiAutomationImpact: { type: Type.STRING },
    aiReplacementRiskLevel: { type: Type.STRING },
    emergingOpportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
    emergingSpecializations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: [
    'careerName',
    'careerOverview',
    'whatProfessionalDoes',
    'whyChooseThisCareer',
    'whoIsSuitableFor',
    'requiredSkills',
    'importantSubjects',
    'workEnvironmentDesc',
    'typicalDayLife',
    'class10Requirements',
    'class11_12Stream',
    'subjectsRequired',
    'minQualification',
    'courseOptions',
    'courseDuration',
    'degreeRequired',
    'entranceExams',
    'nationalExams',
    'stateExams',
    'universityExams',
    'examEligibility',
    'examPattern',
    'examSubjects',
    'applicationProcess',
    'prepStrategy',
    'recommendedBooks',
    'prepTimeline',
    'admissionProcess',
    'counsellingProcess',
    'topGovtColleges',
    'topPrivateColleges',
    'collegeSelectionGuide',
    'feeStructure',
    'availableScholarships',
    'stepByStepRoadmap',
    'internshipRequirements',
    'entryLevelRoles',
    'midLevelRoles',
    'seniorLevelRoles',
    'specializations',
    'superSpecializations',
    'higherEducationPaths',
    'alternativeCareerPaths',
    'govtJobOpportunities',
    'privateJobOpportunities',
    'selfEmploymentOptions',
    'hiringIndustries',
    'topGlobalEmployers',
    'primeWorkLocations',
    'homeVsAbroadOverview',
    'startingSalaryRange',
    'averageSalary',
    'experiencedSalary',
    'highestPotentialEarnings',
    'privateSectorSalary',
    'salaryByExperience',
    'salaryBySpecialization',
    'keySalaryFactors',
    'topCountriesAbroad',
    'requiredExamsAbroad',
    'licensingAbroad',
    'educationEquivalency',
    'salaryAbroadComparison',
    'immigrationRelocationPath',
    'advantages',
    'disadvantages',
    'keyChallenges',
    'workLifeBalanceRating',
    'typicalWorkingHours',
    'stressLevel',
    'jobSecurityRating',
    'competitionLevel',
    'careerGrowthVelocity',
    'futureDemandOutlook',
    'aiAutomationImpact',
    'aiReplacementRiskLevel',
    'emergingOpportunities',
    'emergingSpecializations',
  ],
};

export class CareerExplorerAIService {
  static async generateComprehensiveReport(intake: CareerExplorerIntake) {
  const systemPrompt = `You are an elite, world-class educational counselor, international labor market economist, 
  and strategic career architect.
  Your task is to generate an ultra-rigorous, deeply personalized, attractive, and authoritative 10-page equivalent
  Career Roadmap Report based directly on the provided user intake data.

CRITICAL INSTRUCTIONS FOR PERSONALIZATION & ACCURACY:
1. OUTPUT LANGUAGE: Output the entire JSON values strictly in the specified language 
code/name: "${intake.language || 'English'}".
2. FACTUAL RIGOR: Do not use generic filler text or place-holder descriptions. 
Provide exact names of institutions, standardized tests, entry exams, degree names, 
visa pathways, real-world salary bandwidths, and official registration bodies.
3. CONTEXTUAL SYNTHESIS: Seamlessly weave the user's specific origin location (${intake.stateCity}, ${intake.homeCountry}), 
target study destination (${intake.targetStudyCountry}), current academic background (${intake.academicStream}, 
${intake.currentSchoolName || 'N/A'}, GPA/Performance: ${intake.estimatedGpaPerformance}), primary career priorities 
(${intake.primaryPriority}), work style (${intake.preferredWorkEnv}, Intensity: ${intake.workIntensity}), 
and qualitative narrative into every relevant analysis section.
4. TARGET SCHOOLS & CAREER: Provide concrete, real recommendations for top universities 
(both in home country ${intake.homeCountry} and target study destination ${intake.targetStudyCountry}) 
tailored strictly to their GPA profile and desired qualification target (${intake.preferredQualification}).
5. ADDRESS USER QUESTIONS: Directly resolve the user's explicit questions ("${intake.specificQuestions || 'None'}") 
within the relevant sections of the report.`;

    const userPrompt = `
=== USER QUESTIONNAIRE INTAKE DOSSIER ===
- Selected Report Language: ${intake.language || 'English'}
- Target Role / Field Vision: ${intake.targetRoleOrField}
- Academic Journey Stage: ${intake.journeyStage}
- Academic Stream: ${intake.academicStream}
- Current Grade / Level: ${intake.currentGradeLevel || 'Not specified'}
- Current Institution: ${intake.currentSchoolName || 'Not specified'}
- Key Subjects / Major: ${intake.keySubjectsMajor}
- Academic Performance / GPA: ${intake.estimatedGpaPerformance}
- Desired Qualification Target: ${intake.preferredQualification}

LOCATION CONTEXT:
- Origin Location: ${intake.stateCity}, ${intake.homeCountry}
- Target Destination for Study/Career: ${intake.targetStudyCountry}

PREFERENCES & PRIORITIES:
- Primary Career Priority: ${intake.primaryPriority}
- Preferred Work Environment: ${intake.preferredWorkEnv}
- Work Intensity Preference: ${intake.workIntensity}

QUALITATIVE BACKGROUND & QUESTIONS:
- Personal Background Narrative: ${intake.personalBackground}
- Specific Questions to Answer: ${intake.specificQuestions || 'None provided'}
=========================================

Generate the complete JSON response conforming strictly to the requested schema. Ensure high analytical depth, 
authoritative tone, and exact alignment with real-world global education systems, visa regulations, and current 
labor market realities.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `${systemPrompt}\n\n${userPrompt}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: careerReportSchema,
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (!text) throw new Error('AI failed to produce a valid Career Report.');
    return JSON.parse(text);
  }
}
