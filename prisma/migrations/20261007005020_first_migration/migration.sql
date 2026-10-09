-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('EXECUTIVE', 'MANAGER', 'STAFF', 'EMPLOYEE', 'SUPERVISOR', 'PARENT', 'COURSE_MATE');

-- CreateEnum
CREATE TYPE "ExamCategory" AS ENUM ('ACADEMIC', 'PROFESSIONAL');

-- CreateEnum
CREATE TYPE "ExamFormat" AS ENUM ('OBJECTIVE_ONLY', 'THEORY_ONLY', 'HYBRID', 'PRACTICAL_CODING');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'MULTIPLE_SELECT', 'SHORT_INPUT', 'ESSAY_LONG_TEXT', 'CODE_EXECUTION');

-- CreateEnum
CREATE TYPE "QuestionVisualType" AS ENUM ('TEXT', 'MARKDOWN', 'CODE', 'TABLE', 'IMAGE');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('FOUNDATIONAL', 'STANDARD', 'HIGH_DISTINCTION');

-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('GENERATED', 'IN_PROGRESS', 'SUBMITTED', 'EVALUATED');

-- CreateEnum
CREATE TYPE "CareerStage" AS ENUM ('STUDENT_INTERN', 'RECENT_GRADUATE', 'ENTRY_LEVEL', 'MID_LEVEL', 'SENIOR', 'STAFF_PRINCIPAL', 'EXECUTIVE');

-- CreateEnum
CREATE TYPE "WorkArrangement" AS ENUM ('REMOTE', 'HYBRID', 'ON_SITE', 'OPEN_TO_RELOCATION');

-- CreateEnum
CREATE TYPE "InterviewerStyle" AS ENUM ('SUPPORTIVE_COACH', 'STRICT_TECH_LEAD', 'TOP_TECH_ASSESSOR', 'TALENT_ACQUISITION');

-- CreateEnum
CREATE TYPE "QuestionCategory" AS ENUM ('TECHNICAL_LIVE_CODING', 'SYSTEM_DESIGN_ARCHITECTURE', 'BEHAVIORAL_STAR', 'DOMAIN_SPECIFIC', 'CASE_STUDY_PROBLEM_SOLVING', 'HR_RECRUITER_SCREENING');

-- CreateEnum
CREATE TYPE "VisualLayoutType" AS ENUM ('CODE_EDITOR', 'WHITEBOARD_DIAGRAM', 'STAR_STRUCTURED', 'METRIC_TABLE', 'TEXT_MARKDOWN');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('CONFIGURED', 'IN_PROGRESS', 'SUBMITTED', 'EVALUATED');

-- CreateEnum
CREATE TYPE "AcademicJourneyStage" AS ENUM ('HIGH_SCHOOL', 'UNDERGRADUATE', 'RECENT_GRADUATE', 'CAREER_SWITCHER');

-- CreateEnum
CREATE TYPE "AcademicStream" AS ENUM ('PHYSICAL_NATURAL_SCIENCES', 'ENGINEERING_TECHNOLOGY', 'HEALTH_MEDICAL_SCIENCES', 'COMMERCIAL_BUSINESS', 'ARTS_LAW_HUMANITIES', 'UNDECIDED_OPEN');

-- CreateEnum
CREATE TYPE "PrimaryCareerPriority" AS ENUM ('HIGH_EARNING_POTENTIAL', 'WORK_LIFE_BALANCE', 'GLOBAL_MOBILITY_VISAS', 'SOCIAL_IMPACT_PURPOSE', 'HIGH_DEMAND_STABILITY', 'CREATIVE_AUTONOMY');

-- CreateEnum
CREATE TYPE "PreferredWorkEnvironment" AS ENUM ('REMOTE', 'HYBRID', 'ON_SITE', 'FLEXIBLE');

-- CreateEnum
CREATE TYPE "WorkIntensityPreference" AS ENUM ('STANDARD_40H', 'MODERATE_50H', 'HIGH_INTENSITY_60H_PLUS');

