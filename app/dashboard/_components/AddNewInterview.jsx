"use client";
import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { chatSession } from "@/utils/GeminiAIModal";
import { LoaderCircle, Sparkles } from "lucide-react";
import { MockInterview } from "@/utils/schema";
import { v4 as uuidv4 } from 'uuid';
import { db } from "@/utils/db";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Job Role Suggestions
const JOB_ROLE_SUGGESTIONS = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Software Engineer',
  'DevOps Engineer',
  'Data Scientist',
  'Machine Learning Engineer',
  'Cloud Engineer',
  'Mobile App Developer',
  'UI/UX Designer'
];

// Tech Stack Suggestions
const TECH_STACK_SUGGESTIONS = {
  'Full Stack Developer': 'React, Node.js, Express, MongoDB, TypeScript',
  'Frontend Developer': 'React, Vue.js, Angular, TypeScript, Tailwind CSS',
  'Backend Developer': 'Python, Django, Flask, Java Spring, PostgreSQL',
  'Software Engineer': 'Java, C++, Python, AWS, Microservices',
  'DevOps Engineer': 'Docker, Kubernetes, Jenkins, AWS, Azure',
  'Data Scientist': 'Python, TensorFlow, PyTorch, Pandas, NumPy',
  'Machine Learning Engineer': 'Python, scikit-learn, Keras, TensorFlow',
  'Cloud Engineer': 'AWS, Azure, GCP, Terraform, Kubernetes',
  'Mobile App Developer': 'React Native, Flutter, Swift, Kotlin',
  'UI/UX Designer': 'Figma, Sketch, Adobe XD, InVision'
};

