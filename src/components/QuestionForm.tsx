import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Sparkles, Upload, FileText, Loader2 } from 'lucide-react';
import { FormData } from '@/pages/Index';
import { useToast } from "@/hooks/use-toast";
import CustomSelect from './CustomSelect';
import { FREE_MODELS } from '@/services/geminiService';
import { extractPdfText } from '@/lib/pdfParser';

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
    questionPaperPattern: '',
    model: FREE_MODELS[1],
    syllabusPdfText: '',
    syllabusFileName: '',
  });

  const [newChapter, setNewChapter] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const { toast } = useToast();

  const subjects = ['Maths', 'Science', 'SST', 'English', 'Hindi', 'Urdu', 'Chemistry', 'Biology', 'Physics'];
  const classes = Array.from({ length: 7 }, (_, i) => `Class ${i + 6}`);
  const totalMarks = ['20', '40', '50', '60', '75', '80', '100'];
  const difficulties = ['Easy', 'Normal', 'Hard'];
  const patterns = ['Board', 'Local', 'MCQ', 'Mixed'];
  const books = ['NCERT', 'CBSE', 'State Board', 'ICSE', 'Other'];

  const addChapter = () => {
    if (newChapter.trim() && !formData.chapters.includes(newChapter.trim())) {
      setFormData(prev => ({ ...prev, chapters: [...prev.chapters, newChapter.trim()] }));
      setNewChapter('');
    }
  };

  const removeChapter = (chapter: string) => {
    setFormData(prev => ({ ...prev, chapters: prev.chapters.filter(c => c !== chapter) }));
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast({ title: "Invalid file", description: "Please upload a PDF file.", variant: "destructive" });
      return;
    }
    setPdfLoading(true);
    try {
      const text = await extractPdfText(file);
      setFormData(prev => ({ ...prev, syllabusPdfText: text, syllabusFileName: file.name }));
      toast({ title: "PDF uploaded", description: `Extracted text from ${file.name}` });
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to read PDF", description: "Could not extract text from this PDF.", variant: "destructive" });
    } finally {
      setPdfLoading(false);
    }
  };

  const removePdf = () => {
    setFormData(prev => ({ ...prev, syllabusPdfText: '', syllabusFileName: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.class || !formData.totalMarks || !formData.difficulty) {
      toast({ title: "Missing Required Fields", description: "Please fill in all required fields marked with *", variant: "destructive" });
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
        <p className="text-center text-muted-foreground">Fill in the details to create a customized question paper</p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Subject *</Label>
              <CustomSelect value={formData.subject} onChange={(v) => setFormData(p => ({ ...p, subject: v }))} options={subjects} placeholder="Select subject" />
            </div>

            <div className="space-y-2">
              <Label>Class *</Label>
              <CustomSelect value={formData.class} onChange={(v) => setFormData(p => ({ ...p, class: v }))} options={classes} placeholder="Select class" />
            </div>

            <div className="space-y-2">
              <Label>Total Marks *</Label>
              <CustomSelect value={formData.totalMarks} onChange={(v) => setFormData(p => ({ ...p, totalMarks: v }))} options={totalMarks} placeholder="Select total marks" formatLabel={(v) => `${v} Marks`} />
            </div>

            <div className="space-y-2">
              <Label>Difficulty Level *</Label>
              <CustomSelect value={formData.difficulty} onChange={(v) => setFormData(p => ({ ...p, difficulty: v }))} options={difficulties} placeholder="Select difficulty" />
            </div>

            <div className="space-y-2">
              <Label>Book</Label>
              <CustomSelect value={formData.book} onChange={(v) => setFormData(p => ({ ...p, book: v }))} options={books} placeholder="Select book" />
            </div>

            <div className="space-y-2">
              <Label>Question Paper Pattern</Label>
              <CustomSelect value={formData.questionPaperPattern} onChange={(v) => setFormData(p => ({ ...p, questionPaperPattern: v }))} options={patterns} placeholder="Select pattern" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>AI Model</Label>
              <CustomSelect value={formData.model} onChange={(v) => setFormData(p => ({ ...p, model: v }))} options={FREE_MODELS} placeholder="Select AI model" />
              <p className="text-xs text-muted-foreground">Free OpenRouter models. You can also add a custom model ID.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Chapters</Label>
              <div className="flex space-x-2">
                <Input value={newChapter} onChange={(e) => setNewChapter(e.target.value)} placeholder="Add chapter name" onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addChapter())} />
                <Button type="button" onClick={addChapter} size="icon" variant="outline"><Plus className="h-4 w-4" /></Button>
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
              <Label>Specific Topics to Focus</Label>
              <Input value={formData.specificTopics} onChange={(e) => setFormData(prev => ({ ...prev, specificTopics: e.target.value }))} placeholder="Enter specific topics (optional)" />
            </div>

            <div className="space-y-2">
              <Label>Syllabus PDF (Optional)</Label>
              {formData.syllabusFileName ? (
                <div className="flex items-center justify-between p-3 rounded-md border bg-muted/40">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4" />
                    <span className="truncate">{formData.syllabusFileName}</span>
                    <Badge variant="secondary">{Math.round((formData.syllabusPdfText?.length || 0) / 1000)}k chars</Badge>
                  </div>
                  <Button type="button" size="icon" variant="ghost" onClick={removePdf}><X className="h-4 w-4" /></Button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 p-4 rounded-md border-2 border-dashed cursor-pointer hover:bg-muted/40 transition-colors">
                  {pdfLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                  <span className="text-sm text-muted-foreground">
                    {pdfLoading ? "Reading PDF..." : "Upload syllabus PDF to base questions on it"}
                  </span>
                  <input type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} disabled={pdfLoading} />
                </label>
              )}
            </div>

            <div className="space-y-2">
              <Label>Additional Instructions</Label>
              <Textarea value={formData.additionalInstructions} onChange={(e) => setFormData(prev => ({ ...prev, additionalInstructions: e.target.value }))} placeholder="Any additional instructions for the question paper..." rows={3} />
            </div>
          </div>

          <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" disabled={isLoading}>
            {isLoading ? "Generating..." : (<><Sparkles className="h-4 w-4 mr-2" />Generate Question Paper</>)}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default QuestionForm;
