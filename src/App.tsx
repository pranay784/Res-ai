import React, { useState, useEffect, useRef } from "react";
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { 
  Send, 
  User, 
  Bot, 
  FileText, 
  Download, 
  Loader2, 
  Plus, 
  Trash2, 
  Github, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin,
  Sparkles
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { ResumeData, initialResumeData } from "./types";

const SYSTEM_INSTRUCTION = `
You are a world-class Resume Architect specializing in Data Science. Your goal is to help users build a high-impact resume following strict rules.

### CORE PRINCIPLES:
1. **Action-Oriented**: Every bullet point must start with a strong action verb (Developed, Designed, Optimized, etc.).
2. **Quantifiable**: Always push the user for numbers (%, $, time saved, accuracy improvement).
3. **Technical Precision**: Mention specific tools (Python, SQL, Scikit-Learn, etc.) in context.
4. **Business Impact**: Connect technical work to organizational goals (increased sales, improved retention).

### RESUME STRUCTURE RULES:

1. **Professional Summary (4 parts)**:
   - Part 1: Intro (Job title, years of experience, industry).
   - Part 2: Key Skills (Concise list of core tools/frameworks).
   - Part 3: Achievements (2-3 quantifiable points using formula: "Developed [method] to [achieve result]").
   - Part 4: Business Impact (1 sentence on driving strategic decisions).

2. **Technical Skills**: Categorize into:
   - Programming & Tools
   - Data Visualization
   - Machine Learning
   - Data Management
   - Statistical Analysis

3. **Professional Experience Bullet Points**:
   - Formula: Action Verb + Task Description + Tools/Methods + Result/Impact.
   - Length: 15-30 words per point.
   - Answer: What did you do? How did you do it? What was the result?

4. **Project Bullet Points**:
   - Answer: What was the goal? How did you approach it? What results/impact?
   - Formula: [Developed/Designed/Created] [model/solution] using [tools/methods], achieving [quantifiable result].

### YOUR BEHAVIOR:
- Be conversational but professional.
- Ask one section at a time (Contact -> Summary -> Skills -> Experience -> Education -> Projects -> Certifications).
- When the user provides info, draft the section following the rules and ask for feedback.
- If a user's input is weak (e.g., "I worked on a churn model"), ask follow-up questions to get the "How" (tools) and "Result" (metrics).
- **CRITICAL**: You must always return the updated resume data in the structured format provided in the response schema.

### EXAMPLE OF A GOOD BULLET POINT:
"Developed customer segmentation model using K-means clustering in Python, resulting in a 20% increase in targeted marketing efficiency."
`;

export default function App() {
  const [messages, setMessages] = useState<{ role: "user" | "bot"; content: string }[]>([
    { role: "bot", content: "Hello! I'm your Resume Architect. I'll help you build a high-impact Data Science resume following industry-standard rules. Let's start with your basic information. What is your full name, location, and contact details?" }
  ]);
  const [input, setInput] = useState("");
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...messages.map(m => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.content }] })),
          { role: "user", parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: { type: Type.STRING, description: "Your conversational response to the user." },
              updatedResume: {
                type: Type.OBJECT,
                properties: {
                  fullName: { type: Type.STRING },
                  location: { type: Type.STRING },
                  phone: { type: Type.STRING },
                  email: { type: Type.STRING },
                  linkedin: { type: Type.STRING },
                  github: { type: Type.STRING },
                  professionalSummary: { type: Type.ARRAY, items: { type: Type.STRING } },
                  technicalSkills: {
                    type: Type.OBJECT,
                    properties: {
                      programming: { type: Type.ARRAY, items: { type: Type.STRING } },
                      visualization: { type: Type.ARRAY, items: { type: Type.STRING } },
                      machineLearning: { type: Type.ARRAY, items: { type: Type.STRING } },
                      dataManagement: { type: Type.ARRAY, items: { type: Type.STRING } },
                      statisticalAnalysis: { type: Type.ARRAY, items: { type: Type.STRING } },
                    }
                  },
                  experience: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        company: { type: Type.STRING },
                        role: { type: Type.STRING },
                        location: { type: Type.STRING },
                        period: { type: Type.STRING },
                        bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                      }
                    }
                  },
                  education: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        degree: { type: Type.STRING },
                        university: { type: Type.STRING },
                        location: { type: Type.STRING },
                        graduationYear: { type: Type.STRING },
                        coursework: { type: Type.ARRAY, items: { type: Type.STRING } },
                      }
                    }
                  },
                  projects: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                      }
                    }
                  },
                  certifications: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        organization: { type: Type.STRING },
                        year: { type: Type.STRING },
                      }
                    }
                  }
                }
              }
            },
            required: ["reply", "updatedResume"]
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      setMessages(prev => [...prev, { role: "bot", content: result.reply }]);
      if (result.updatedResume) {
        setResumeData(result.updatedResume);
      }
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: "bot", content: "I'm sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans">
      {/* Left: Chat Interface */}
      <div className="w-1/2 flex flex-col border-r border-[#E5E5E5] bg-white">
        <header className="p-6 border-bottom border-[#E5E5E5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1A1A1A] rounded-full flex items-center justify-center text-white">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Resume Architect</h1>
              <p className="text-xs text-[#666] uppercase tracking-widest font-medium">Data Science Edition</p>
            </div>
          </div>
        </header>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-4 max-w-[85%]",
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  msg.role === "user" ? "bg-[#F2F2F2]" : "bg-[#1A1A1A] text-white"
                )}>
                  {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed",
                  msg.role === "user" ? "bg-[#F2F2F2] text-[#1A1A1A]" : "bg-white border border-[#E5E5E5] shadow-sm"
                )}>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isTyping && (
            <div className="flex gap-4 items-center text-[#666] text-sm animate-pulse">
              <div className="w-8 h-8 bg-[#1A1A1A] rounded-full flex items-center justify-center text-white">
                <Loader2 className="animate-spin" size={16} />
              </div>
              Architect is thinking...
            </div>
          )}
        </div>

        <div className="p-6 border-t border-[#E5E5E5]">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your response..."
              className="w-full pl-4 pr-12 py-3 bg-[#F9F9F9] border border-[#E5E5E5] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/10 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={isTyping || !input.trim()}
              className="absolute right-2 p-2 bg-[#1A1A1A] text-white rounded-full hover:bg-black disabled:opacity-50 transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Right: Resume Preview */}
      <div className="w-1/2 bg-[#F5F5F5] overflow-y-auto p-12 flex justify-center">
        <div className="w-full max-w-[800px] bg-white shadow-2xl min-h-[1056px] p-12 font-serif text-[#1A1A1A] relative">
          {/* Header */}
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-3xl font-bold tracking-tight uppercase">{resumeData.fullName}</h2>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-[#444] font-sans font-medium">
              <span className="flex items-center gap-1"><MapPin size={12} /> {resumeData.location}</span>
              <span className="flex items-center gap-1"><Phone size={12} /> {resumeData.phone}</span>
              <span className="flex items-center gap-1"><Mail size={12} /> {resumeData.email}</span>
              <span className="flex items-center gap-1"><Linkedin size={12} /> {resumeData.linkedin}</span>
              <span className="flex items-center gap-1"><Github size={12} /> {resumeData.github}</span>
            </div>
          </div>

          <div className="space-y-8">
            {/* Professional Summary */}
            {resumeData.professionalSummary.length > 0 && (
              <section>
                <h3 className="text-sm font-sans font-bold uppercase tracking-widest border-b border-[#1A1A1A] pb-1 mb-3">Professional Summary</h3>
                <div className="text-sm leading-relaxed space-y-2">
                  {resumeData.professionalSummary.map((point, i) => (
                    <p key={i}>{point}</p>
                  ))}
                </div>
              </section>
            )}

            {/* Technical Skills */}
            {(Object.values(resumeData.technicalSkills).some(arr => arr.length > 0)) && (
              <section>
                <h3 className="text-sm font-sans font-bold uppercase tracking-widest border-b border-[#1A1A1A] pb-1 mb-3">Technical Skills</h3>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  {Object.entries(resumeData.technicalSkills).map(([key, skills]) => (
                    skills.length > 0 && (
                      <div key={key} className="flex gap-2">
                        <span className="font-bold min-w-[160px] capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="text-[#444]">{skills.join(", ")}</span>
                      </div>
                    )
                  ))}
                </div>
              </section>
            )}

            {/* Experience */}
            {resumeData.experience.length > 0 && (
              <section>
                <h3 className="text-sm font-sans font-bold uppercase tracking-widest border-b border-[#1A1A1A] pb-1 mb-3">Professional Experience</h3>
                <div className="space-y-6">
                  {resumeData.experience.map((exp, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-baseline">
                        <h4 className="font-bold text-base">{exp.role}</h4>
                        <span className="text-xs font-sans font-medium">{exp.period}</span>
                      </div>
                      <div className="flex justify-between items-baseline text-sm italic text-[#444]">
                        <span>{exp.company}</span>
                        <span>{exp.location}</span>
                      </div>
                      <ul className="list-disc list-outside ml-4 space-y-1 text-sm leading-relaxed">
                        {exp.bullets.map((bullet, j) => (
                          <li key={j}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Projects */}
            {resumeData.projects.length > 0 && (
              <section>
                <h3 className="text-sm font-sans font-bold uppercase tracking-widest border-b border-[#1A1A1A] pb-1 mb-3">Projects</h3>
                <div className="space-y-4">
                  {resumeData.projects.map((proj, i) => (
                    <div key={i} className="space-y-1">
                      <h4 className="font-bold text-sm">{proj.title}</h4>
                      <ul className="list-disc list-outside ml-4 space-y-1 text-sm leading-relaxed">
                        {proj.bullets.map((bullet, j) => (
                          <li key={j}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {resumeData.education.length > 0 && (
              <section>
                <h3 className="text-sm font-sans font-bold uppercase tracking-widest border-b border-[#1A1A1A] pb-1 mb-3">Education</h3>
                <div className="space-y-4">
                  {resumeData.education.map((edu, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-baseline">
                        <h4 className="font-bold text-sm">{edu.degree}</h4>
                        <span className="text-xs font-sans font-medium">{edu.graduationYear}</span>
                      </div>
                      <div className="flex justify-between items-baseline text-sm italic text-[#444]">
                        <span>{edu.university}</span>
                        <span>{edu.location}</span>
                      </div>
                      {edu.coursework.length > 0 && (
                        <p className="text-xs text-[#666]"><span className="font-bold">Relevant Coursework:</span> {edu.coursework.join(", ")}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications */}
            {resumeData.certifications.length > 0 && (
              <section>
                <h3 className="text-sm font-sans font-bold uppercase tracking-widest border-b border-[#1A1A1A] pb-1 mb-3">Certifications</h3>
                <ul className="list-disc list-outside ml-4 space-y-1 text-sm">
                  {resumeData.certifications.map((cert, i) => (
                    <li key={i}>
                      <span className="font-bold">{cert.name}</span>, {cert.organization} — {cert.year}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Watermark */}
          <div className="absolute bottom-4 right-4 text-[10px] text-[#CCC] font-sans uppercase tracking-widest">
            Built with Resume Architect AI
          </div>
        </div>
      </div>
    </div>
  );
}
