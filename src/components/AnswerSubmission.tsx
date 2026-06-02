
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { FormData, Answer, PerformanceResult } from '@/pages/Index';
import { evaluateAnswers } from '@/services/geminiService';
import { CheckCircle, Clock, Send } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import MarkdownPreview from '@uiw/react-markdown-preview';
import { extractQuestions } from '@/lib/extractQuestions';

interface AnswerSubmissionProps {
  formData: FormData;
  questions: string;
  submittedAnswers: Answer[];
  onResultsGenerated: (results: PerformanceResult) => void;
  setIsLoading: (loading: boolean) => void;
  isLoading: boolean;
}

const AnswerSubmission: React.FC<AnswerSubmissionProps> = ({
  formData,
  questions,
  submittedAnswers,
  onResultsGenerated,
  setIsLoading,
  isLoading
}) => {
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timeSpent, setTimeSpent] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    const answerList: Answer[] = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer
    }));

    if (answerList.length === 0) {
      toast({
        title: "No Answers",
        description: "Please provide at least one answer before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const results = await evaluateAnswers(formData, questions, answerList);
      onResultsGenerated(results);
      toast({
        title: "Success!",
        description: "Your answers have been evaluated successfully!"
      });
    } catch (error) {
      console.error('Error evaluating answers:', error);
      toast({
        title: "Error",
        description: "Failed to evaluate answers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Extract questions from markdown text (simple parsing)
  const extractQuestions = (text: string) => {
    const questionPattern = /(?:Question\s*\d+|Q\.\s*\d+|\d+\.)/gi;
    const sections = text.split(questionPattern).filter(section => section.trim());
    return sections.slice(1); // Skip the first empty section
  };

  const questionSections = extractQuestions(questions);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Answer Submission
            </CardTitle>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Time: {formatTime(timeSpent)}
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Answered: {Object.keys(answers).length}/{questionSections.length}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {questionSections.map((question, index) => (
            <Card key={index} className="border-l-4 border-l-blue-500">
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <div className="whitespace-pre-wrap">
                      <strong>Question {index + 1}:</strong>
                      {question.trim()}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`answer-${index}`}>Your Answer:</Label>
                    <Textarea
                      id={`answer-${index}`}
                      value={answers[`q${index + 1}`] || ''}
                      onChange={(e) => handleAnswerChange(`q${index + 1}`, e.target.value)}
                      placeholder="Type your answer here..."
                      rows={4}
                      className="min-h-20"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <div className="flex justify-center pt-6">
            <Button 
              onClick={handleSubmit}
              disabled={isLoading || Object.keys(answers).length === 0}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-2"
            >
              {isLoading ? (
                "Evaluating Answers..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit for Evaluation
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnswerSubmission;
