"use client";
import { db } from '@/utils/db';
import { UserAnswer, MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import React, { useEffect, useState, useMemo } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  CheckCircle2, 
  XCircle, 
  ChevronsUpDown, 
  Activity, 
  Target,
  Lightbulb,
  Sparkles,
  BookOpen,
  ThumbsUp,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  Award
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const Feedback = ({ params }) => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [interviewData, setInterviewData] = useState(null);
  const [averageRating, setAverageRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    GetFeedback();
  }, []);

  const parseFeedbackDetails = (rawFeedback) => {
    if (!rawFeedback) return { summary: "", strengths: [], areasToImprove: [], howToAnswer: "", focusAreas: [] };
    try {
      const parsed = typeof rawFeedback === 'string' ? JSON.parse(rawFeedback) : rawFeedback;
      if (typeof parsed === 'object' && parsed !== null) {
        return {
          summary: parsed.feedback || parsed.summary || "",
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
          areasToImprove: Array.isArray(parsed.areasToImprove) 
            ? parsed.areasToImprove 
            : (Array.isArray(parsed.improvements) ? parsed.improvements : []),
          howToAnswer: parsed.howToAnswer || parsed.suggestion || "",
          focusAreas: Array.isArray(parsed.focusAreas) ? parsed.focusAreas : []
        };
      }
    } catch (e) {
      // Fallback for legacy plain text feedback
    }
    return {
      summary: String(rawFeedback),
      strengths: [],
      areasToImprove: [],
      howToAnswer: "",
      focusAreas: []
    };
  };

  const GetFeedback = async () => {
    setLoading(true);
    try {
      // Fetch user answers
      const result = await db.select()
        .from(UserAnswer)
        .where(eq(UserAnswer.mockIdRef, params.interviewId))
        .orderBy(UserAnswer.id);

      setFeedbackList(result);

      // Fetch interview metadata (role, difficulty, etc.)
      const interviewMeta = await db.select()
        .from(MockInterview)
        .where(eq(MockInterview.mockId, params.interviewId));
      if (interviewMeta.length > 0) {
        setInterviewData(interviewMeta[0]);
      }

      // Calculate the average rating dynamically
      const validRatings = result
        .map((item) => parseFloat(item.rating))
        .filter((rating) => !isNaN(rating));

      const totalRating = validRatings.reduce((sum, rating) => sum + rating, 0);
      const avgRating = validRatings.length > 0 
        ? (totalRating / validRatings.length).toFixed(1) 
        : "N/A";

      setAverageRating(avgRating);
    } catch (err) {
      console.error("Error fetching feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  // Aggregate all unique focus areas across answers
  const allFocusAreas = useMemo(() => {
    const set = new Set();
    feedbackList.forEach(item => {
      const parsed = parseFeedbackDetails(item.feedback);
      parsed.focusAreas.forEach(area => set.add(area));
    });
    return Array.from(set);
  }, [feedbackList]);

  const getRatingColor = (rating) => {
    const numRating = parseFloat(rating);
    if (numRating >= 8) return "text-green-600";
    if (numRating >= 6) return "text-blue-600";
    if (numRating >= 4) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceBadge = (rating) => {
    const num = parseFloat(rating);
    if (isNaN(num)) return { label: "Completed", color: "bg-gray-100 text-gray-700" };
    if (num >= 8) return { label: "Outstanding — Placement Ready", color: "bg-green-100 text-green-800 border-green-300" };
    if (num >= 6) return { label: "Competent — Minor Polish Needed", color: "bg-blue-100 text-blue-800 border-blue-300" };
    if (num >= 4) return { label: "Developing — Needs Practice", color: "bg-yellow-100 text-yellow-800 border-yellow-300" };
    return { label: "Needs Preparation — Review Fundamentals", color: "bg-red-100 text-red-800 border-red-300" };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="mx-auto h-12 w-12 text-indigo-600 animate-pulse" />
          <p className="mt-4 text-gray-600">Analyzing your interview performance and generating coaching report...</p>
        </div>
      </div>
    );
  }

  const performance = getPerformanceBadge(averageRating);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {feedbackList.length === 0 ? (
        <Card className="max-w-md mx-auto shadow-sm">
          <CardHeader className="text-center">
            <XCircle className="mx-auto h-16 w-16 text-red-500" />
            <h2 className="text-2xl font-bold text-gray-800 mt-4">
              No Interview Feedback Available
            </h2>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              It seems like no answers have been recorded yet for this interview session.
            </p>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => router.push(`/dashboard/interview/${params.interviewId}/start`)}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                Start Answering Now
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.replace('/dashboard')}
                className="w-full"
              >
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Top Performance Overview Banner */}
          <div className="mb-8">
            <Card className="border-0 shadow-md bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 text-white overflow-hidden relative">
              <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-10 pointer-events-none">
                <Award size={320} />
              </div>
              <CardContent className="p-6 md:p-8 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-700/80 font-semibold text-indigo-200">
                        {interviewData?.difficulty || 'Medium'} Level Interview
                      </span>
                      <span className="text-xs uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-700/80 font-semibold text-indigo-200">
                        {interviewData?.jobPosition || 'Role Prep'}
                      </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                      Interview Performance Report
                    </h1>
                    <p className="text-indigo-200 mt-1 max-w-xl text-sm md:text-base">
                      Review your question-by-question breakdown, personalized feedback, coaching suggestions, and key technical focus areas.
                    </p>
                  </div>

                  {/* Score Box */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center min-w-[200px]">
                    <span className="text-xs uppercase tracking-wider font-medium text-indigo-200">
                      Overall Score
                    </span>
                    <div className="text-4xl md:text-5xl font-black my-1 text-white">
                      {averageRating ? averageRating : 'N/A'}
                      <span className="text-xl text-indigo-300 font-semibold">/10</span>
                    </div>
                    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${performance.color}`}>
                      {performance.label}
                    </span>
                  </div>
                </div>

                {/* Quick stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-indigo-700/60">
                  <div>
                    <span className="text-xs text-indigo-300 block">Total Questions</span>
                    <span className="text-xl font-bold text-white">{feedbackList.length}</span>
                  </div>
                  <div>
                    <span className="text-xs text-indigo-300 block">Target Experience</span>
                    <span className="text-xl font-bold text-white">{interviewData?.jobExperience || 0} Years</span>
                  </div>
                  <div>
                    <span className="text-xs text-indigo-300 block">Interview Difficulty</span>
                    <span className="text-xl font-bold text-white">{interviewData?.difficulty || 'Medium'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-indigo-300 block">Focus Topics Identified</span>
                    <span className="text-xl font-bold text-white">{allFocusAreas.length || 'Ready'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actionable Coaching & Focus Areas Card */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Where to Focus Card */}
            <Card className="border border-indigo-100 shadow-sm bg-white">
              <CardHeader className="pb-3 flex flex-row items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-gray-800 text-lg">Where to Focus Your Revision</h3>
              </CardHeader>
              <CardContent>
                {allFocusAreas.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {allFocusAreas.map((topic, i) => (
                      <span
                        key={i}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200"
                      >
                        📌 {topic}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    Target your preparation on the core technologies in your job stack: <strong>{interviewData?.jobDesc || 'Frontend, Backend, and System Design'}</strong>.
                  </p>
                )}
                <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Focus on explaining the <strong>underlying mechanics</strong> and <strong>architectural trade-offs</strong> rather than just definitions.
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* How to Answer Card (Winning Strategy) */}
            <Card className="border border-indigo-100 shadow-sm bg-white">
              <CardHeader className="pb-3 flex flex-row items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-gray-800 text-lg">How to Structure Your Answers</h3>
              </CardHeader>
              <CardContent className="space-y-2.5 text-xs text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded text-[10px]">1</span>
                  <p><strong>Bottom-Line Up Front:</strong> Start with a sharp, 1-sentence technical definition or direct answer before diving into details.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded text-[10px]">2</span>
                  <p><strong>Practical Scenario:</strong> Share a brief real-world example from your projects demonstrating how you applied the concept.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded text-[10px]">3</span>
                  <p><strong>Trade-offs & Edge Cases:</strong> Mention when NOT to use the approach, runtime complexity, or performance implications.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Question-by-Question Breakdown */}
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Question-by-Question Coaching Analysis
                </h2>
                <p className="text-sm text-gray-500">
                  Click any question to view your transcribed answer, ideal response, detailed feedback, and how to improve.
                </p>
              </div>
            </div>

            {feedbackList.map((item, index) => {
              const details = parseFeedbackDetails(item.feedback);
              const scoreNum = parseFloat(item.rating);

              return (
                <Collapsible 
                  key={index} 
                  defaultOpen={index === 0} 
                  className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white transition-all hover:border-indigo-300"
                >
                  <CollapsibleTrigger className="w-full text-left">
                    <div className="flex items-center justify-between p-4 md:p-5 bg-gray-50 hover:bg-gray-100/80 transition-colors">
                      <div className="flex items-center gap-3 pr-4">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                          #{index + 1}
                        </span>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm md:text-base line-clamp-1">
                            {item.question}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {details.focusAreas?.length > 0 ? details.focusAreas.join(" • ") : "Technical Evaluation"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-sm md:text-base font-extrabold px-3 py-1 rounded-full border ${
                          scoreNum >= 8 
                            ? "bg-green-50 text-green-700 border-green-200" 
                            : scoreNum >= 6 
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : scoreNum >= 4 
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200" 
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}>
                          {item.rating}/10
                        </span>
                        <ChevronsUpDown className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="p-5 md:p-6 space-y-5 border-t border-gray-100">
                    {/* Answers Comparison Grid */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* User's Answer */}
                      <div className="bg-red-50/60 p-4 rounded-xl border border-red-200 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-red-700 uppercase tracking-wider">
                              Your Answer
                            </span>
                            <span className="text-[11px] text-red-500 font-medium">Spoken Audio Transcribed</span>
                          </div>
                          <p className="text-sm text-gray-800 italic leading-relaxed whitespace-pre-line">
                            "{item.userAns?.trim() || "No answer was recorded for this question."}"
                          </p>
                        </div>
                      </div>

                      {/* Correct / Ideal Answer */}
                      <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                              Ideal Model Answer
                            </span>
                            <span className="text-[11px] text-emerald-600 font-medium">Recommended Standard</span>
                          </div>
                          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                            {item.correctAns}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* AI Assessment Summary */}
                    {details.summary && (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Sparkles className="h-4 w-4 text-indigo-600" />
                          <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                            AI Evaluation Summary
                          </h5>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {details.summary}
                        </p>
                      </div>
                    )}

                    {/* Strengths & Areas to Improve Grid */}
                    {(details.strengths?.length > 0 || details.areasToImprove?.length > 0) && (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {/* Strengths */}
                        {details.strengths?.length > 0 && (
                          <div className="bg-green-50/70 p-4 rounded-xl border border-green-200">
                            <div className="flex items-center gap-2 mb-2 text-green-800 font-bold text-xs uppercase tracking-wider">
                              <ThumbsUp className="h-4 w-4 text-green-600" />
                              What You Did Well
                            </div>
                            <ul className="space-y-1.5 text-xs text-green-900">
                              {details.strengths.map((str, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span className="text-green-600 font-bold">✓</span>
                                  <span>{str}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Areas to Improve */}
                        {details.areasToImprove?.length > 0 && (
                          <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200">
                            <div className="flex items-center gap-2 mb-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                              <AlertTriangle className="h-4 w-4 text-amber-600" />
                              What You Missed / Where to Focus
                            </div>
                            <ul className="space-y-1.5 text-xs text-amber-900">
                              {details.areasToImprove.map((area, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span className="text-amber-600 font-bold">•</span>
                                  <span>{area}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* How to Answer Coaching Callout */}
                    {details.howToAnswer && (
                      <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-200">
                        <div className="flex items-center gap-2 mb-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
                          <Target className="h-4 w-4 text-indigo-600" />
                          How to Answer This Question (Winning Strategy)
                        </div>
                        <p className="text-xs md:text-sm text-indigo-950 leading-relaxed whitespace-pre-line">
                          {details.howToAnswer}
                        </p>
                      </div>
                    )}

                    {/* Focus Topics for this Question */}
                    {details.focusAreas?.length > 0 && (
                      <div className="flex items-center gap-2 pt-2">
                        <span className="text-xs text-gray-500 font-medium">Related Topics:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {details.focusAreas.map((topic, idx) => (
                            <span 
                              key={idx} 
                              className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium border border-gray-200"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>

          {/* Bottom Action Footer */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-10 pt-6 border-t border-gray-200">
            <Button 
              variant="outline"
              onClick={() => router.push(`/dashboard/interview/${params.interviewId}`)}
              className="w-full sm:w-auto flex items-center gap-2 border-indigo-200 hover:bg-indigo-50 text-indigo-700"
            >
              <RotateCcw className="h-4 w-4" />
              Retake This Interview
            </Button>
            <Button 
              onClick={() => router.replace('/dashboard')}
              className="w-full sm:w-auto flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
            >
              Return to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Feedback;