-- CreateEnum
CREATE TYPE "QualificationTarget" AS ENUM ('DIPLOMA', 'BACHELORS', 'MASTERS', 'DOCTORATE_PHD', 'PROFESSIONAL_CERTIFICATION', 'FELLOWSHIP_SPECIALIZATION');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "count" SERIAL NOT NULL,
    "profileImage" TEXT,
    "phoneNumber" TEXT,
    "location" TEXT,
    "bio" TEXT,
    "academicLevel" TEXT,
    "streamSpecialization" TEXT,
    "fieldOfInterest" TEXT,
    "institutionName" TEXT,
    "graduationYear" TEXT,
    "targetPercentage" TEXT,
    "planType" TEXT,
    "billingCycle" TEXT,
    "nextBillingDate" TIMESTAMP(3),
    "lastPaymentDate" TIMESTAMP(3),
    "careerCreation" INTEGER NOT NULL DEFAULT 0,
    "assessmentCreation" INTEGER NOT NULL DEFAULT 0,
    "interviewCreation" INTEGER NOT NULL DEFAULT 0,
    "alertCreation" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "email_verified" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "handle" TEXT,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "otp" TEXT,
    "otpExpiration" TIMESTAMP(3),
    "tempPassword" TEXT,
    "emailVerified" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isSuspendedAt" TIMESTAMP(3),

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isCreatingCareer" BOOLEAN NOT NULL DEFAULT false,
    "isCreatingAssessment" BOOLEAN NOT NULL DEFAULT false,
    "isCreatingInterview" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UpdateResponse" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "careerUpdate" TEXT,
    "assessmentUpdate" TEXT,
    "interviewUpdate" TEXT,
    "dashboardsUpdate" TEXT,
    "settingsUpdate" TEXT,
    "notificationUpdate" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UpdateResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "emails" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "Roles" NOT NULL,
    "fullName" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "fullAddress" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "idCard" TEXT,
    "profileImage" TEXT,
    "governmentId" TEXT,
    "isOnboarded" BOOLEAN NOT NULL DEFAULT false,
    "isActiveInCompany" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Counseling" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "emailAddress" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "academicStatus" TEXT NOT NULL,
    "targetUniversity" TEXT,
    "fieldofStudy" TEXT,
    "graduationYear" TEXT,
    "primaryFocus" TEXT NOT NULL,
    "biggestPainPoint" TEXT NOT NULL,
    "questions" TEXT NOT NULL,
    "sessionMode" TEXT NOT NULL,
    "timeWindow" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Counseling_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "reason" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "planType" TEXT NOT NULL,
    "billingCycle" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isSuspended" BOOLEAN NOT NULL DEFAULT true,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "trialEndsAt" TIMESTAMP(3),
    "nextBillingDate" TIMESTAMP(3),
    "lastPaymentDate" TIMESTAMP(3),
    "cancellationDate" TIMESTAMP(3),
    "periodStart" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "planType" TEXT NOT NULL,
    "billingCycle" TEXT NOT NULL,
    "nextBillingDate" TIMESTAMP(3) NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "cardType" TEXT,
    "cardNumber" TEXT,
    "cardExpiry" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "invoiceLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Earning" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planType" TEXT NOT NULL,
    "billingCycle" TEXT NOT NULL,
    "nextBillingDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Earning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "category" "ExamCategory" NOT NULL,
    "format" "ExamFormat" NOT NULL DEFAULT 'HYBRID',
    "country" TEXT,
    "state" TEXT,
    "examName" TEXT,
    "stream" TEXT,
    "subject" TEXT,
    "targetProgram" TEXT,
    "targetCareer" TEXT,
    "primaryObjective" TEXT,
    "industry" TEXT,
    "certVendor" TEXT,
    "examDescription" TEXT,
    "academicBackground" TEXT,
    "difficulty" "DifficultyLevel" NOT NULL,
    "targetScore" INTEGER NOT NULL,
    "timeLimitMinutes" INTEGER NOT NULL DEFAULT 60,
    "status" "ExamStatus" NOT NULL DEFAULT 'GENERATED',
    "startedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamQuestion" (
    "id" TEXT NOT NULL,
    "examSessionId" TEXT NOT NULL,
    "questionNumber" INTEGER NOT NULL,
    "sectionTitle" TEXT,
    "questionType" "QuestionType" NOT NULL,
    "visualType" "QuestionVisualType" NOT NULL DEFAULT 'TEXT',
    "prompt" TEXT NOT NULL,
    "supplementaryData" JSONB,
    "options" JSONB,
    "maxMarks" INTEGER NOT NULL DEFAULT 1,
    "rubric" JSONB,
    "correctAnswer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserResponse" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answerText" TEXT,
    "selectedOptions" TEXT[],
    "timeSpentSeconds" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationReport" (
    "id" TEXT NOT NULL,
    "examSessionId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "totalMarksObtained" DOUBLE PRECISION NOT NULL,
    "totalMaxMarks" DOUBLE PRECISION NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "grade" TEXT,
    "overallFeedback" TEXT NOT NULL,
    "strengths" TEXT[],
    "improvementAreas" TEXT[],
    "categoryBreakdown" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvaluationReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "targetJobTitle" TEXT NOT NULL,
    "industryDomain" TEXT NOT NULL,
    "careerStage" "CareerStage" NOT NULL,
    "workArrangement" "WorkArrangement"[],
    "targetCountries" TEXT[],
    "isExperienced" BOOLEAN NOT NULL DEFAULT true,
    "highestDegree" TEXT NOT NULL,
    "institution" TEXT,
    "mostRecentEmployer" TEXT,
    "yearsOfExperience" INTEGER NOT NULL DEFAULT 0,
    "currentJobTitle" TEXT,
    "coreSkills" TEXT[],
    "summaryOfAchievements" TEXT NOT NULL,
    "selectedCategories" "QuestionCategory"[],
    "interviewerStyle" "InterviewerStyle" NOT NULL,
    "estimatedDurationMins" INTEGER NOT NULL DEFAULT 30,
    "jobDescription" TEXT NOT NULL,
    "status" "InterviewStatus" NOT NULL DEFAULT 'CONFIGURED',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewQuestion" (
    "id" TEXT NOT NULL,
    "interviewSessionId" TEXT NOT NULL,
    "questionNumber" INTEGER NOT NULL,
    "category" "QuestionCategory" NOT NULL,
    "visualLayout" "VisualLayoutType" NOT NULL DEFAULT 'TEXT_MARKDOWN',
    "title" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "timeAllocationMins" INTEGER NOT NULL DEFAULT 5,
    "codeStarterSnippet" TEXT,
    "codeLanguage" TEXT,
    "supplementaryData" JSONB,
    "rubricCriteria" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateResponse" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "responseText" TEXT,
    "submittedCode" TEXT,
    "selectedChoices" TEXT[],
    "timeSpentSeconds" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewEvaluationReport" (
    "id" TEXT NOT NULL,
    "interviewSessionId" TEXT NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "hireRecommendation" TEXT NOT NULL,
    "executiveSummary" TEXT NOT NULL,
    "technicalProficiency" DOUBLE PRECISION NOT NULL,
    "communicationClarity" DOUBLE PRECISION NOT NULL,
    "problemSolvingLogic" DOUBLE PRECISION NOT NULL,
    "cultureAndLeadership" DOUBLE PRECISION NOT NULL,
    "domainKnowledge" DOUBLE PRECISION NOT NULL,
    "strengths" TEXT[],
    "weaknesses" TEXT[],
    "keyImprovementAreas" TEXT[],
    "categoryBreakdowns" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewEvaluationReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerExplorerIntake" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "journeyStage" "AcademicJourneyStage" NOT NULL,
    "targetRoleOrField" TEXT NOT NULL,
    "academicStream" "AcademicStream" NOT NULL,
    "homeCountry" TEXT NOT NULL,
    "stateCity" TEXT NOT NULL,
    "targetStudyCountry" TEXT NOT NULL,
    "currentGradeLevel" TEXT,
    "currentSchoolName" TEXT,
    "keySubjectsMajor" TEXT NOT NULL,
    "estimatedGpaPerformance" TEXT NOT NULL,
    "preferredQualification" "QualificationTarget" NOT NULL,
    "primaryPriority" "PrimaryCareerPriority" NOT NULL,
    "preferredWorkEnv" "PreferredWorkEnvironment" NOT NULL,
    "workIntensity" "WorkIntensityPreference" NOT NULL,
    "personalBackground" TEXT NOT NULL,
    "specificQuestions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerExplorerIntake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerReport" (
    "id" TEXT NOT NULL,
    "intakeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "careerName" TEXT NOT NULL,
    "careerOverview" TEXT NOT NULL,
    "whatProfessionalDoes" TEXT NOT NULL,
    "whyChooseThisCareer" TEXT NOT NULL,
    "whoIsSuitableFor" TEXT NOT NULL,
    "requiredSkills" TEXT[],
    "importantSubjects" TEXT[],
    "workEnvironmentDesc" TEXT NOT NULL,
    "typicalDayLife" TEXT NOT NULL,
    "class10Requirements" TEXT NOT NULL,
    "class11_12Stream" TEXT NOT NULL,
    "subjectsRequired" TEXT[],
    "minQualification" "QualificationTarget" NOT NULL,
    "ageLimit" TEXT,
    "nationalityEligibility" TEXT,
    "medicalRequirements" TEXT,
    "courseOptions" TEXT[],
    "courseDuration" TEXT NOT NULL,
    "degreeRequired" TEXT NOT NULL,
    "entranceExams" TEXT[],
    "nationalExams" TEXT[],
    "stateExams" TEXT[],
    "universityExams" TEXT[],
    "examEligibility" TEXT NOT NULL,
    "examPattern" TEXT NOT NULL,
    "examSubjects" TEXT[],
    "numberOfQuestions" INTEGER,
    "markingScheme" TEXT,
    "examFrequency" TEXT,
    "applicationProcess" TEXT NOT NULL,
    "applicationFees" TEXT,
    "importantDates" TEXT,
    "prepStrategy" TEXT NOT NULL,
    "recommendedBooks" TEXT[],
    "prepTimeline" TEXT NOT NULL,
    "admissionProcess" TEXT NOT NULL,
    "counsellingProcess" TEXT NOT NULL,
    "quotaReservations" TEXT,
    "topGovtColleges" TEXT[],
    "topPrivateColleges" TEXT[],
    "collegeSelectionGuide" TEXT NOT NULL,
    "expectedCutoffs" TEXT,
    "feeStructure" TEXT NOT NULL,
    "availableScholarships" TEXT[],
    "stepByStepRoadmap" TEXT NOT NULL,
    "internshipRequirements" TEXT NOT NULL,
    "licensingRegistration" TEXT,
    "entryLevelRoles" TEXT[],
    "midLevelRoles" TEXT[],
    "seniorLevelRoles" TEXT[],
    "specializations" TEXT[],
    "superSpecializations" TEXT[],
    "higherEducationPaths" TEXT[],
    "alternativeCareerPaths" TEXT[],
    "govtJobOpportunities" TEXT NOT NULL,
    "privateJobOpportunities" TEXT NOT NULL,
    "selfEmploymentOptions" TEXT NOT NULL,
    "hiringIndustries" TEXT[],
    "topGlobalEmployers" TEXT[],
    "primeWorkLocations" TEXT[],
    "homeVsAbroadOverview" TEXT NOT NULL,
    "freelanceOpportunities" TEXT,
    "startingSalaryRange" TEXT NOT NULL,
    "averageSalary" TEXT NOT NULL,
    "experiencedSalary" TEXT NOT NULL,
    "highestPotentialEarnings" TEXT NOT NULL,
    "govtSalaryScale" TEXT,
    "privateSectorSalary" TEXT NOT NULL,
    "selfEmploymentEarnings" TEXT,
    "salaryByExperience" JSONB NOT NULL,
    "salaryBySpecialization" JSONB NOT NULL,
    "keySalaryFactors" TEXT[],
    "topCountriesAbroad" TEXT[],
    "requiredExamsAbroad" TEXT[],
    "licensingAbroad" TEXT NOT NULL,
    "educationEquivalency" TEXT NOT NULL,
    "salaryAbroadComparison" JSONB NOT NULL,
    "immigrationRelocationPath" TEXT NOT NULL,
    "advantages" TEXT[],
    "disadvantages" TEXT[],
    "keyChallenges" TEXT[],
    "workLifeBalanceRating" INTEGER NOT NULL,
    "typicalWorkingHours" TEXT NOT NULL,
    "stressLevel" TEXT NOT NULL,
    "jobSecurityRating" INTEGER NOT NULL,
    "competitionLevel" TEXT NOT NULL,
    "careerGrowthVelocity" TEXT NOT NULL,
    "futureDemandOutlook" TEXT NOT NULL,
    "aiAutomationImpact" TEXT NOT NULL,
    "aiReplacementRiskLevel" TEXT NOT NULL,
    "emergingOpportunities" TEXT[],
    "emergingSpecializations" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_count_key" ON "User"("count");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_user_id_key" ON "accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_handle_key" ON "accounts"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "employees_emails_key" ON "employees"("emails");

-- CreateIndex
CREATE UNIQUE INDEX "employees_user_id_key" ON "employees"("user_id");

-- CreateIndex
CREATE INDEX "ExamQuestion_examSessionId_questionNumber_idx" ON "ExamQuestion"("examSessionId", "questionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "EvaluationReport_examSessionId_key" ON "EvaluationReport"("examSessionId");

-- CreateIndex
CREATE INDEX "InterviewSession_userId_idx" ON "InterviewSession"("userId");

-- CreateIndex
CREATE INDEX "InterviewQuestion_interviewSessionId_questionNumber_idx" ON "InterviewQuestion"("interviewSessionId", "questionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewEvaluationReport_interviewSessionId_key" ON "InterviewEvaluationReport"("interviewSessionId");

-- CreateIndex
CREATE INDEX "CareerExplorerIntake_userId_idx" ON "CareerExplorerIntake"("userId");

-- CreateIndex
CREATE INDEX "CareerExplorerIntake_targetRoleOrField_idx" ON "CareerExplorerIntake"("targetRoleOrField");

-- CreateIndex
CREATE INDEX "CareerReport_intakeId_idx" ON "CareerReport"("intakeId");

-- CreateIndex
CREATE INDEX "CareerReport_careerName_idx" ON "CareerReport"("careerName");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UpdateResponse" ADD CONSTRAINT "UpdateResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSession" ADD CONSTRAINT "ExamSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamQuestion" ADD CONSTRAINT "ExamQuestion_examSessionId_fkey" FOREIGN KEY ("examSessionId") REFERENCES "ExamSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserResponse" ADD CONSTRAINT "UserResponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ExamQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationReport" ADD CONSTRAINT "EvaluationReport_examSessionId_fkey" FOREIGN KEY ("examSessionId") REFERENCES "ExamSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewSession" ADD CONSTRAINT "InterviewSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewQuestion" ADD CONSTRAINT "InterviewQuestion_interviewSessionId_fkey" FOREIGN KEY ("interviewSessionId") REFERENCES "InterviewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateResponse" ADD CONSTRAINT "CandidateResponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "InterviewQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewEvaluationReport" ADD CONSTRAINT "InterviewEvaluationReport_interviewSessionId_fkey" FOREIGN KEY ("interviewSessionId") REFERENCES "InterviewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerExplorerIntake" ADD CONSTRAINT "CareerExplorerIntake_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerReport" ADD CONSTRAINT "CareerReport_intakeId_fkey" FOREIGN KEY ("intakeId") REFERENCES "CareerExplorerIntake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerReport" ADD CONSTRAINT "CareerReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
