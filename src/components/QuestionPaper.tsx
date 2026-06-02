
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FormData } from '@/pages/Index';
import { generateQuestionPaper, generateSolutions } from '@/services/geminiService';
import { FileText, BookOpen, PenTool, Download } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface QuestionPaperProps {
  formData: FormData;
  onQuestionsGenerated: (questions: string) => void;
  onSolutionsGenerated: (solutions: string) => void;
  onAnswersSubmitted: (answers: any[]) => void;
  setIsLoading: (loading: boolean) => void;
  isLoading: boolean;
  generatedQuestions: string;
}

const QuestionPaper: React.FC<QuestionPaperProps> = ({
  formData,
  onQuestionsGenerated,
  onSolutionsGenerated,
  onAnswersSubmitted,
  setIsLoading,
  isLoading,
  generatedQuestions
}) => {
  const [solutionsLoading, setSolutionsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!generatedQuestions) {
      generateQuestions();
    }
  }, []);

  const generateQuestions = async () => {
    setIsLoading(true);
    try {
      const questions = await generateQuestionPaper(formData);
      onQuestionsGenerated(questions);
      toast({
        title: "Success!",
        description: "Question paper generated successfully!"
      });
    } catch (error: any) {
      console.error('Error generating questions:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to generate question paper. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSolutions = async () => {
    setSolutionsLoading(true);
    try {
      const solutions = await generateSolutions(formData, generatedQuestions);
      onSolutionsGenerated(solutions);
      toast({
        title: "Success!",
        description: "Solutions generated successfully!"
      });
    } catch (error) {
      console.error('Error generating solutions:', error);
      toast({
        title: "Error",
        description: "Failed to generate solutions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSolutionsLoading(false);
    }
  };

  const handleStartAnswering = () => {
    onAnswersSubmitted([]);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent">
              Generated Question Paper
            </CardTitle>
            <div className="flex space-x-2">
              <Button onClick={handlePrint} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
            <div>Subject: <span className="font-medium text-foreground">{formData.subject}</span></div>
            <div>Class: <span className="font-medium text-foreground">{formData.class}</span></div>
            <div>Total Marks: <span className="font-medium text-foreground">{formData.totalMarks}</span></div>
            <div>Difficulty: <span className="font-medium text-foreground">{formData.difficulty}</span></div>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : generatedQuestions ? (
            <div className="prose prose-sm sm:prose lg:prose-lg max-w-none dark:prose-invert">
              <div className="whitespace-pre-wrap">{generatedQuestions}</div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Failed to generate questions. Please try again.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {generatedQuestions && !isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleGenerateSolutions} 
                disabled={solutionsLoading}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                {solutionsLoading ? (
                  "Generating Solutions..."
                ) : (
                  <>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Generate Solutions
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleStartAnswering}
                variant="outline"
                className="border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900/20"
              >
                <PenTool className="h-4 w-4 mr-2" />
                Start Answering
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuestionPaper;
