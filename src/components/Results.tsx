
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PerformanceResult } from '@/pages/Index';
import { Trophy, Award, Target, RotateCcw, Download } from 'lucide-react';

interface ResultsProps {
  result: PerformanceResult;
  onReset: () => void;
}

const Results: React.FC<ResultsProps> = ({ result, onReset }) => {
  const getGradeColor = (grade: string) => {
    switch (grade.toUpperCase()) {
      case 'A+':
      case 'A': return 'bg-green-500';
      case 'B+':
      case 'B': return 'bg-blue-500';
      case 'C+':
      case 'C': return 'bg-yellow-500';
      case 'D': return 'bg-orange-500';
      default: return 'bg-red-500';
    }
  };

  const getPerformanceIcon = (percentage: number) => {
    if (percentage >= 90) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (percentage >= 75) return <Award className="h-6 w-6 text-blue-500" />;
    return <Target className="h-6 w-6 text-gray-500" />;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 dark:from-yellow-400 dark:via-orange-400 dark:to-red-400 bg-clip-text text-transparent">
              Performance Results
            </CardTitle>
            <div className="flex space-x-2">
              <Button onClick={handlePrint} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Print Results
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-2">
                  {getPerformanceIcon(result.percentage)}
                </div>
                <div className="text-3xl font-bold text-foreground">{result.totalScore}</div>
                <div className="text-sm text-muted-foreground">out of {result.totalMarks}</div>
                <div className="text-lg font-semibold text-primary mt-2">{result.percentage.toFixed(1)}%</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-2">
                  <Award className="h-6 w-6 text-purple-500" />
                </div>
                <Badge className={`${getGradeColor(result.grade)} text-white text-xl px-4 py-2`}>
                  Grade {result.grade}
                </Badge>
                <div className="mt-4">
                  <Progress value={result.percentage} className="h-3" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-6 w-6 text-green-500" />
                </div>
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {result.questionResults.filter(q => q.isCorrect).length} Correct
                </div>
                <div className="text-sm text-muted-foreground">
                  out of {result.questionResults.length} questions
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Overall Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{result.remarks}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Question-wise Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.questionResults.map((question, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Question {index + 1}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {question.score}/{question.maxScore} marks
                        </span>
                        <Badge variant={question.isCorrect ? "default" : "destructive"}>
                          {question.isCorrect ? "Correct" : "Incorrect"}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{question.feedback}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-center pt-6">
            <Button 
              onClick={onReset}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-2"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Generate New Question Paper
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Results;
