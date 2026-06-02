
import React, { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/Header';
import QuestionForm from '@/components/QuestionForm';
import QuestionPaper from '@/components/QuestionPaper';
import Solutions from '@/components/Solutions';
import AnswerSubmission from '@/components/AnswerSubmission';
import Results from '@/components/Results';
import { ThemeProvider } from '@/contexts/ThemeContext';

export interface FormData {
  subject: string;
  class: string;
  totalMarks: string;
  difficulty: string;
  book: string;
  chapters: string[];
  specificTopics: string;
  additionalInstructions: string;
  questionPaperPattern: string;
  model: string;
  syllabusPdfText?: string;
  syllabusFileName?: string;
}

export interface Question {
  id: string;
  question: string;
  marks: number;
  type: string;
}

export interface Answer {
  questionId: string;
  answer: string;
}

export interface EvaluationResult {
  questionId: string;
  score: number;
  maxScore: number;
  feedback: string;
  isCorrect: boolean;
}

export interface PerformanceResult {
  totalScore: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  remarks: string;
  questionResults: EvaluationResult[];
}

const Index = () => {
  const [currentView, setCurrentView] = useState<'form' | 'questions' | 'solutions' | 'answers' | 'results'>('form');
  const [formData, setFormData] = useState<FormData | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<string>('');
  const [generatedSolutions, setGeneratedSolutions] = useState<string>('');
  const [submittedAnswers, setSubmittedAnswers] = useState<Answer[]>([]);
  const [performanceResult, setPerformanceResult] = useState<PerformanceResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = (data: FormData) => {
    setFormData(data);
    setCurrentView('questions');
  };

  const handleQuestionsGenerated = (questions: string) => {
    setGeneratedQuestions(questions);
  };

  const handleSolutionsGenerated = (solutions: string) => {
    setGeneratedSolutions(solutions);
    setCurrentView('solutions');
  };

  const handleAnswersSubmitted = (answers: Answer[]) => {
    setSubmittedAnswers(answers);
    setCurrentView('answers');
  };

  const handleResultsGenerated = (results: PerformanceResult) => {
    setPerformanceResult(results);
    setCurrentView('results');
  };

  const resetToForm = () => {
    setCurrentView('form');
    setFormData(null);
    setGeneratedQuestions('');
    setGeneratedSolutions('');
    setSubmittedAnswers([]);
    setPerformanceResult(null);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 transition-colors duration-300">
        <Header onReset={resetToForm} />
        
        <main className="container mx-auto px-4 py-8">
          {currentView === 'form' && (
            <QuestionForm onSubmit={handleFormSubmit} isLoading={isLoading} />
          )}
          
          {currentView === 'questions' && formData && (
            <QuestionPaper
              formData={formData}
              onQuestionsGenerated={handleQuestionsGenerated}
              onSolutionsGenerated={handleSolutionsGenerated}
              onAnswersSubmitted={handleAnswersSubmitted}
              setIsLoading={setIsLoading}
              isLoading={isLoading}
              generatedQuestions={generatedQuestions}
            />
          )}
          
          {currentView === 'solutions' && (
            <Solutions
              solutions={generatedSolutions}
              onBack={() => setCurrentView('questions')}
            />
          )}
          
          {currentView === 'answers' && formData && (
            <AnswerSubmission
              formData={formData}
              questions={generatedQuestions}
              submittedAnswers={submittedAnswers}
              onResultsGenerated={handleResultsGenerated}
              setIsLoading={setIsLoading}
              isLoading={isLoading}
            />
          )}
          
          {currentView === 'results' && performanceResult && (
            <Results
              result={performanceResult}
              onReset={resetToForm}
            />
          )}
        </main>
        
        <Toaster />
      </div>
    </ThemeProvider>
  );
};

export default Index;
