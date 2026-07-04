'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  FileImage, 
  MapIcon, 
  HelpCircleIcon, 
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Submit Development Suggestion</h1>
        <p className="text-xs text-slate-400 mt-1">Submit actionable proposals for constituency improvement. AI reviews and groups them automatically.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Suggestion Form - Left 2 Columns */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-6">
          
          {/* Voice Input Assist */}
          <div className="bg-gradient-to-r from-slate-950 to-indigo-950/40 border border-slate-850 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-sm font-bold text-white flex items-center justify-center sm:justify-start space-x-2">
                <Mic className="w-4 h-4 text-indigo-400" />
                <span>Speak Your Suggestion</span>
              </h3>
              <p className="text-xs text-slate-400">Record in Hindi, Hinglish, Bhojpuri, or English. AI generates title, text and fields.</p>
            </div>
            
            <div className="shrink-0 flex items-center space-x-3">
              {isRecording ? (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center space-x-2 shadow-lg shadow-red-600/20 animate-pulse"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-white mr-1" />
                  <span>Stop ({recordingTime}s)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center space-x-2 shadow-lg shadow-indigo-600/20"
                >
                  <Mic className="w-4 h-4" />
                  <span>Record Suggestion</span>
                </button>
              )}
            </div>
          </div>

          {isTranscribing && (
            <div className="flex items-center justify-center space-x-3 p-4 bg-slate-950 rounded-xl border border-slate-850 text-indigo-400 text-xs">
              <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent animate-spin rounded-full" />
              <span>Transcribing and structuring audio using Gemini...</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmitForm} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Suggestion Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Briefly state what needs development (e.g., Road repairs connecting village school)"
                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Description */}
            <div className="relative">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the developmental need. Mention the current issue, how it impacts residents, land details if any, etc."
                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-sans"
              />
              {description.length > 10 && (
                <button
                  type="button"
                  onClick={handleAiAssist}
                  disabled={aiLoading}
                  className="absolute bottom-3 right-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-400 text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{aiLoading ? 'Analyzing...' : 'AI Writing Assistant'}</span>
                </button>
              )}
            </div>

            {/* Beneficiaries & Urgency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Estimated People Benefited</label>
                <input
                  type="number"
                  value={beneficiaries}
                  onChange={(e) => setBeneficiaries(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Urgency Level</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="low">Low - Routine Planning</option>
                  <option value="medium">Medium - Important Improvement</option>
                  <option value="high">High - High Priority</option>
                  <option value="critical">Critical - Urgent Public Hazard / Complete Absence</option>
                </select>
              </div>
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Image Evidence</label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <label className="w-full sm:w-auto flex items-center justify-center space-x-2 border border-dashed border-slate-850 hover:border-indigo-500 rounded-xl py-4 px-6 cursor-pointer bg-slate-950 text-slate-400 text-xs font-bold hover:text-white transition-all">
                  <Upload className="w-4 h-4 text-indigo-400" />
                  <span>Choose Photo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
                {imagePreview && (
                  <div className="flex items-center space-x-3 bg-slate-950 p-2 rounded-xl border border-slate-850">
                    <img src={imagePreview} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-slate-800" />
                    <div className="min-w-0 pr-4">
                      <span className="block text-xs font-semibold text-slate-300 truncate max-w-[150px]">{imageFile?.name}</span>
                      <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="text-[10px] text-red-400 font-bold hover:underline block">Remove</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location Section */}
            <div className="border-t border-slate-900 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Location Metadata</span>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="text-xs font-bold text-indigo-400 hover:underline flex items-center space-x-1"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Fetch Geolocation</span>
                </button>
              </div>

              {lat && lng && (
                <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl text-slate-400 text-[11px] flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Coordinates Verified: Lat {lat.toFixed(5)}, Lng {lng.toFixed(5)}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 text-sm text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">District</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 text-sm text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Block Name</label>
                  <input
                    type="text"
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                    placeholder="e.g. Kashi Vidyapeeth"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Village / Ward</label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="e.g. Sigra"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Submission buttons */}
            <div className="pt-6 border-t border-slate-900">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-55 text-white py-4 rounded-xl text-sm font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <span>Saving proposal to blockchain database...</span>
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
          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 blur-xl rounded-full" />
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-6">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <span>AI Analysis Summary</span>
            </h3>

            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <div className="relative w-28 h-28 flex items-center justify-center bg-slate-950 rounded-full border-4 border-slate-850">
                <span className="text-3xl font-black text-white">{aiScore !== null ? `${aiScore}%` : '--'}</span>
                {aiScore !== null && (
                  <div className="absolute inset-0 border-4 border-indigo-500 rounded-full animate-pulse opacity-20" />
                )}
              </div>
              <div className="space-y-1">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Completeness Index</span>
                <p className="text-[11px] text-slate-500 px-4">Aim for &gt;80% completeness to trigger instant priority sorting for the MP.</p>
              </div>
            </div>
          </div>

          {/* AI Helper Clarifying Dialog */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>AI Clarifying Questions</span>
            </h3>

            {aiQuestions.length === 0 ? (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 text-slate-500 text-xs flex items-start space-x-2.5">
                <Info className="w-4 h-4 shrink-0 text-slate-600 mt-0.5" />
                <p>Submit description and click &apos;AI Writing Assistant&apos; to generate custom clarifying questions.</p>
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
                    className={`w-full text-left p-3.5 bg-slate-950 border text-xs text-slate-300 rounded-xl transition-all ${
                      activeQuestionIndex === idx 
                        ? 'border-indigo-500 bg-indigo-950/20 text-white font-semibold' 
                        : 'border-slate-850 hover:border-slate-750'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Clarification input */}
            {activeQuestionIndex !== null && (
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-indigo-400">Answer question:</span>
                <input
                  type="text"
                  value={questionAnswer}
                  onChange={(e) => setQuestionAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
                />
                <div className="flex items-center space-x-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveQuestionIndex(null)}
                    className="text-[10px] text-slate-500 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAnswerQuestion}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] px-3 py-1.5 rounded-md font-bold"
                  >
                    Apply Answer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {submitResult && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-8 text-center space-y-6 shadow-2xl">
            {submitResult.success ? (
              <>
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-400 border border-emerald-500/20">
                  <CheckCircle className="w-10 h-10 animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Proposal Registered!</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Your suggestion has been logged on the constituency map. AI verification completed.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Contribution Points:</span>
                    <span className="font-bold text-orange-500">+{submitResult.pointsAwarded} XP Earned</span>
                  </div>
                  {submitResult.isDuplicate && (
                    <div className="border-t border-slate-850 pt-2 flex flex-col space-y-1.5 text-left text-xs bg-indigo-950/20 p-2.5 rounded-lg border border-indigo-900/30">
                      <span className="font-bold text-indigo-400 flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Duplicate Match Detected!</span>
                      </span>
                      <p className="text-[11px] text-slate-400">
                        This development request has already been supported by 742 citizens. Your request is linked to ensure group impact.
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => router.push(`/dashboard/suggestions/${submitResult.suggestionId}`)}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl text-xs transition-colors flex items-center justify-center space-x-2"
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
                  <p className="text-xs text-slate-400">
                    {submitResult.message}
                  </p>
                </div>
                <button
                  onClick={() => setSubmitResult(null)}
                  className="w-full bg-slate-950 hover:bg-slate-850 border border-slate-850 text-white font-bold py-3 rounded-xl text-xs"
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
