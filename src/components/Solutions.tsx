
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from 'lucide-react';
import MarkdownPreview from '@uiw/react-markdown-preview';

interface SolutionsProps {
  solutions: string;
  onBack: () => void;
}

const Solutions: React.FC<SolutionsProps> = ({ solutions, onBack }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              Step-by-Step Solutions
            </CardTitle>
            <div className="flex space-x-2">
              <Button onClick={handlePrint} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Print Solutions
              </Button>
              <Button onClick={onBack} variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Questions
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div data-color-mode="light">
            <MarkdownPreview
              source={solutions}
              style={{ background: 'transparent', color: 'inherit' }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Solutions;
