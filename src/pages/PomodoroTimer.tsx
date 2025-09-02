import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Settings, Volume2, BarChart2, X, Play, Pause, RefreshCw, VolumeX } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Cookie helpers
function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}
function getCookie(name: string) {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r
  }, '');
}

const DEFAULTS = {
  work: 25,
  short: 5,
  long: 15,
  sessionsBeforeLong: 4,
  dark: true,
  autoSwitch: true,
  sound: true,
  ticking: false,
  ambientSound: "none",
  ambientVolume: 0.3,
  volume: 0.7,
  theme: "default",
  showQuotes: true,
  enableConfetti: true,
  keyboardShortcuts: true,
};

const MODES = [
  { key: "work", label: "Work Time", color: "red-500", gradient: "from-red-600 to-orange-500" },
  { key: "short", label: "Short Break", color: "green-500", gradient: "from-green-500 to-emerald-400" },
  { key: "long", label: "Long Break", color: "blue-500", gradient: "from-blue-600 to-purple-500" },
];

const AMBIENT_SOUNDS = [
  { key: "none", label: "None" },
  { key: "rain", label: "Rainfall" },
  { key: "cafe", label: "Coffee Shop" },
  { key: "white", label: "White Noise" },
  { key: "forest", label: "Forest" },
];

const THEMES = [
  { key: "default", label: "Default" },
  { key: "ocean", label: "Ocean" },
  { key: "forest", label: "Forest" },
  { key: "sunset", label: "Sunset" },
  { key: "minimal", label: "Minimal" },
];

const MOTIVATIONAL_QUOTES = [
  "The secret of getting ahead is getting started.",
  "It always seems impossible until it's done.",
  "Don't watch the clock; do what it does. Keep going.",
  "Productivity is never an accident. It is always the result of a commitment.",
  "The way to get started is to quit talking and begin doing.",
  "Don't count the days, make the days count.",
  "You don't have to be great to start, but you have to start to be great.",
  "The only way to do great work is to love what you do.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Your time is limited, don't waste it living someone else's life.",
];

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getInitialSettings() {
  try {
    const cookie = getCookie("pomodoro_settings");
    if (cookie) return { ...DEFAULTS, ...JSON.parse(cookie) };
  } catch {}
  return { ...DEFAULTS };
}

function getInitialHistory() {
  try {
    const cookie = getCookie("pomodoro_history");
    if (cookie) return JSON.parse(cookie);
  } catch {}
  return {};
}

function getInitialStreak() {
  try {
    const cookie = getCookie("pomodoro_streak");
    if (cookie) return JSON.parse(cookie);
  } catch {}
  return { current: 0, longest: 0, lastDate: "" };
}

function getRandomQuote() {
  return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
}

const POMODORO_COOKIE_DAYS = 30;

