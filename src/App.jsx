import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Download, Volume2, 
  VolumeX, RefreshCw, Wand2, Smartphone, Monitor,
  Square, Film, ChevronRight, Music, Palette, Clapperboard,
  BookOpen, PlaySquare, Award, GitCompare, UserCheck, ScreenShare, Smile, Mic
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateAnimationPlan, PRESET_TEMPLATES, VIDEO_TYPES } from './services/geminiService';
import { audioFx } from './services/audioSynth';
import { voiceoverManager, AI_VOICES } from './services/voiceoverManager';
import { VideoCanvas, ASPECT_RATIOS } from './components/VideoCanvas';

function getSceneDuration(scene) {
  if (scene.voiceover) {
    const wordCount = scene.voiceover.trim().split(/\s+/).length;
    return Math.max(5.5, Math.ceil(wordCount / 2.2) + 0.8);
  }
  return scene.duration || 5.5;
}

export default function App() {
  const [promptTopic, setPromptTopic] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('minimal');
  const [selectedVideoType, setSelectedVideoType] = useState('stickman_cartoon');
  const [selectedVoice, setSelectedVoice] = useState('Puck');
  const [format, setFormat] = useState('tiktok');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Storyboard & Animation State
  const [storyboard, setStoryboard] = useState(PRESET_TEMPLATES[0]);
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sceneProgress, setSceneProgress] = useState(0);
  const [spokenWordIndex, setSpokenWordIndex] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [bgmEnabled, setBgmEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);

  const canvasElementRef = useRef(null);
  const animFrameRef = useRef(null);
  const currentSceneIdxRef = useRef(0);
  const isPlayingRef = useRef(false);
  const localStartTimeRef = useRef(0);
  const storyboardRef = useRef(storyboard);
  const selectedVoiceRef = useRef(selectedVoice);
  const voiceEnabledRef = useRef(voiceEnabled);

  useEffect(() => {
    currentSceneIdxRef.current = currentSceneIdx;
  }, [currentSceneIdx]);

  useEffect(() => {
    storyboardRef.current = storyboard;
  }, [storyboard]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    selectedVoiceRef.current = selectedVoice;
  }, [selectedVoice]);

  useEffect(() => {
    voiceEnabledRef.current = voiceEnabled;
  }, [voiceEnabled]);

  // Reliable voiceover trigger for ANY scene index
  const playSceneVoice = (sceneIndex) => {
    if (!voiceEnabledRef.current) return;
    const scene = storyboardRef.current.scenes[sceneIndex];
    if (!scene || !scene.voiceover) return;

    setSpokenWordIndex(0);

    voiceoverManager.speak(scene.voiceover, {
      voiceId: selectedVoiceRef.current,
      onWord: (wordIdx) => {
        setSpokenWordIndex(wordIdx);
      },
      onEnd: () => {
        // Voice finished naturally
      }
    });
  };

  const togglePlay = () => {
    if (!isPlaying) {
      audioFx.init();
      setIsPlaying(true);
      if (bgmEnabled) {
        audioFx.startBGM(storyboard.bgmTheme || 'chill');
      }
      const activeScene = storyboard.scenes[currentSceneIdx];
      const dur = getSceneDuration(activeScene) * 1000;
      localStartTimeRef.current = performance.now() - (sceneProgress * dur);
      playSceneVoice(currentSceneIdx);
    } else {
      setIsPlaying(false);
      audioFx.stopBGM();
      voiceoverManager.stop();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }
  };

  // Main playback loop that GUARANTEES every scene triggers the next voiceover
  useEffect(() => {
    if (!isPlaying) return;

    const activeScene = storyboardRef.current.scenes[currentSceneIdxRef.current];
    const initialDur = getSceneDuration(activeScene) * 1000;
    localStartTimeRef.current = performance.now() - (sceneProgress * initialDur);

    const step = (now) => {
      if (!isPlayingRef.current) return;

      const currIdx = currentSceneIdxRef.current;
      const currentSceneObj = storyboardRef.current.scenes[currIdx];
      const durationMs = getSceneDuration(currentSceneObj) * 1000;
      const elapsed = now - localStartTimeRef.current;
      const prog = Math.min(1, Math.max(0, elapsed / durationMs));

      setSceneProgress(prog);

      // Transition to next scene and trigger its voiceover
      if (elapsed >= durationMs) {
        const nextIdx = currIdx + 1;
        if (nextIdx < storyboardRef.current.scenes.length) {
          audioFx.playWhoosh();
          currentSceneIdxRef.current = nextIdx;
          setCurrentSceneIdx(nextIdx);
          localStartTimeRef.current = performance.now();
          setSceneProgress(0);
          setSpokenWordIndex(0);
          // TRIGGER VOICE FOR SCENE 2, 3, 4, 5...
          playSceneVoice(nextIdx);
        } else {
          // Completed all scenes
          setIsPlaying(false);
          audioFx.stopBGM();
          voiceoverManager.stop();
          currentSceneIdxRef.current = 0;
          setCurrentSceneIdx(0);
          setSceneProgress(0);
          setSpokenWordIndex(0);
          return;
        }
      }

      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  const selectScene = (idx) => {
    currentSceneIdxRef.current = idx;
    setCurrentSceneIdx(idx);
    setSceneProgress(0);
    setSpokenWordIndex(0);
    localStartTimeRef.current = performance.now();
    audioFx.playPop();
    if (isPlaying) {
      playSceneVoice(idx);
    }
  };

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!promptTopic.trim()) {
      setErrorMsg('Please enter a video topic or idea.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg('');
    setIsPlaying(false);
    audioFx.stopBGM();
    voiceoverManager.stop();

    try {
      const plan = await generateAnimationPlan(promptTopic, selectedStyle, selectedVideoType);
      if (plan && plan.scenes && plan.scenes.length > 0) {
        setStoryboard(plan);
        setCurrentSceneIdx(0);
        currentSceneIdxRef.current = 0;
        setSceneProgress(0);
        setSpokenWordIndex(0);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } else {
        throw new Error('Received incomplete storyboard structure.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to generate animation plan.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async () => {
    const canvas = canvasElementRef.current;
    if (!canvas) return;

    setIsRecording(true);
    setRecordingProgress(0);
    setIsPlaying(false);
    audioFx.stopBGM();
    voiceoverManager.stop();

    const stream = canvas.captureStream(30);
    let mimeType = 'video/webm;codecs=vp9';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }

    const mediaRecorder = new MediaRecorder(stream, { mimeType });
    const chunks = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `animAItion-${format}-${Date.now()}.webm`;
      a.click();
      URL.revokeObjectURL(url);
      setIsRecording(false);
      confetti({ particleCount: 80, spread: 60 });
    };

    mediaRecorder.start();

    const totalScenes = storyboard.scenes.length;
    const playSceneForExport = (index) => {
      if (index >= totalScenes) {
        mediaRecorder.stop();
        setCurrentSceneIdx(0);
        currentSceneIdxRef.current = 0;
        setSceneProgress(0);
        setSpokenWordIndex(0);
        return;
      }

      setCurrentSceneIdx(index);
      currentSceneIdxRef.current = index;
      const scene = storyboard.scenes[index];
      const durationMs = getSceneDuration(scene) * 1000;
      const startT = performance.now();
      const allWords = (scene.voiceover || '').trim().split(/\s+/);

      const stepRecord = (now) => {
        const elapsed = now - startT;
        const p = Math.min(1, elapsed / durationMs);
        setSceneProgress(p);
        setSpokenWordIndex(Math.min(allWords.length - 1, Math.floor(p * allWords.length)));

        const overall = ((index + p) / totalScenes) * 100;
        setRecordingProgress(Math.floor(overall));

        if (elapsed < durationMs) {
          requestAnimationFrame(stepRecord);
        } else {
          playSceneForExport(index + 1);
        }
      };
      requestAnimationFrame(stepRecord);
    };

    playSceneForExport(0);
  };

  const currentScene = storyboard.scenes[currentSceneIdx] || storyboard.scenes[0];
  const currentSceneDur = getSceneDuration(currentScene);
  const totalDuration = storyboard.scenes.reduce((acc, s) => acc + getSceneDuration(s), 0);
  const elapsedPastScenes = storyboard.scenes.slice(0, currentSceneIdx).reduce((acc, s) => acc + getSceneDuration(s), 0);
  const currentTotalProgress = (elapsedPastScenes + sceneProgress * currentSceneDur) / totalDuration;

  const getVideoTypeIcon = (id) => {
    switch (id) {
      case 'explainer': return <BookOpen className="w-3.5 h-3.5" />;
      case 'demo_howto': return <PlaySquare className="w-3.5 h-3.5" />;
      case 'brand_promo': return <Award className="w-3.5 h-3.5" />;
      case 'live_vs_anim': return <GitCompare className="w-3.5 h-3.5" />;
      case 'ugc': return <UserCheck className="w-3.5 h-3.5" />;
      case 'screencast': return <ScreenShare className="w-3.5 h-3.5" />;
      case 'stickman_cartoon': return <Smile className="w-3.5 h-3.5" />;
      default: return <Clapperboard className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#070709] text-zinc-100">
      <header className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-2xl sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-white text-black flex items-center justify-center font-black text-sm tracking-tighter">
            ✦
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold tracking-tight text-white">
              animAItion
            </span>
            <span className="text-[11px] text-zinc-500 font-normal">
              Neural Studio
            </span>
          </div>
        </div>

        {/* Aspect Ratio */}
        <div className="flex items-center bg-zinc-900/80 p-1 rounded-xl border border-white/5 shadow-inner">
          {Object.values(ASPECT_RATIOS).map((item) => {
            const isSelected = format === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setFormat(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-white text-black shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {item.id === 'tiktok' && <Smartphone className="w-3.5 h-3.5" />}
                {item.id === 'youtube' && <Monitor className="w-3.5 h-3.5" />}
                {item.id === 'instagram' && <Square className="w-3.5 h-3.5" />}
                {item.id === 'portrait' && <Film className="w-3.5 h-3.5" />}
                <span>{item.sub}</span>
              </button>
            );
          })}
        </div>

        {/* Export */}
        <div>
          <button
            onClick={handleExport}
            disabled={isRecording || isGenerating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:bg-zinc-200 transition active:scale-95 disabled:opacity-40 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isRecording ? `Exporting (${recordingProgress}%)...` : 'Export Video'}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Controls */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl ring-1 ring-white/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-zinc-400 tracking-wide uppercase">
                Production Engine
              </span>
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5 bg-zinc-800/60 px-2.5 py-1 rounded-full border border-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Neural AI Voices Enabled
              </span>
            </div>

            <form onSubmit={handleGenerate} className="flex flex-col gap-4">
              {/* Video Types */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
                    <Clapperboard className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Video Format:</span>
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono">
                    30-40s Deep Narrative
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {VIDEO_TYPES.map((vt) => {
                    const isCur = selectedVideoType === vt.id;
                    return (
                      <button
                        key={vt.id}
                        type="button"
                        onClick={() => {
                          setSelectedVideoType(vt.id);
                          audioFx.playPop();
                        }}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left transition ${
                          isCur
                            ? 'bg-zinc-800 text-white border-white/30 shadow-sm'
                            : 'bg-zinc-950/50 text-zinc-400 border-white/5 hover:border-white/20'
                        }`}
                      >
                        <span className={isCur ? 'text-white' : 'text-zinc-500'}>
                          {getVideoTypeIcon(vt.id)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold truncate leading-tight">
                            {vt.name}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Neural AI Voices Picker */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
                    <Mic className="w-3.5 h-3.5 text-violet-400" />
                    <span>Voiceover Actor (Neural Voices):</span>
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {AI_VOICES.find(v => v.id === selectedVoice)?.gender}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {AI_VOICES.map((v) => {
                    const isCur = selectedVoice === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setSelectedVoice(v.id);
                          selectedVoiceRef.current = v.id;
                          audioFx.playPop();
                          if (isPlaying) playSceneVoice(currentSceneIdx);
                        }}
                        className={`flex flex-col p-2.5 rounded-xl border text-left transition ${
                          isCur
                            ? 'bg-zinc-800 text-white border-white/30 shadow-sm'
                            : 'bg-zinc-950/50 text-zinc-400 border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-200">
                            {v.name}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-mono">
                            {v.type === 'neural' ? 'Neural AI' : 'Fast'}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-500 truncate mt-0.5">
                          {v.style}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Topic Input */}
              <div className="pt-1">
                <textarea
                  rows={2}
                  value={promptTopic}
                  onChange={(e) => setPromptTopic(e.target.value)}
                  placeholder="Enter any topic (e.g. Dog training secrets, Why cats purr, or How electric cars work)"
                  className="w-full bg-zinc-950/70 border border-white/10 rounded-2xl p-3.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-white/30 transition resize-none leading-relaxed"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-950/30 border border-red-800/40 text-red-300 text-xs">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-medium text-xs bg-white text-black hover:bg-zinc-200 transition active:scale-98 disabled:opacity-40 shadow-sm mt-1"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating 30s Video...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Generate Video Storyboard</span>
                  </>
                )}
              </button>
            </form>

            {/* Presets */}
            <div className="mt-5 pt-4 border-t border-white/5">
              <span className="text-[11px] text-zinc-500 font-medium block mb-2.5">
                30s+ Production Presets (0 Cost):
              </span>
              <div className="flex flex-col gap-1.5">
                {PRESET_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setStoryboard(tmpl);
                      setSelectedStyle(tmpl.aesthetic || 'minimal');
                      setSelectedVideoType(tmpl.videoType || 'stickman_cartoon');
                      setCurrentSceneIdx(0);
                      currentSceneIdxRef.current = 0;
                      setSceneProgress(0);
                      setSpokenWordIndex(0);
                      setIsPlaying(false);
                      audioFx.stopBGM();
                      voiceoverManager.stop();
                    }}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-zinc-950/40 hover:bg-zinc-950/80 text-left text-xs transition border border-white/5 group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500">
                        {getVideoTypeIcon(tmpl.videoType)}
                      </span>
                      <span className="text-zinc-300 group-hover:text-white font-medium truncate">
                        {tmpl.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {tmpl.scenes.length} Scenes
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scenes Timeline */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl ring-1 ring-white/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-zinc-400 tracking-wide uppercase">
                Story Progression ({storyboard.scenes.length} Scenes)
              </span>
              <span className="text-xs text-emerald-400 font-mono font-bold">
                ⏱️ ~{Math.round(totalDuration)}s Total Duration
              </span>
            </div>

            <div className="flex flex-col gap-2 max-h-[290px] overflow-y-auto pr-1">
              {storyboard.scenes.map((sc, idx) => {
                const isActive = idx === currentSceneIdx;
                const dur = getSceneDuration(sc);
                return (
                  <div
                    key={sc.id || idx}
                    onClick={() => selectScene(idx)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3.5 ${
                      isActive
                        ? 'bg-zinc-800/80 border-white/20 text-white shadow-sm'
                        : 'bg-zinc-950/40 border-white/5 text-zinc-400 hover:border-white/10'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-lg text-black flex items-center justify-center font-mono text-[11px] font-bold shrink-0 mt-0.5"
                      style={{ backgroundColor: sc.visualTheme?.accentColor || '#38bdf8' }}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-semibold text-zinc-200 truncate">
                          {sc.hookText}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {dur}s
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-1">
                        "{sc.voiceover}"
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Player */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center gap-6">
          <div className="w-full flex justify-center">
            <VideoCanvas
              ref={canvasElementRef}
              currentScene={currentScene}
              progress={sceneProgress}
              totalProgress={currentTotalProgress}
              format={format}
              isPlaying={isPlaying}
              activeAesthetic={selectedStyle}
              videoType={storyboard.videoType || selectedVideoType}
              spokenWordIndex={spokenWordIndex}
            />
          </div>

          {/* Minimalist Floating Bar */}
          <div className="w-full max-w-sm bg-zinc-900/70 border border-white/10 rounded-2xl p-3.5 shadow-2xl backdrop-blur-2xl flex flex-col gap-3 ring-1 ring-white/5">
            <div className="flex items-center gap-3 px-1">
              <span className="text-[11px] font-mono text-zinc-500">
                0{currentSceneIdx + 1}
              </span>
              <div className="flex-1 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-white h-full transition-all duration-75"
                  style={{ width: `${currentTotalProgress * 100}%` }}
                />
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                0{storyboard.scenes.length}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const next = !voiceEnabled;
                    setVoiceEnabled(next);
                    voiceEnabledRef.current = next;
                    if (!next) voiceoverManager.stop();
                    else if (isPlaying) playSceneVoice(currentSceneIdx);
                  }}
                  className={`p-2 rounded-xl transition ${
                    voiceEnabled ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-400'
                  }`}
                  title="Toggle Voiceover Narration"
                >
                  {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => {
                    const next = !bgmEnabled;
                    setBgmEnabled(next);
                    if (!next) {
                      audioFx.stopBGM();
                    } else {
                      audioFx.init();
                      audioFx.startBGM(storyboard.bgmTheme || 'chill');
                    }
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition ${
                    bgmEnabled ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-600 hover:text-zinc-400'
                  }`}
                  title="Toggle Synth BGM"
                >
                  <Music className="w-3.5 h-3.5" />
                  <span>{bgmEnabled ? 'BGM On' : 'BGM Off'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCurrentSceneIdx(0);
                    currentSceneIdxRef.current = 0;
                    setSceneProgress(0);
                    setSpokenWordIndex(0);
                    localStartTimeRef.current = performance.now();
                    audioFx.playPop();
                  }}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white transition"
                  title="Reset to scene 1"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={togglePlay}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl font-medium text-xs bg-white text-black hover:bg-zinc-200 transition active:scale-95 shadow-sm"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      <span>Play</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