function AddNewInterview() {
  const [openDialog, setOpenDialog] = useState(false);
  const [jobPosition, setJobPosition] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobExperience, setJobExperience] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  // Auto-suggest tech stack based on job role
  const autoSuggestTechStack = (role) => {
    const suggestion = TECH_STACK_SUGGESTIONS[role];
    if (suggestion) {
      setJobDescription(suggestion);
      toast.info(`Auto-filled tech stack for ${role}`);
    }
  };

  const safeParseJSON = (str) => {
    try {
      return JSON.parse(str);
    } catch (err) {
      // Recovery 1: Truncated JSON array repair
      const lastObjectEnd = str.lastIndexOf('}');
      if (lastObjectEnd !== -1) {
        const trimmed = str.slice(0, lastObjectEnd + 1);
        const arrayStart = trimmed.indexOf('[');
        if (arrayStart !== -1) {
          try {
            return JSON.parse(trimmed.slice(arrayStart) + ']');
          } catch (e2) {}
        }
      }
      // Recovery 2: Sanitize unescaped control characters
      try {
        const sanitized = str.replace(/[\u0000-\u001F\u007F-\u009F]/g, " ");
        return JSON.parse(sanitized);
      } catch (e3) {}

      throw err;
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const inputPrompt = `Job position: ${jobPosition}, Job Description: ${jobDescription}, Years of Experience: ${jobExperience}, Target Difficulty Level: ${difficulty}.
    Generate exactly ${questionCount} interview questions and ideal answers in JSON format as a JSON array of objects with "question" and "answer" fields.
    Format:
    [
      {
        "question": "Clear, direct technical question here",
        "answer": "Concise, high-impact model answer (3-5 key sentences, strictly under 120 words)"
      }
    ]
    Requirements:
    - Target difficulty level is strictly "${difficulty}".
    - If Easy: focus on fundamentals, core syntax, definitions, and essential concepts.
    - If Medium: focus on practical implementation, debugging, state management, common patterns, and problem solving.
    - If Hard: focus on deep architectural internals, concurrency, performance trade-offs, scalability, and complex system design scenarios.
    - Questions must realistically assess candidates with ${jobExperience} years of experience.
    - Keep each "answer" concise, focused on core technical points (under 120 words) so it remains punchy and readable.
    - Return ONLY the JSON array.`;
  
    try {
      const result = await chatSession.sendMessage(inputPrompt);
      const responseText = await result.response.text();
      
      const cleaned = responseText.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1').trim();
      const match = cleaned.match(/\[[\s\S]*\]/) || cleaned.match(/\{[\s\S]*\}/);
      const jsonString = match ? match[0] : cleaned;
      
      const parsedResp = safeParseJSON(jsonString);
      const mockResponse = Array.isArray(parsedResp)
        ? parsedResp
        : (parsedResp?.interview_questions || parsedResp?.questions || parsedResp?.interviewQuestions || Object.values(parsedResp || {}).find(Array.isArray) || []);
      
      const res = await db.insert(MockInterview)
        .values({
          mockId: uuidv4(),
          jsonMockResp: JSON.stringify(mockResponse),
          jobPosition: jobPosition,
          jobDesc: jobDescription,
          jobExperience: jobExperience,
          difficulty: difficulty,
          questionCount: String(mockResponse.length || questionCount),
          createdBy: user?.primaryEmailAddress?.emailAddress,
          createdAt: moment().format('DD-MM-YYYY'),
        }).returning({ mockId: MockInterview.mockId });
      
      toast.success('Interview questions generated successfully!');
      router.push(`dashboard/interview/${res[0]?.mockId}`);
    } catch (error) {
      console.error("Error generating interview:", error);
      toast.error('Failed to generate interview questions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div
        className="p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all"
        onClick={() => setOpenDialog(true)}
      >
        <h1 className="font-bold text-lg text-center">+ Add New</h1>
      </div>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-bold text-2xl">
              Create Your Interview Preparation
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <form onSubmit={onSubmit}>
              <div>
                <div className="mt-7 my-3">
                  <label>Job Role/Position</label>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Ex. Full Stack Developer"
                      value={jobPosition}
                      required
                      onChange={(e) => setJobPosition(e.target.value)}
                      list="jobRoles"
                    />
                    <datalist id="jobRoles">
                      {JOB_ROLE_SUGGESTIONS.map(role => (
                        <option key={role} value={role} />
                      ))}
                    </datalist>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => autoSuggestTechStack(jobPosition)}
                      disabled={!jobPosition}
                    >
                      <Sparkles className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="my-3">
                  <label>Job Description/Tech Stack</label>
                  <Textarea
                    placeholder="Ex. React, Angular, NodeJs, MySql etc"
                    value={jobDescription}
                    required
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>
                <div className="my-3">
                  <label className="block text-sm font-medium mb-1">Years of Experience</label>
                  <Input
                    placeholder="Ex. 5"
                    type="number"
                    min="0"
                    max="70"
                    value={jobExperience}
                    required
                    onChange={(e) => setJobExperience(e.target.value)}
                  />
                </div>

                {/* Difficulty Selector */}
                <div className="my-3">
                  <label className="block text-sm font-medium mb-1">Interview Difficulty</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { level: "Easy", desc: "Junior / Basics", color: "hover:border-green-500" },
                      { level: "Medium", desc: "Mid / Core Skills", color: "hover:border-blue-500" },
                      { level: "Hard", desc: "Senior / Deep Dive", color: "hover:border-purple-500" },
                    ].map(({ level, desc, color }) => (
                      <button
                        type="button"
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`p-2.5 rounded-lg border text-left transition-all ${color} ${
                          difficulty === level
                            ? "border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/30"
                            : "border-gray-200 hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <div className="font-semibold text-sm">{level}</div>
                        <div className="text-[11px] text-gray-500">{desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Number of Questions */}
                <div className="my-3">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium">Number of Questions</label>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                      {questionCount} Questions
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5 flex-1">
                      {[3, 5, 7, 10].map((num) => (
                        <button
                          type="button"
                          key={num}
                          onClick={() => setQuestionCount(num)}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-md border transition-all ${
                            questionCount === num
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {num} Qs
                        </button>
                      ))}
                    </div>
                    <Input
                      type="number"
                      min="1"
                      max="15"
                      value={questionCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) setQuestionCount(Math.min(15, Math.max(1, val)));
                      }}
                      className="w-20 text-center"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-5 justify-end">
                <Button type="button" variant="ghost" onClick={() => setOpenDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <LoaderCircle className="animate-spin mr-2" /> Generating
                    </>
                  ) : (
                    'Start Interview'
                  )}
                </Button>
              </div>
            </form>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewInterview;