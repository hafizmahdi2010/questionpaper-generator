
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Sparkles } from 'lucide-react';
import { FormData } from '@/pages/Index';
import { useToast } from "@/hooks/use-toast";

interface QuestionFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<FormData>({
    subject: '',
    class: '',
    totalMarks: '',
    difficulty: '',
    book: '',
    chapters: [],
    specificTopics: '',
    additionalInstructions: '',
    questionPaperPattern: ''
  });
  
  const [newChapter, setNewChapter] = useState('');
  const { toast } = useToast();

  const subjects = ['Maths', 'Science', 'SST', 'English', 'Hindi', 'Urdu', 'Chemistry', 'Biology', 'Physics'];
  const classes = Array.from({ length: 7 }, (_, i) => `Class ${i + 6}`);
  const totalMarks = ['20', '40', '50', '60', '75', '80', '100'];
  const difficulties = ['Easy', 'Normal', 'Hard'];
  const patterns = ['Board', 'Local', 'MCQ', 'Mixed'];
  const books = ['NCERT', 'CBSE', 'State Board', 'ICSE', 'Other'];

  const addChapter = () => {
    if (newChapter.trim() && !formData.chapters.includes(newChapter.trim())) {
      setFormData(prev => ({
        ...prev,
        chapters: [...prev.chapters, newChapter.trim()]
      }));
      setNewChapter('');
    }
  };

  const removeChapter = (chapter: string) => {
    setFormData(prev => ({
      ...prev,
      chapters: prev.chapters.filter(c => c !== chapter)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.class || !formData.totalMarks || !formData.difficulty) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields marked with *",
        variant: "destructive"
      });
      return;
    }

    onSubmit(formData);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
          Generate Question Paper
        </CardTitle>
        <p className="text-center text-muted-foreground">
          Fill in the details to create a customized question paper
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Select value={formData.subject} onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="class">Class *</Label>
              <Select value={formData.class} onValueChange={(value) => setFormData(prev => ({ ...prev, class: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(cls => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="totalMarks">Total Marks *</Label>
              <Select value={formData.totalMarks} onValueChange={(value) => setFormData(prev => ({ ...prev, totalMarks: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select total marks" />
                </SelectTrigger>
                <SelectContent>
                  {totalMarks.map(marks => (
                    <SelectItem key={marks} value={marks}>{marks} Marks</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level *</Label>
              <Select value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map(difficulty => (
                    <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="book">Book</Label>
              <Select value={formData.book} onValueChange={(value) => setFormData(prev => ({ ...prev, book: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select book" />
                </SelectTrigger>
                <SelectContent>
                  {books.map(book => (
                    <SelectItem key={book} value={book}>{book}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pattern">Question Paper Pattern</Label>
              <Select value={formData.questionPaperPattern} onValueChange={(value) => setFormData(prev => ({ ...prev, questionPaperPattern: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pattern" />
                </SelectTrigger>
                <SelectContent>
                  {patterns.map(pattern => (
                    <SelectItem key={pattern} value={pattern}>{pattern}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chapters">Chapters</Label>
              <div className="flex space-x-2">
                <Input
                  value={newChapter}
                  onChange={(e) => setNewChapter(e.target.value)}
                  placeholder="Add chapter name"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addChapter())}
                />
                <Button type="button" onClick={addChapter} size="icon" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.chapters.map(chapter => (
                  <Badge key={chapter} variant="secondary" className="flex items-center gap-1">
                    {chapter}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeChapter(chapter)} />
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="specificTopics">Specific Topics to Focus</Label>
              <Input
                value={formData.specificTopics}
                onChange={(e) => setFormData(prev => ({ ...prev, specificTopics: e.target.value }))}
                placeholder="Enter specific topics (optional)"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="additionalInstructions">Additional Instructions</Label>
              <Textarea
                value={formData.additionalInstructions}
                onChange={(e) => setFormData(prev => ({ ...prev, additionalInstructions: e.target.value }))}
                placeholder="Any additional instructions for the question paper..."
                rows={3}
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              "Generating..."
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Question Paper
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default QuestionForm;