export default function PomodoroTimer() {
  // State
  const [settings, setSettings] = useState(getInitialSettings());
  const [mode, setMode] = useState<'work'|'short'|'long'>('work');
  const [timeLeft, setTimeLeft] = useState(settings.work * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [history, setHistory] = useState(getInitialHistory());
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [streak, setStreak] = useState(getInitialStreak());
  const [quote, setQuote] = useState(getRandomQuote());
  const [showConfetti, setShowConfetti] = useState(false);
  const [completedToday, setCompletedToday] = useState(history[getToday()] || 0);
  const [activeTab, setActiveTab] = useState("timer");
  const timerRef = useRef<NodeJS.Timeout|null>(null);
  const endTimeRef = useRef<number|null>(null);
  const audioRef = useRef<HTMLAudioElement|null>(null);
  const tickingRef = useRef<HTMLAudioElement|null>(null);
  const ambientRef = useRef<HTMLAudioElement|null>(null);

  // Save settings & history to cookies
  useEffect(() => {
    setCookie("pomodoro_settings", JSON.stringify(settings), POMODORO_COOKIE_DAYS);
  }, [settings]);
  
  useEffect(() => {
    setCookie("pomodoro_history", JSON.stringify(history), POMODORO_COOKIE_DAYS);
    setCompletedToday(history[getToday()] || 0);
  }, [history]);
  
  useEffect(() => {
    setCookie("pomodoro_streak", JSON.stringify(streak), POMODORO_COOKIE_DAYS);
  }, [streak]);

  // Update streak when completing a work session
  useEffect(() => {
    const today = getToday();
    if (history[today] && history[today] > 0) {
      // Check if this is a new day from last recorded date
      if (streak.lastDate !== today) {
        // If yesterday, increment streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().slice(0, 10);
        
        if (streak.lastDate === yesterdayStr) {
          // Consecutive day, increment streak
          const newCurrent = streak.current + 1;
          setStreak({
            current: newCurrent,
            longest: Math.max(newCurrent, streak.longest),
            lastDate: today
          });
        } else {
          // Not consecutive, reset streak
          setStreak({
            current: 1,
            longest: Math.max(1, streak.longest),
            lastDate: today
          });
        }
      }
    }
  }, [history, streak]);

  // Restore timer on settings change
  useEffect(() => {
    setTimeLeft(settings[mode] * 60);
  }, [settings, mode]);

  // Timer logic
  useEffect(() => {
    if (!isRunning) return;
    if (!endTimeRef.current) endTimeRef.current = Date.now() + timeLeft * 1000;
    
    timerRef.current = setInterval(() => {
      const left = Math.max(0, Math.round((endTimeRef.current! - Date.now()) / 1000));
      setTimeLeft(left);
      
      if (left <= 0) {
        clearInterval(timerRef.current!);
        endTimeRef.current = null;
        setIsRunning(false);
        handleComplete();
      }
    }, 200);
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  // Confetti timeout
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  // Request notification permission
  useEffect(() => {
    if (window.Notification && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // New quote on break starts
  useEffect(() => {
    if (mode !== 'work' && settings.showQuotes) {
      setQuote(getRandomQuote());
    }
  }, [mode, settings.showQuotes]);

  // Progress ring
  const percent = 100 * timeLeft / (settings[mode] * 60);

  // Get background gradient based on mode and theme
  const getBgGradient = () => {
    const modeGradient = MODES.find(m => m.key === mode)?.gradient || 'from-red-600 to-orange-500';
    
    if (settings.theme === 'ocean') {
      return mode === 'work' ? 'from-blue-700 to-cyan-500' : 
             mode === 'short' ? 'from-cyan-500 to-teal-400' : 
             'from-indigo-700 to-purple-500';
    } else if (settings.theme === 'forest') {
      return mode === 'work' ? 'from-green-800 to-emerald-600' : 
             mode === 'short' ? 'from-emerald-600 to-lime-400' : 
             'from-teal-700 to-green-500';
    } else if (settings.theme === 'sunset') {
      return mode === 'work' ? 'from-orange-600 to-rose-500' : 
             mode === 'short' ? 'from-amber-500 to-yellow-400' : 
             'from-rose-600 to-purple-500';
    } else if (settings.theme === 'minimal') {
      return 'from-gray-800 to-gray-700';
    }
    
    return modeGradient;
  };

  // Handle timer complete
  function handleComplete() {
    // Sound
    if (settings.sound && audioRef.current) {
      console.log("Playing sound...");
      audioRef.current.volume = settings.volume;
      audioRef.current.play().catch(err => console.error("Audio play failed:", err));
    }
    
    // Vibration
    if (window.navigator.vibrate) window.navigator.vibrate([200, 100, 200]);
    
    // Notification
    if (window.Notification && Notification.permission === "granted") {
      const title = mode === 'work' 
        ? "Time for a break!" 
        : "Break finished!";
      const body = mode === 'work'
        ? `Great job! You completed a ${settings.work}-minute work session.`
        : `Your ${mode === 'short' ? 'short' : 'long'} break is over. Ready to focus again?`;
      
      new Notification("Pomodoro Timer", { body: body });
    }
    
    // Progress tracking
    if (mode === 'work') {
      // Show confetti animation
      if (settings.enableConfetti) {
        setShowConfetti(true);
      }
      
      // Update history
      const today = getToday();
      setHistory((h: any) => {
        const nh = { ...h, [today]: (h[today] || 0) + 1 };
        // Keep only last 7 days
        const keys = Object.keys(nh).sort().slice(-7);
        const pruned = keys.reduce((acc, k) => (acc[k]=nh[k], acc), {} as any);
        return pruned;
      });
      setSessionCount(c => c + 1);
      
      // Update quote for the break
      if (settings.showQuotes) {
        setQuote(getRandomQuote());
      }
    }
    
    // Auto-switch
    if (settings.autoSwitch) {
      if (mode === 'work') {
        if ((sessionCount + 1) % settings.sessionsBeforeLong === 0) setMode('long');
        else setMode('short');
      } else {
        setMode('work');
      }
      setIsRunning(false);
    }
  }

  // Mode switch
  function switchMode(newMode: 'work'|'short'|'long') {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(settings[newMode] * 60);
    endTimeRef.current = null;
  }

  // Start, pause, reset
  function start() {
    if (timeLeft <= 0) setTimeLeft(settings[mode] * 60);
    setIsRunning(true);
  }
  
  function pause() {
    setIsRunning(false);
    endTimeRef.current = null;
  }
  
  function reset() {
    setIsRunning(false);
    setTimeLeft(settings[mode] * 60);
    endTimeRef.current = null;
  }
  
  function toggleAmbientSound(sound: string) {
    if (settings.ambientSound === sound) {
      setSettings(s => ({...s, ambientSound: "none"}));
    } else {
      setSettings(s => ({...s, ambientSound: sound}));
    }
  }
  
  function toggleMute() {
    setSettings(s => ({...s, sound: !s.sound}));
  }

  // Format time
  function fmt(secs: number) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  // Ticking sound
  useEffect(() => {
    let tick: NodeJS.Timeout;
    if (settings.ticking && isRunning && mode === 'work' && tickingRef.current) {
      tick = setInterval(() => {
        tickingRef.current!.currentTime = 0;
        tickingRef.current!.volume = settings.volume * 0.3; // Lower volume for tick
        tickingRef.current!.play().catch(() => {});
      }, 1000);
    }
    return () => clearInterval(tick);
  }, [settings.ticking, settings.volume, isRunning, mode]);

  // Theme
  useEffect(() => {
    document.body.classList.toggle('dark', settings.dark);
  }, [settings.dark]);

  // Chart data
  const chartDays = Array.from({length:7}, (_,i)=>{
    const d = new Date();
    d.setDate(d.getDate()-6+i);
    return d.toISOString().slice(0,10);
  });
  const chartVals = chartDays.map(d=>history[d]||0);
  const maxVal = Math.max(1, ...chartVals);

  // Confetti Component
  const Confetti = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const confetti = useRef<any[]>([]);
    const animationRef = useRef<number>();

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const w = canvas.width = window.innerWidth;
      const h = canvas.height = window.innerHeight;
      
      // Create confetti particles
      for (let i = 0; i < 100; i++) {
        confetti.current.push({
          x: Math.random() * w,
          y: Math.random() * h - h,
          r: Math.random() * 5 + 3, // radius
          d: Math.random() * 40 + 10, // density
          c: `hsl(${Math.random() * 360}, 100%, 50%)`, // color
          a: Math.random() * Math.PI, // angle
          v: (Math.random() * 5) + 2, // velocity
        });
      }
      
      function animate() {
        if (!ctx) return;
        
        ctx.clearRect(0, 0, w, h);
        
        confetti.current.forEach((p) => {
          p.y += p.v;
          p.x += Math.sin(p.a) * 2;
          p.a += 0.01;
          
          ctx.beginPath();
          ctx.fillStyle = p.c;
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
          
          // Reset confetti when it falls off screen
          if (p.y > h) {
            p.y = -10;
            p.x = Math.random() * w;
          }
        });
        
        animationRef.current = requestAnimationFrame(animate);
      }
      
      animate();
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 9999
        }}
      />
    );
  };

  // Ambient sounds effect
  useEffect(() => {
    if (!ambientRef.current || !settings.sound) return;
    
    if (settings.ambientSound !== "none") {
      ambientRef.current.src = `/sounds/${settings.ambientSound}.mp3`;
      ambientRef.current.loop = true;
      ambientRef.current.volume = settings.ambientVolume;
      
      if (isRunning) {
        ambientRef.current.play().catch(err => console.error("Ambient sound failed to play:", err));
      } else {
        ambientRef.current.pause();
      }
    } else {
      ambientRef.current.pause();
    }
    
    return () => {
      if (ambientRef.current) ambientRef.current.pause();
    };
  }, [settings.ambientSound, settings.ambientVolume, settings.sound, isRunning]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!settings.keyboardShortcuts) return;
    
    const handleKeydown = (e: KeyboardEvent) => {
      // Only respond if not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key) {
        case " ": // Space - Start/Pause
          e.preventDefault();
          if (isRunning) pause();
          else start();
          break;
        case "r": // R - Reset
        case "R":
          reset();
          break;
        case "m": // M - Toggle mute
        case "M":
          toggleMute();
          break;
      }
    };
    
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [settings.keyboardShortcuts, isRunning]);

  // UI
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center transition-all duration-700 
                    bg-gradient-to-br ${getBgGradient()} ${settings.dark ? 'dark' : ''}`}>
      {/* Confetti animation on completion */}
      {showConfetti && <Confetti />}
      
      {/* Audio elements */}
      <audio ref={audioRef} src="/chime.mp3" preload="auto" />
      <audio ref={tickingRef} src="/sounds/tick.mp3" preload="auto" />
      <audio ref={ambientRef} preload="auto" />
      
      {/* Main container */}
      <div className="w-full max-w-lg px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-5 text-white">
          <div className="flex items-center">
            <Badge variant="outline" className="bg-black/30 backdrop-blur-sm text-white font-medium py-1.5">
              <span className="mr-1.5">{completedToday}</span> / {settings.sessionsBeforeLong} Completed Today
              {streak.current > 1 && 
                <span className="ml-2 flex items-center gap-1">
                  🔥 {streak.current} day streak
                </span>
              }
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Button size="icon" variant="ghost" onClick={toggleMute} className="text-white hover:bg-white/20 rounded-full">
              {settings.sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 rounded-full">
                  <Settings size={18} />
                </Button>
              </SheetTrigger>
              <SheetContent className="backdrop-blur-xl bg-background/80 border-l border-white/10">
                <SheetHeader>
                  <SheetTitle>Timer Settings</SheetTitle>
                </SheetHeader>
                <Tabs defaultValue="durations" className="mt-4">
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="durations">Durations</TabsTrigger>
                    <TabsTrigger value="sounds">Sounds</TabsTrigger>
                    <TabsTrigger value="preferences">Display</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="durations" className="mt-4 space-y-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span>Work (minutes)</span>
                        <Input 
                          type="number" 
                          min={1} 
                          max={120} 
                          value={settings.work} 
                          onChange={e=>setSettings(s=>({...s,work:+e.target.value}))} 
                          className="w-20" 
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Short Break (minutes)</span>
                        <Input 
                          type="number" 
                          min={1} 
                          max={60} 
                          value={settings.short} 
                          onChange={e=>setSettings(s=>({...s,short:+e.target.value}))} 
                          className="w-20" 
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Long Break (minutes)</span>
                        <Input 
                          type="number" 
                          min={1} 
                          max={60} 
                          value={settings.long} 
                          onChange={e=>setSettings(s=>({...s,long:+e.target.value}))} 
                          className="w-20" 
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Sessions before Long Break</span>
                        <Input 
                          type="number" 
                          min={1} 
                          max={10} 
                          value={settings.sessionsBeforeLong} 
                          onChange={e=>setSettings(s=>({...s,sessionsBeforeLong:+e.target.value}))} 
                          className="w-20" 
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="sounds" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Sound Effects</span>
                      <Switch 
                        checked={settings.sound} 
                        onCheckedChange={v=>setSettings(s=>({...s,sound:v}))} 
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Volume</span>
                      <div className="w-[60%]">
                        <Slider 
                          min={0} 
                          max={1} 
                          step={0.01}
                          value={[settings.volume]}
                          onValueChange={v=>setSettings(s=>({...s,volume:v[0]}))}
                          disabled={!settings.sound}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Ticking Sound</span>
                      <Switch 
                        checked={settings.ticking} 
                        onCheckedChange={v=>setSettings(s=>({...s,ticking:v}))} 
                        disabled={!settings.sound}
                      />
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Background Sounds</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {AMBIENT_SOUNDS.map(sound => (
                          <Button 
                            key={sound.key}
                            onClick={() => toggleAmbientSound(sound.key)}
                            variant={settings.ambientSound === sound.key ? "default" : "outline"}
                            disabled={!settings.sound && sound.key !== "none"}
                            size="sm"
                          >
                            {sound.label}
                          </Button>
                        ))}
                      </div>
                      
                      {settings.ambientSound !== "none" && (
                        <div className="mt-2 flex items-center gap-2">
                          <span>Ambient Volume</span>
                          <Slider 
                            min={0} 
                            max={1} 
                            step={0.01}
                            value={[settings.ambientVolume]}
                            onValueChange={v=>setSettings(s=>({...s,ambientVolume:v[0]}))}
                            className="flex-1"
                          />
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="preferences" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Dark Mode</span>
                      <Switch 
                        checked={settings.dark} 
                        onCheckedChange={v=>setSettings(s=>({...s,dark:v}))} 
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Auto-switch Modes</span>
                      <Switch 
                        checked={settings.autoSwitch} 
                        onCheckedChange={v=>setSettings(s=>({...s,autoSwitch:v}))} 
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Show Quotes</span>
                      <Switch 
                        checked={settings.showQuotes} 
                        onCheckedChange={v=>setSettings(s=>({...s,showQuotes:v}))} 
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Confetti Animation</span>
                      <Switch 
                        checked={settings.enableConfetti} 
                        onCheckedChange={v=>setSettings(s=>({...s,enableConfetti:v}))} 
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Keyboard Shortcuts</span>
                      <Switch 
                        checked={settings.keyboardShortcuts} 
                        onCheckedChange={v=>setSettings(s=>({...s,keyboardShortcuts:v}))} 
                      />
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Theme</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {THEMES.map(theme => (
                          <Button 
                            key={theme.key}
                            onClick={() => setSettings(s => ({...s, theme: theme.key}))}
                            variant={settings.theme === theme.key ? "default" : "outline"}
                            size="sm"
                          >
                            {theme.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        
        {/* Main Timer Card */}
        <Card className="w-full max-w-md mx-auto shadow-2xl backdrop-blur-xl bg-background/25 border border-white/20 rounded-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-3xl font-bold mb-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200">
                Pomodoro Timer
              </span>
            </CardTitle>
            <div className="flex justify-center gap-2 mb-2">
              {MODES.map(m => (
                <Button 
                  key={m.key} 
                  variant={mode===m.key ? "default" : "outline"}
                  className={`rounded-full px-4 transition-all duration-300 ${mode===m.key ? `bg-${m.color}` : 'bg-white/10 backdrop-filter backdrop-blur-sm'}`}
                  onClick={()=>switchMode(m.key as any)}
                >
                  {m.label}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              {/* Timer Ring */}
              <div className="relative my-6 select-none">
                <svg width="240" height="240" className="drop-shadow-lg">
                  {/* Background ring */}
                  <circle cx="120" cy="120" r="105" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="18" />
                  
                  {/* Gradient definition for progress */}
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      {mode === 'work' && (
                        <>
                          <stop offset="0%" stopColor="#ef4444" />
                          <stop offset="100%" stopColor="#f97316" />
                        </>
                      )}
                      {mode === 'short' && (
                        <>
                          <stop offset="0%" stopColor="#22c55e" />
                          <stop offset="100%" stopColor="#10b981" />
                        </>
                      )}
                      {mode === 'long' && (
                        <>
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </>
                      )}
                    </linearGradient>
                  </defs>
                  
                  {/* Progress ring with gradient */}
                  <circle
                    cx="120" cy="120" r="105"
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="18"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 105}
                    strokeDashoffset={2 * Math.PI * 105 * (1 - percent / 100)}
                    transform="rotate(-90 120 120)"
                    style={{
                      transition: 'stroke-dashoffset 0.5s cubic-bezier(.4,2,.6,1)',
                      filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))'
                    }}
                  />
                </svg>
                
                {/* Digital clock */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-6xl font-mono font-bold text-white drop-shadow-md">
                    {fmt(timeLeft)}
                  </span>
                  <span className="text-white/80 mt-2 text-lg font-medium">
                    {MODES.find(m=>m.key===mode)?.label}
                  </span>
                </div>
              </div>
              
              {/* Quote during breaks */}
              {mode !== 'work' && settings.showQuotes && (
                <div className="mb-6 px-4 py-3 bg-white/10 backdrop-blur-sm rounded-xl text-white text-center">
                  <p className="italic">{quote}</p>
                </div>
              )}
              
              {/* Controls */}
              <div className="flex gap-4 mb-6 mt-2">
                {isRunning ? (
                  <Button 
                    onClick={pause} 
                    size="lg" 
                    className="bg-amber-500/90 hover:bg-amber-500 backdrop-blur-sm text-white rounded-full px-8 shadow-lg"
                  >
                    <Pause className="mr-2 h-4 w-4" /> Pause
                  </Button>
                ) : (
                  <Button 
                    onClick={start} 
                    size="lg" 
                    className="bg-emerald-500/90 hover:bg-emerald-500 backdrop-blur-sm text-white rounded-full px-8 shadow-lg"
                  >
                    <Play className="mr-2 h-4 w-4" /> Start
                  </Button>
                )}
                <Button 
                  onClick={reset} 
                  size="lg" 
                  variant="outline" 
                  className="rounded-full px-6 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 text-white"
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Reset
                </Button>
              </div>
              
              {/* Keyboard shortcuts info */}
              {settings.keyboardShortcuts && (
                <div className="flex gap-3 justify-center mb-4 text-white/60 text-xs">
                  <div>Space: Start/Pause</div>
                  <div>R: Reset</div>
                  <div>M: Mute</div>
                </div>
              )}
              
              {/* Weekly Chart */}
              <div className="w-full mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <h3 className="text-sm font-medium text-white/80 mb-2">Weekly Progress</h3>
                <div className="flex justify-between items-end h-20">
                  {chartDays.map((day, i) => {
                    const val = chartVals[i];
                    const height = val ? Math.max(15, (val / maxVal) * 100) : 4;
                    const isToday = day === getToday();
                    
                    return (
                      <div key={day} className="flex flex-col items-center">
                        <div 
                          className={`w-6 rounded-t-md ${isToday 
                            ? 'bg-gradient-to-t from-primary to-primary-light' 
                            : 'bg-white/20'}`}
                          style={{ height: `${height}%` }}
                        />
                        <div className="text-xs mt-1 text-white/70">
                          {new Date(day).toLocaleDateString(undefined, {weekday: 'short'}).substring(0, 2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
