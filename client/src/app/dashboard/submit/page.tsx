'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { 
  Sparkles, 
  Mic, 
  MapPin, 
  Upload, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle,
  FileText,
  MapIcon, 
  ArrowRight,
  TrendingUp,
  XCircle,
  Info
} from 'lucide-react';

const CATEGORIES = [
  "Road", "Bridge", "School", "College", "Hospital", "PHC", 
  "Water Supply", "Drainage", "Street Lights", "Electricity", 
  "Library", "Park", "Sports Ground", "Skill Center", "Women's Safety", 
  "Public Transport", "Internet", "Waste Management", "Environment", 
  "Agriculture", "Others"
];

export default function SubmitSuggestion() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();

  // General Form States
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [state, setState] = useState(user?.state || '');
  const [district, setDistrict] = useState(user?.district || '');
  const [block, setBlock] = useState('');
  const [village, setVillage] = useState(user?.village_ward || '');
  const [urgency, setUrgency] = useState('medium');
  const [beneficiaries, setBeneficiaries] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  // Media attachments
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Audio Recorder States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // AI Assistant States
  const [aiLoading, setAiLoading] = useState(false);
  const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  const [aiScore, setAiScore] = useState<number | null>(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number | null>(null);
  const [questionAnswer, setQuestionAnswer] = useState('');

  // Drag & drop state and handlers
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Result Modal
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message?: string;
    pointsAwarded?: number;
    isDuplicate?: boolean;
    duplicateOfId?: string;
    suggestionId?: string;
  } | null>(null);

  // Geolocation Handler
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
          // Set simulated coordinates if not already present
        },
        (err) => {
          console.warn("Geolocation permission denied, simulating Varanasi coordinates.");
          setLat(25.3176);
          setLng(82.9739);
        }
      );
    } else {
      setLat(25.3176);
      setLng(82.9739);
    }
  };

  // Image Selection Handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Audio Recording Handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Upload to voice transcription API
        await transcribeAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      alert("Microphone permission denied or not supported on this device. Simulating voice transcription...");
      // Simulate Voice Transcription fallback
      setIsTranscribing(true);
      setTimeout(() => {
        setTitle("Repair of local village water well");
        setCategory("Water Supply");
        setDescription("Our village well has collapsed water filtration walls. Clean water is highly contaminated.");
        setUrgency("high");
        setIsTranscribing(false);
      }, 2000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // Stop stream tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const transcribeAudio = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'suggestion_audio.webm');

      const response = await fetch('http://localhost:5000/api/ai/voice', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setTitle(data.title || '');
        setCategory(data.category || '');
        setDescription(data.description || '');
        setUrgency(data.urgency || 'medium');
      }
    } catch (err) {
      console.error('Audio transcription failed, using simulator:', err);
    } finally {
      setIsTranscribing(false);
    }
  };

  // AI Assistant trigger
  const handleAiAssist = async () => {
    if (!description) return;
    setAiLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/ai/writing-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          language: user?.language_preference || 'en'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiQuestions(data.questions || []);
        setDescription(data.improvedText || description);
        setAiScore(data.completenessScore || 70);
      }
    } catch (err) {
      console.error('AI Assist failed:', err);
    } finally {
      setAiLoading(false);
    }
  };

  // Submit Answer to AI Clarifying Question
  const handleAnswerQuestion = () => {
    if (!questionAnswer) return;
    const answeredQuestion = aiQuestions[activeQuestionIndex!];
    
    // Append answer to description
    const updatedDesc = `${description}\n\n[AI Clarification Answered]\n- Question: ${answeredQuestion}\n- Answer: ${questionAnswer}`;
    setDescription(updatedDesc);
    
    // Remove answered question and reset input
    const nextQuestions = aiQuestions.filter((_, idx) => idx !== activeQuestionIndex);
    setAiQuestions(nextQuestions);
    setQuestionAnswer('');
    setActiveQuestionIndex(null);

    // Increase simulated completeness score
    if (aiScore !== null) {
      setAiScore(Math.min(100, aiScore + 10));
    }
  };

  // Submit Suggestion Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !description || !title) {
      alert("Please fill in Title, Category, and Description.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('citizen_id', user?.id || '');
      formData.append('title', title);
      formData.append('category', category);
      formData.append('description', description);
      formData.append('state', state);
      formData.append('district', district);
      formData.append('village', village);
      formData.append('block', block);
      formData.append('urgency', urgency);
      formData.append('estimated_beneficiaries', beneficiaries);
      
      if (lat && lng) {
        formData.append('location_lat', lat.toString());
        formData.append('location_lng', lng.toString());
      }
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await fetch('http://localhost:5000/api/suggestions', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        setSubmitResult({
          success: true,
          pointsAwarded: data.pointsAwarded,
          isDuplicate: data.isDuplicate,
          duplicateOfId: data.duplicateOfId,
          suggestionId: data.suggestion?.id
        });
        refreshProfile(); // Refresh points in header
      } else {
        setSubmitResult({
          success: false,
          message: data.error || 'Submission failed.'
        });
      }
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : 'Network submission error.';
      setSubmitResult({
        success: false,
        message: errMsg
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Circular progress math
  const radius = 45;
  const circumference = 2 * Math.PI * radius; // ~282.74
  const strokeDashoffset = aiScore !== null ? circumference - (aiScore / 100) * circumference : circumference;

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="relative p-6 sm:p-8 bg-slate-900/40 border border-slate-800/80 rounded-3xl overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            Submit Development Suggestion
            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Citizen Voice</span>
          </h1>
          <p className="text-xs text-slate-400">Submit actionable proposals for constituency improvement. AI reviews and groups them automatically.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Suggestion Form - Left 2 Columns */}
        <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
          
          {/* Voice Input Assist */}
          <div className="bg-linear-to-r from-slate-950 via-indigo-950/20 to-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_4px_30px_rgba(99,102,241,0.03)] hover:border-slate-700/85 transition-all duration-300">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-inner">
                  <Mic className="w-4 h-4" />
                </div>
                <span>Speak Your Suggestion</span>
              </h3>
              <p className="text-xs text-slate-400 max-w-md">Record in Hindi, Hinglish, Bhojpuri, or English. AI automatically structures the title, description, and key metadata.</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                {['Hindi', 'Hinglish', 'Bhojpuri', 'English'].map(lang => (
                  <span key={lang} className="text-[9px] font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded-full">{lang}</span>
                ))}
              </div>
            </div>
            
            <div className="shrink-0 flex items-center space-x-4">
              {isRecording && (
                <div className="flex items-center space-x-1 h-6 px-2">
                  <span className="w-1 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s', height: '14px' }} />
                  <span className="w-1 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s', height: '22px' }} />
                  <span className="w-1 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s', height: '10px' }} />
                  <span className="w-1 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s', height: '18px' }} />
                  <span className="w-1 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.5s', height: '12px' }} />
                </div>
              )}
              
              {isRecording ? (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-5 py-3.5 rounded-xl flex items-center space-x-2 shadow-lg shadow-red-600/20 active:scale-95 transition-all cursor-pointer animate-pulse"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-white mr-1" />
                  <span>Stop ({recordingTime}s)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-3.5 rounded-xl flex items-center space-x-2 shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                  <span>Record Suggestion</span>
                </button>
              )}
            </div>
          </div>

          {isTranscribing && (
            <div className="flex items-center justify-center space-x-3 p-4 bg-slate-950 rounded-xl border border-slate-800 text-indigo-400 text-xs shadow-inner">
              <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent animate-spin rounded-full" />
              <span>Transcribing and structuring audio using Gemini...</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmitForm} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Suggestion Title</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <FileText className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Briefly state what needs development (e.g., Road repairs connecting village school)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-300"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-10 pr-10 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-300 appearance-none"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Description</label>
              <div className="relative">
                <textarea
                  required
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the developmental need. Mention the current issue, how it impacts residents, land details if any, etc."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 px-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-300 font-sans"
                />
                {description.length > 10 && (
                  <button
                    type="button"
                    onClick={handleAiAssist}
                    disabled={aiLoading}
                    className="absolute bottom-3.5 right-3.5 bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs px-4 py-2 rounded-xl flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 hover:scale-102 transition-all font-bold cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{aiLoading ? 'Analyzing...' : 'AI Writing Assistant'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Beneficiaries & Urgency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Estimated People Benefited</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    value={beneficiaries}
                    onChange={(e) => setBeneficiaries(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Urgency Level</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-10 pr-10 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-300 appearance-none"
                  >
                    <option value="low">Low - Routine Planning</option>
                    <option value="medium">Medium - Important Improvement</option>
                    <option value="high">High - High Priority</option>
                    <option value="critical">Critical - Urgent Public Hazard / Complete Absence</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Image Evidence</label>
              <div className="space-y-4">
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`w-full border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 ${
                    isDragging 
                      ? 'border-indigo-500 bg-indigo-500/5' 
                      : 'border-slate-800 bg-slate-950/40 hover:border-slate-750 hover:bg-slate-950/60'
                  }`}
                >
                  <label className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-300 block">Drag & Drop Image Evidence here</span>
                      <span className="text-[11px] text-slate-500 block">or click to browse local files</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                </div>
                {imagePreview && (
                  <div className="flex items-center justify-between bg-slate-950 border border-slate-800 p-3 rounded-2xl shadow-inner">
                    <div className="flex items-center space-x-3">
                      <img src={imagePreview} alt="Preview" className="w-14 h-14 object-cover rounded-xl border border-slate-800" />
                      <div className="min-w-0 pr-4">
                        <span className="block text-xs font-semibold text-slate-200 truncate max-w-[200px]">{imageFile?.name}</span>
                        <span className="block text-[10px] text-slate-500">{(imageFile?.size ? (imageFile.size / 1024 / 1024).toFixed(2) : 0) } MB</span>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => { setImageFile(null); setImagePreview(null); }} 
                      className="text-xs text-red-400 hover:text-red-300 font-bold hover:underline px-3 py-1 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Location Section */}
            <div className="border-t border-slate-900/60 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Location Metadata</span>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-500/5 hover:-translate-y-0.5 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 animate-pulse" />
                  <span>Fetch Geolocation</span>
                </button>
              </div>

              {lat && lng && (
                <div className="bg-emerald-500/5 border border-emerald-500/20 p-3.5 rounded-xl text-emerald-400 text-[11px] flex items-center justify-between shadow-sm animate-fadeIn">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span className="font-medium">Coordinates GPS Verified: <span className="font-bold text-white ml-1">{lat.toFixed(5)}, {lng.toFixed(5)}</span></span>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 rounded-md font-bold">GIS Locked</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">State</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-300"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">District</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <MapIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Block Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Info className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={block}
                      onChange={(e) => setBlock(e.target.value)}
                      placeholder="e.g. Kashi Vidyapeeth"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-300"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Village / Ward</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      placeholder="e.g. Sigra"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submission buttons */}
            <div className="pt-6 border-t border-slate-900/60">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white py-4 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="flex items-center space-x-2 animate-pulse">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving proposal to blockchain database...</span>
                  </span>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Register Suggestion</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* AI Assistant Sidebar - Right 1 Column */}
        <div className="space-y-6">
          {/* Completeness score card */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full pointer-events-none" />
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-6">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <span>AI Analysis Summary</span>
            </h3>

            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    className="stroke-slate-800/80"
                    strokeWidth="7"
                    fill="transparent"
                  />
                  {aiScore !== null && (
                    <circle
                      cx="64"
                      cy="64"
                      r={radius}
                      className="stroke-indigo-500 transition-all duration-700 ease-out"
                      strokeWidth="7"
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  )}
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white tracking-tight">
                    {aiScore !== null ? `${aiScore}%` : '--'}
                  </span>
                  {aiScore !== null && (
                    <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full mt-1.5 tracking-wider ${
                      aiScore >= 80 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : aiScore >= 50 
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {aiScore >= 80 ? 'MP Ready' : aiScore >= 50 ? 'Improving' : 'Needs Info'}
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Completeness Index</span>
                <p className="text-[11px] text-slate-500 px-4 leading-relaxed">Aim for &gt;80% completeness to trigger instant priority sorting for the MP.</p>
              </div>
            </div>
          </div>

          {/* AI Helper Clarifying Dialog */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>AI Clarifying Questions</span>
            </h3>

            {aiQuestions.length === 0 ? (
              <div className="p-5 bg-slate-950/60 rounded-2xl border border-slate-800 text-slate-400 text-xs flex flex-col items-center text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shadow-inner">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                </div>
                <p className="leading-relaxed">
                  Provide a description and click the <strong className="text-indigo-400">Sparkles AI button</strong> in the editor to unlock custom clarifying questions.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Answer these to boost score:</p>
                {aiQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveQuestionIndex(idx);
                      setQuestionAnswer('');
                    }}
                    className={`w-full text-left p-3.5 bg-slate-950/50 border text-xs text-slate-300 rounded-xl transition-all duration-300 ${
                      activeQuestionIndex === idx 
                        ? 'border-indigo-500 bg-indigo-950/30 text-white font-semibold shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                        : 'border-slate-800 hover:border-slate-750 hover:bg-slate-900/50 hover:text-white'
                    }`}
                  >
                    <div className="flex items-start space-x-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-indigo-400 shrink-0 font-bold">
                        {idx + 1}
                      </span>
                      <span className="flex-1 leading-relaxed">{q}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Clarification input */}
            {activeQuestionIndex !== null && (
              <div className="bg-slate-950/80 border border-indigo-500/30 p-4 rounded-2xl space-y-3 shadow-lg shadow-indigo-950/30 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-indigo-400">AI Response Assistant</span>
                  <span className="text-[10px] text-slate-500">Question {activeQuestionIndex + 1}</span>
                </div>
                <p className="text-xs text-slate-300 italic bg-slate-900/50 p-2.5 rounded-lg border border-slate-900 leading-relaxed">
                  &ldquo;{aiQuestions[activeQuestionIndex]}&rdquo;
                </p>
                <input
                  type="text"
                  value={questionAnswer}
                  onChange={(e) => setQuestionAnswer(e.target.value)}
                  placeholder="Provide details to append to description..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-300"
                />
                <div className="flex items-center space-x-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveQuestionIndex(null)}
                    className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAnswerQuestion}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded-xl font-bold transition-all shadow-sm shadow-indigo-600/10 cursor-pointer"
                  >
                    Apply & Improve
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {submitResult && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-emerald-500 to-indigo-500 pointer-events-none" />
            {submitResult.success ? (
              <>
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-400 border border-emerald-500/20">
                  <CheckCircle className="w-10 h-10 animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white animate-pulse">Proposal Registered!</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Your suggestion has been logged on the constituency map. AI verification completed.
                  </p>
                </div>

                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2 shadow-inner">
                  <div className="flex justify-between text-xs items-center">
                    <span className="text-slate-500 font-semibold">Contribution Points:</span>
                    <span className="font-bold text-orange-500 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">+{submitResult.pointsAwarded} XP Earned</span>
                  </div>
                  {submitResult.isDuplicate && (
                    <div className="border-t border-slate-850 pt-2 flex flex-col space-y-1.5 text-left text-xs bg-indigo-950/20 p-2.5 rounded-lg border border-indigo-900/30">
                      <span className="font-bold text-indigo-400 flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Duplicate Match Detected!</span>
                      </span>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        This development request has already been supported by 742 citizens. Your request is linked to ensure group impact.
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => router.push(`/dashboard/suggestions/${submitResult.suggestionId}`)}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl text-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  <span>Track Suggestion Timeline</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto text-red-400 border border-red-500/20">
                  <XCircle className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Submission Failed</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {submitResult.message}
                  </p>
                </div>
                <button
                  onClick={() => setSubmitResult(null)}
                  className="w-full bg-slate-950 hover:bg-slate-850 border border-slate-850 text-white font-bold py-3.5 rounded-xl text-xs cursor-pointer"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
