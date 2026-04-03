import { useState, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  Map, 
  Terminal, 
  Activity, 
  Cpu, 
  Zap, 
  TrendingDown, 
  AlertTriangle, 
  ShieldAlert, 
  Settings,
  ChevronRight,
  Wifi,
  Users,
  Thermometer,
  Battery,
  Lightbulb,
  Clock,
  Search,
  X,
  Maximize2,
  BarChart3,
  Calendar
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { cn } from "@/src/lib/utils";

// --- Mock Data ---
const energyData = [
  { time: "00:00", optimized: 20, baseline: 25 },
  { time: "04:00", optimized: 18, baseline: 25 },
  { time: "08:00", optimized: 45, baseline: 50 },
  { time: "12:00", optimized: 42, baseline: 50 },
  { time: "16:00", optimized: 48, baseline: 50 },
  { time: "20:00", optimized: 35, baseline: 40 },
  { time: "23:59", optimized: 22, baseline: 25 },
];

const hvacData = [
  { name: "Chillers", value: 85, color: "#7000ff" },
  { name: "VAV Boxes", value: 45, color: "#00f2ff" },
  { name: "Exhaust", value: 15, color: "#ffb800" },
  { name: "Pumps", value: 25, color: "#ff4b4b" },
];

const zones = [
  { id: "north", name: "North Wing", devices: 31, humans: 11, mode: "Comfort", status: "Active" },
  { id: "south", name: "South Open Plan", devices: 2, humans: 0, mode: "Deep Save", status: "Eco" },
  { id: "exec", name: "Exec Suite", devices: 14, humans: 5, mode: "Eco-Mode", status: "Active" },
  { id: "cafe", name: "Cafeteria", devices: 3, humans: 1, mode: "Override", status: "Manual" },
  { id: "conf-a", name: "Conf Room A", devices: 26, humans: 9, mode: "Comfort", status: "Active" },
  { id: "conf-b", name: "Conf Room B", devices: 18, humans: 6, mode: "Comfort", status: "Active" },
];

const logs = [
  { time: "10:18", type: "alert", message: "Zone 'Cafeteria': Tenant reported discomfort. Reverting to Max Comfort." },
  { time: "10:18", type: "info", message: "Zone 'South Open Plan': Vacancy confirmed. Engaging Deep Save." },
  { time: "10:15", type: "success", message: "System optimization cycle complete. Efficiency +12%." },
  { time: "10:12", type: "info", message: "Micro-Zone mapping updated for floor 4." },
];

const sensors = [
  // Floor 1 (Lobby)
  { name: "Reception", floor: 1, status: "Active", motion: "Detected", events: 45, light: 550, presence: 95, temp: 23.5, humidity: 45, battery: 98 },
  { name: "Main Lobby", floor: 1, status: "Active", motion: "Detected", events: 120, light: 600, presence: 80, temp: 23.8, humidity: 48, battery: 95 },
  { name: "Cafeteria", floor: 1, status: "Active", motion: "Detected", events: 85, light: 450, presence: 60, temp: 22.5, humidity: 50, battery: 92 },
  // Floor 2 (Executive)
  { name: "Exec Boardroom", floor: 2, status: "Active", motion: "Detected", events: 12, light: 400, presence: 90, temp: 22.0, humidity: 42, battery: 90 },
  { name: "Exec Office 1", floor: 2, status: "Eco", motion: "No Motion", events: 2, light: 150, presence: 5, temp: 21.5, humidity: 40, battery: 88 },
  // Floor 3 (Development)
  { name: "Dev Lab 1", floor: 3, status: "Active", motion: "Detected", events: 30, light: 450, presence: 85, temp: 21.0, humidity: 55, battery: 85 },
  { name: "Dev Lab 2", floor: 3, status: "Active", motion: "Detected", events: 25, light: 420, presence: 80, temp: 21.2, humidity: 52, battery: 82 },
  // Floor 4 (Standard)
  { name: "Conference A", floor: 4, status: "Active", motion: "Detected", events: 9, light: 326, presence: 89, temp: 24.4, humidity: 61, battery: 80 },
  { name: "Hot Desk 1", floor: 4, status: "Eco", motion: "Detected", events: 18, light: 245, presence: 97, temp: 23.2, humidity: 40, battery: 79 },
  { name: "Boardroom", floor: 4, status: "Offline", motion: "No Motion", events: 0, light: 54, presence: 5, temp: 23.9, humidity: 52, battery: 87 },
  { name: "Hallway", floor: 4, status: "Active", motion: "Detected", events: 11, light: 296, presence: 95, temp: 23.5, humidity: 46, battery: 89 },
  { name: "Cafeteria", floor: 4, status: "Manual", motion: "Detected", events: 11, light: 228, presence: 95, temp: 22.6, humidity: 44, battery: 77 },
  { name: "Lab", floor: 4, status: "Active", motion: "Detected", events: 7, light: 438, presence: 93, temp: 21.5, humidity: 62, battery: 85 },
  // Floor 5 (Executive)
  { name: "Executive Suite", floor: 5, status: "Active", motion: "Detected", events: 4, light: 410, presence: 98, temp: 22.1, humidity: 45, battery: 92 },
  { name: "Open Office B", floor: 5, status: "Eco", motion: "No Motion", events: 2, light: 180, presence: 10, temp: 23.0, humidity: 48, battery: 88 },
];

const occupancyHeatMap = [
  // Floor 1
  { zone: "Reception", floor: 1, data: Array.from({ length: 24 }, () => Math.floor(Math.random() * 100)) },
  { zone: "Main Lobby", floor: 1, data: Array.from({ length: 24 }, () => Math.floor(Math.random() * 100)) },
  { zone: "Cafeteria", floor: 1, data: Array.from({ length: 24 }, () => Math.floor(Math.random() * 100)) },
  // Floor 2
  { zone: "Exec Boardroom", floor: 2, data: Array.from({ length: 24 }, () => Math.floor(Math.random() * 100)) },
  { zone: "Exec Office 1", floor: 2, data: Array.from({ length: 24 }, () => Math.floor(Math.random() * 100)) },
  // Floor 3
  { zone: "Dev Lab 1", floor: 3, data: Array.from({ length: 24 }, () => Math.floor(Math.random() * 100)) },
  { zone: "Dev Lab 2", floor: 3, data: Array.from({ length: 24 }, () => Math.floor(Math.random() * 100)) },
  // Floor 4
  { zone: "Conference A", floor: 4, data: [0, 1, 1, 2, 2, 3, 2, 2, 12, 1, 17, 20, 6, 4, 18, 8, 21, 3, 73, 2, 3, 3, 0, 2] },
  { zone: "Hot Desk 1", floor: 4, data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { zone: "Boardroom", floor: 4, data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { zone: "Hallway", floor: 4, data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { zone: "Cafeteria", floor: 4, data: [1, 2, 2, 1, 0, 2, 2, 2, 12, 11, 6, 12, 12, 13, 9, 17, 9, 8, 15, 2, 2, 1, 1, 1] },
  { zone: "Lab", floor: 4, data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  // Floor 5
  { zone: "Executive Suite", floor: 5, data: [0, 0, 0, 0, 0, 0, 0, 1, 5, 8, 12, 15, 10, 2, 14, 18, 12, 5, 2, 0, 0, 0, 0, 0] },
  { zone: "Open Office B", floor: 5, data: [0, 0, 0, 0, 0, 0, 0, 4, 12, 25, 30, 35, 28, 15, 32, 40, 35, 20, 10, 2, 0, 0, 0, 0] },
];

const floorZones: Record<number, Record<string, { x: number, y: number, w: number, h: number }>> = {
  1: {
    "Reception": { x: 10, y: 10, w: 100, h: 35 },
    "Main Lobby": { x: 10, y: 55, w: 100, h: 35 },
    "Cafeteria": { x: 120, y: 10, w: 170, h: 80 },
  },
  2: {
    "Exec Boardroom": { x: 10, y: 10, w: 150, h: 80 },
    "Exec Office 1": { x: 170, y: 10, w: 120, h: 35 },
    "Exec Office 2": { x: 170, y: 55, w: 120, h: 35 },
  },
  3: {
    "Dev Lab 1": { x: 10, y: 10, w: 90, h: 80 },
    "Dev Lab 2": { x: 110, y: 10, w: 90, h: 80 },
    "Meeting Room C": { x: 210, y: 10, w: 80, h: 80 },
  },
  4: {
    "Conference A": { x: 10, y: 10, w: 80, h: 40 },
    "Hot Desk 1": { x: 100, y: 10, w: 60, h: 40 },
    "Boardroom": { x: 170, y: 10, w: 120, h: 40 },
    "Hallway": { x: 10, y: 55, w: 280, h: 10 },
    "Cafeteria": { x: 10, y: 70, w: 140, h: 20 },
    "Lab": { x: 160, y: 70, w: 130, h: 20 },
  },
  5: {
    "Executive Suite": { x: 15, y: 15, w: 120, h: 30 },
    "Open Office B": { x: 150, y: 15, w: 135, h: 60 },
    "Hallway": { x: 15, y: 50, w: 120, h: 10 },
  }
};

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
      active ? "bg-aura-primary/10 text-aura-primary border border-aura-primary/20" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
    )}
  >
    <Icon className={cn("w-5 h-5", active ? "text-aura-primary" : "text-slate-500 group-hover:text-slate-300")} />
    <span className="font-medium text-sm">{label}</span>
    {active && <motion.div layoutId="active-pill" className="ml-auto w-1 h-4 bg-aura-primary rounded-full" />}
  </button>
);

const Card = ({ title, subtitle, children, className }: { title: string, subtitle?: string, children: ReactNode, className?: string, key?: any }) => (
  <div className={cn("glass-card p-6 flex flex-col", className)}>
    <div className="mb-6">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-slate-600 font-mono">{subtitle}</p>}
    </div>
    <div className="flex-1">
      {children}
    </div>
  </div>
);

const StatCard = ({ label, value, unit, trend, trendValue, color }: { label: string, value: string, unit?: string, trend?: "up" | "down", trendValue?: string, color?: string }) => (
  <div className="glass-card p-6 relative overflow-hidden group">
    <div className="absolute top-0 right-0 w-24 h-24 bg-aura-primary/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-aura-primary/10 transition-all" />
    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">{label}</p>
    <div className="flex items-baseline gap-2 mb-4">
      <span className="text-4xl font-mono font-bold text-white glow-text">{value}</span>
      {unit && <span className="text-sm font-medium text-slate-500">{unit}</span>}
    </div>
    {trend && (
      <div className={cn("flex items-center gap-1.5 text-xs font-bold", trend === "down" ? "text-aura-success" : "text-aura-danger")}>
        {trend === "down" ? <TrendingDown className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
        <span>{trendValue}</span>
        <span className="text-slate-600 font-normal ml-1">vs Static BMS</span>
      </div>
    )}
  </div>
);

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedSensor, setSelectedSensor] = useState<typeof sensors[0] | null>(null);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [mlDeviceRatio] = useState(2.45);
  const [efficiencyScore] = useState(55);
  
  // Interactive States
  const [isAiEnabled, setIsAiEnabled] = useState(true);
  const [systemZones, setSystemZones] = useState(zones);
  const [systemLogs, setSystemLogs] = useState(logs);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  const [isOutlookConnected, setIsOutlookConnected] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [activeAiCommands, setActiveAiCommands] = useState<any[]>([]);

  useEffect(() => {
    const fetchCalendarData = async () => {
      if (!isOutlookConnected) {
        try {
          const res = await fetch("/api/calendar/csv");
          const data = await res.json();
          setCalendarEvents(data.events);
        } catch (e) {
          console.error("Failed to fetch CSV calendar data", e);
        }
      }
    };
    fetchCalendarData();
  }, [isOutlookConnected]);

  useEffect(() => {
    // Logic to scan events and trigger pre-cooling
    const scanForPreCooling = () => {
      const now = new Date();
      const commands: any[] = [];
      
      calendarEvents.forEach((event, i) => {
        const startTime = new Date(event.start);
        const diffMinutes = (startTime.getTime() - now.getTime()) / (1000 * 60);
        
        // If meeting starts in 15-30 minutes, trigger pre-cooling
        if (diffMinutes > 0 && diffMinutes <= 30) {
          const attendeeCount = event.attendees || 10;
          commands.push({
            id: `vav-${event.subject}-${i}`,
            target: event.location || "Zone 04 (Meeting Room)",
            action: "VAV Pre-cooling",
            status: "Active",
            reason: `Predicted occupancy: ${attendeeCount} persons at ${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            startTime: new Date(startTime.getTime() - 15 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }
      });
      
      setActiveAiCommands(commands);
      
      // Log new commands
      commands.forEach(cmd => {
        const logExists = systemLogs.some(l => l.message.includes(cmd.target) && l.message.includes("VAV Pre-cooling"));
        if (!logExists) {
          const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
          setSystemLogs(prev => [{
            time,
            type: "success",
            message: `AI PREDICTIVE: Sending VAV Pre-cooling command to ${cmd.target}. Occupancy detected in 15m.`
          }, ...prev]);
        }
      });
    };

    if (calendarEvents.length > 0) {
      scanForPreCooling();
      const interval = setInterval(scanForPreCooling, 60000); // Scan every minute
      return () => clearInterval(interval);
    }
  }, [calendarEvents]);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await fetch("/api/auth/status");
        const data = await res.json();
        setIsOutlookConnected(data.connected);
        if (data.connected) {
          fetchCalendarEvents();
        }
      } catch (e) {
        console.error("Auth status check failed", e);
      }
    };
    checkAuthStatus();

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setIsOutlookConnected(true);
        fetchCalendarEvents();
        showToast("Microsoft Outlook Connected!", "success");
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const fetchCalendarEvents = async () => {
    try {
      const res = await fetch("/api/calendar/events");
      if (res.ok) {
        const data = await res.json();
        setCalendarEvents(data.events);
      }
    } catch (e) {
      console.error("Failed to fetch events", e);
    }
  };

  const handleConnectOutlook = async () => {
    try {
      const res = await fetch("/api/auth/url");
      const { url } = await res.json();
      window.open(url, "outlook_oauth", "width=600,height=700");
    } catch (e) {
      showToast("Failed to initiate connection", "error");
    }
  };

  const handleDisconnectOutlook = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsOutlookConnected(false);
      setCalendarEvents([]);
      showToast("Outlook Disconnected", "info");
    } catch (e) {
      showToast("Failed to disconnect", "error");
    }
  };

  // Settings States
  const [settings, setSettings] = useState({
    tempThreshold: 24,
    humidityThreshold: 50,
    notifications: true,
    autoOptimization: true,
    refreshInterval: 30,
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleGlobalAI = () => {
    const newState = !isAiEnabled;
    setIsAiEnabled(newState);
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const message = newState ? "AURA-IQ System Reactivated." : "WARNING: AI Disabled. Reverting to Static Schedule.";
    
    setSystemLogs(prev => [{
      time,
      type: newState ? "success" : "alert",
      message: newState ? "AURA-IQ System Reactivated by Admin." : "EMERGENCY OVERRIDE: AURA-IQ Disabled globally."
    }, ...prev]);

    showToast(message, newState ? 'success' : 'error');
  };

  const overrideZone = (zoneId: string, newMode: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const zone = systemZones.find(z => z.id === zoneId);
    if (!zone) return;

    setSystemZones(prev => prev.map(z => 
      z.id === zoneId ? { ...z, mode: newMode, status: newMode === "Deep Save" ? "Eco" : "Manual" } : z
    ));

    setSystemLogs(prev => [{
      time,
      type: "info",
      message: `Zone '${zone.name}': BME Manual Override initiated. Forcing ${newMode} via BACnet.`
    }, ...prev]);

    showToast(`Command sent to ${zone.name}... Success!`, 'success');
  };

  return (
    <div className="flex h-screen bg-bg-main tech-grid overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        "bg-bg-sidebar border-r border-border-subtle flex flex-col transition-all duration-300 z-50",
        isSidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-aura-primary rounded flex items-center justify-center shadow-[0_0_15px_rgba(0,242,255,0.4)]">
            <Zap className="text-bg-main w-5 h-5 fill-current" />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col">
              <span className="font-bold text-white tracking-tighter text-lg leading-none">AURA-IQ</span>
              <span className="text-[10px] font-bold text-aura-success uppercase tracking-widest mt-1">Simulator</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-2">
          <SidebarItem icon={LayoutDashboard} label="Enterprise Dashboard" active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} />
          <SidebarItem icon={Map} label="Micro-Zone Mapping" active={activeTab === "mapping"} onClick={() => setActiveTab("mapping")} />
          <SidebarItem icon={Terminal} label="Command Center" active={activeTab === "command"} onClick={() => setActiveTab("command")} />
          <SidebarItem icon={Activity} label="System Logs" active={activeTab === "logs"} onClick={() => setActiveTab("logs")} />
          <SidebarItem icon={Cpu} label="IoT Map" active={activeTab === "iot"} onClick={() => setActiveTab("iot")} />
        </nav>

        <div className="p-4 border-t border-border-subtle">
          <SidebarItem icon={Settings} label="Settings" active={activeTab === "settings"} onClick={() => setActiveTab("settings")} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <header className="sticky top-0 z-40 bg-bg-main/80 backdrop-blur-md border-b border-border-subtle px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-1 capitalize">
              {activeTab.replace("-", " ")}
            </h1>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-aura-primary">
              <div className="w-1.5 h-1.5 rounded-full bg-aura-primary animate-pulse" />
              Dynamic Data Simulator • Live Inference
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search telemetry..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/5 border border-border-subtle rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-aura-primary/50 transition-all w-64"
              />
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-border-subtle">
              <div className="text-right">
                <p className="text-xs font-bold text-white">Admin User</p>
                <p className="text-[10px] text-slate-500">System Architect</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-aura-secondary/20 border border-aura-secondary/30 flex items-center justify-center text-aura-secondary font-bold">
                AD
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard label="Daily Energy Cost" value="$157.76" unit="SGD" trend="down" trendValue="-$59.84" />
                  <Card title="ESG Efficiency Meter" subtitle="Optimization Score">
                    <div className="flex flex-col items-center justify-center h-full py-2">
                      <div className="h-40 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <defs>
                              <linearGradient id="efficiencyGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#00ff9d" stopOpacity={0.8} />
                                <stop offset="100%" stopColor="#00f2ff" stopOpacity={1} />
                              </linearGradient>
                              <filter id="glow">
                                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                                <feMerge>
                                    <feMergeNode in="coloredBlur"/>
                                    <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                              </filter>
                            </defs>
                            <Pie
                              data={[
                                { value: efficiencyScore },
                                { value: 100 - efficiencyScore }
                              ]}
                              cx="50%"
                              cy="80%"
                              startAngle={180}
                              endAngle={0}
                              innerRadius={65}
                              outerRadius={85}
                              paddingAngle={0}
                              dataKey="value"
                              stroke="none"
                            >
                              <Cell fill="url(#efficiencyGradient)" filter="url(#glow)" />
                              <Cell fill="rgba(255,255,255,0.05)" />
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 text-center">
                          <motion.span 
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-5xl font-mono font-bold text-white drop-shadow-[0_0_10px_rgba(0,242,255,0.5)]"
                          >
                            {efficiencyScore}
                            <span className="text-xl text-aura-primary ml-1">%</span>
                          </motion.span>
                        </div>
                      </div>
                      <div className="flex gap-8 mt-2">
                        <div className="text-center">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</p>
                          <p className="text-xs font-bold text-aura-success">OPTIMIZED</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target</p>
                          <p className="text-xs font-bold text-white">85%</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                  
                  <Card title="Predictive Occupancy" subtitle="Outlook Calendar Insights" className="md:row-span-2">
                    <div className="space-y-4 mt-2 h-full flex flex-col">
                      {!isOutlookConnected && calendarEvents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center flex-1">
                          <Calendar className="w-16 h-16 text-slate-700 mb-6" />
                          <p className="text-sm text-slate-500 mb-6 max-w-[200px]">Connect Outlook or add data to calendar_data.csv to enable AI-driven occupancy predictions.</p>
                          <div className="flex flex-col gap-3 w-full px-4">
                            <button 
                              onClick={handleConnectOutlook}
                              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-aura-primary hover:bg-aura-primary/10 transition-all"
                            >
                              Connect Outlook
                            </button>
                          </div>
                        </div>
                      ) : calendarEvents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center flex-1">
                          <div className="w-12 h-12 rounded-full bg-aura-success/20 flex items-center justify-center mb-4">
                            <Wifi className="w-6 h-6 text-aura-success" />
                          </div>
                          <p className="text-sm text-slate-400">No upcoming bookings detected for today.</p>
                          <p className="text-[10px] text-slate-600 mt-2 italic">AURA-IQ is monitoring for changes...</p>
                        </div>
                      ) : (
                        <div className="space-y-3 flex-1 overflow-y-auto pr-2 scrollbar-hide max-h-[520px]">
                          {calendarEvents.map((event, i) => (
                            <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-start gap-4 hover:bg-white/10 transition-all cursor-default group">
                              <div className="mt-1 w-2.5 h-2.5 rounded-full bg-aura-primary animate-pulse shadow-[0_0_10px_rgba(0,242,255,0.8)]" />
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                  <p className="text-sm font-bold text-white leading-tight group-hover:text-aura-primary transition-colors">{event.subject}</p>
                                  <span className="text-[9px] font-mono text-aura-primary bg-aura-primary/10 px-2 py-0.5 rounded border border-aura-primary/20">PREDICTED</span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <Map className="w-3.5 h-3.5 text-slate-500" />
                                  <p className="text-xs text-slate-400">{event.location || "Unspecified Room"}</p>
                                </div>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                                  <p className="text-xs text-slate-500">
                                    {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                                {(() => {
                                  const diff = (new Date(event.start).getTime() - new Date().getTime()) / (1000 * 60);
                                  if (diff > 0 && diff <= 30) {
                                    return (
                                      <motion.div 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-aura-primary/10 border border-aura-primary/30 rounded-lg"
                                      >
                                        <div className="w-2 h-2 rounded-full bg-aura-primary animate-ping" />
                                        <span className="text-[10px] font-bold text-aura-primary uppercase tracking-wider">Pre-cooling Active</span>
                                      </motion.div>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>

                  <Card title="AI Action Center" subtitle="Real-time VAV Commands">
                    <div className="space-y-3 mt-2">
                      {activeAiCommands.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center opacity-40">
                          <Cpu className="w-10 h-10 text-slate-700 mb-3" />
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">No Active AI Commands</p>
                        </div>
                      ) : (
                        activeAiCommands.map((cmd, i) => (
                          <div key={i} className="p-4 bg-aura-primary/5 border border-aura-primary/20 rounded-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                              <Zap className="w-8 h-8 text-aura-primary" />
                            </div>
                            <div className="flex justify-between items-start mb-2">
                              <p className="text-[10px] font-bold text-aura-primary uppercase tracking-widest">Command: {cmd.action}</p>
                              <span className="flex items-center gap-1 text-[9px] font-bold text-aura-success">
                                <span className="w-1 h-1 rounded-full bg-aura-success animate-pulse" />
                                EXECUTED
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-white mb-1">{cmd.target}</h4>
                            <p className="text-[10px] text-slate-400 mb-3">{cmd.reason}</p>
                            <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pt-2 border-t border-white/5">
                              <span>VAV BOX ID: #VAV-0{i+4}</span>
                              <span>SETPOINT: 21.5°C</span>
                            </div>
                          </div>
                        ))
                      )}
                      {isOutlookConnected && activeAiCommands.length > 0 && (
                        <div className="p-2 bg-white/5 rounded-lg flex items-center gap-2">
                          <Activity className="w-3 h-3 text-aura-success" />
                          <p className="text-[9px] text-slate-500">AI is dynamically adjusting VAV dampers based on CO2 prediction.</p>
                        </div>
                      )}
                    </div>
                  </Card>
                  <Card title="Active HVAC Sub-Systems">
                    <div className="h-48 mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={hvacData} 
                          layout="vertical" 
                          margin={{ left: 20, right: 20, top: 0, bottom: 0 }}
                        >
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            stroke="#94a3b8" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                            width={80}
                          />
                          <Tooltip 
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{ backgroundColor: '#12141a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                          />
                          <Bar 
                            dataKey="value" 
                            radius={[0, 10, 10, 0]} 
                            barSize={18}
                          >
                            {hvacData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>

                <Card title="Energy Balance (24-Hour Cycle)" subtitle="Predictive Demand vs Baseline">
                  <div className="h-80 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={energyData}>
                        <defs>
                          <linearGradient id="colorOptimized" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#12141a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="baseline" 
                          stroke="#475569" 
                          fill="transparent" 
                          strokeDasharray="5 5" 
                          name="Static BMS Baseline"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="optimized" 
                          stroke="#00f2ff" 
                          fillOpacity={1} 
                          fill="url(#colorOptimized)" 
                          strokeWidth={2}
                          name="AURA-IQ Optimized"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === "mapping" && (
              <motion.div 
                key="mapping"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Live Floorplan Cluster Status</h2>
                    <p className="text-sm font-medium text-white">Current ML Ratio Tuning: <span className="text-aura-primary font-mono">{mlDeviceRatio} Devices/Human</span></p>
                  </div>
                  <div className="flex gap-2">
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {systemZones.map(zone => (
                    <motion.div 
                      key={zone.id}
                      whileHover={{ scale: 1.02 }}
                      className="glass-card p-6 border-t-2"
                      style={{ borderTopColor: zone.status === "Eco" ? "#00ff9d" : zone.status === "Manual" ? "#ff4b4b" : "#00f2ff" }}
                    >
                      <h3 className="font-bold text-white mb-4">{zone.name}</h3>
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 flex items-center gap-2"><Wifi className="w-3 h-3" /> Wi-Fi Devices</span>
                          <span className="font-mono text-white">{zone.devices}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 flex items-center gap-2"><Users className="w-3 h-3" /> Est. Humans</span>
                          <span className="font-mono text-white">{zone.humans}</span>
                        </div>
                      </div>
                      <div className={cn(
                        "px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest text-center",
                        zone.mode === "Deep Save" ? "bg-aura-success/20 text-aura-success" : 
                        zone.mode === "Override" || zone.mode === "Manual" ? "bg-aura-danger/20 text-aura-danger" :
                        zone.mode === "Eco-Mode" ? "bg-aura-warning/20 text-aura-warning" :
                        "bg-aura-primary/20 text-aura-primary"
                      )}>
                        {zone.mode}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "command" && (
              <motion.div 
                key="command"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                <Card title="Global Override" className="lg:col-span-1">
                  <div className="space-y-6">
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Completely disengage AURA-IQ and return to static BMS scheduling. This action is logged and requires authorization.
                    </p>
                    <button 
                      onClick={toggleGlobalAI}
                      className={cn(
                        "w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all hover:scale-[1.02]",
                        isAiEnabled 
                          ? "bg-aura-danger text-white shadow-[0_0_20px_rgba(255,75,75,0.3)]" 
                          : "bg-aura-primary text-bg-main shadow-[0_0_20px_rgba(0,242,255,0.3)]"
                      )}
                    >
                      {isAiEnabled ? "Emergency: Disable AURA-IQ" : "Re-Enable AURA-IQ"}
                    </button>
                    <div className={cn(
                      "flex items-center gap-2 justify-center py-2 px-4 border rounded-lg transition-colors",
                      isAiEnabled 
                        ? "bg-aura-success/10 border-aura-success/20 text-aura-success" 
                        : "bg-aura-danger/10 border-aura-danger/20 text-aura-danger"
                    )}>
                      <div className={cn("w-2 h-2 rounded-full", isAiEnabled ? "bg-aura-success animate-pulse" : "bg-aura-danger")} />
                      <span className="text-xs font-bold uppercase tracking-widest">
                        Status: AI Control is {isAiEnabled ? "ACTIVE" : "DISABLED"}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card title="Zone Actuation Control" className="lg:col-span-2">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-border-subtle">
                          <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Zone ID</th>
                          <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Current AI State</th>
                          <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Manual Override (BACnet)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle">
                        {systemZones.map(zone => (
                          <tr key={zone.id} className="group">
                            <td className="py-4 font-bold text-white group-hover:text-aura-primary transition-colors">{zone.name}</td>
                            <td className="py-4">
                              <span className={cn(
                                "px-2 py-1 rounded text-[9px] font-bold uppercase tracking-tighter transition-colors",
                                zone.mode === "Deep Save" ? "bg-aura-success/20 text-aura-success" : 
                                zone.mode === "Comfort Mode" ? "bg-aura-primary/20 text-aura-primary" :
                                zone.mode === "Eco-Mode" ? "bg-aura-warning/20 text-aura-warning" :
                                "bg-aura-danger/20 text-aura-danger"
                              )}>
                                {zone.mode}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              <div className="inline-flex bg-white/5 p-1 rounded-lg border border-border-subtle">
                                {[
                                  { label: "Comfort", mode: "Comfort Mode", color: "hover:bg-aura-primary/20 hover:text-aura-primary" },
                                  { label: "Eco", mode: "Eco-Mode", color: "hover:bg-aura-warning/20 hover:text-aura-warning" },
                                  { label: "Off", mode: "Deep Save", color: "hover:bg-aura-success/20 hover:text-aura-success" }
                                ].map(m => (
                                  <button 
                                    key={m.label} 
                                    onClick={() => overrideZone(zone.id, m.mode)}
                                    className={cn(
                                      "px-3 py-1 rounded text-[10px] font-bold transition-all",
                                      zone.mode === m.mode ? "bg-white/10 text-white" : "text-slate-500",
                                      m.color
                                    )}
                                  >
                                    {m.label}
                                  </button>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === "logs" && (
              <motion.div 
                key="logs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <Card title="System Telemetry & Events">
                  <div className="space-y-4 font-mono text-xs">
                    {systemLogs.map((log, i) => (
                      <div key={i} className="flex gap-4 p-4 rounded-lg bg-white/5 border-l-2 border-border-subtle hover:bg-white/10 transition-all">
                        <span className="text-slate-600">[{log.time}]</span>
                        <div className={cn(
                          "w-2 h-2 rounded-full mt-1 shrink-0",
                          log.type === "alert" ? "bg-aura-danger" : log.type === "success" ? "bg-aura-success" : "bg-aura-primary"
                        )} />
                        <span className={cn(
                          log.type === "alert" ? "text-aura-danger" : log.type === "success" ? "text-aura-success" : "text-slate-300"
                        )}>
                          {log.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === "iot" && (
              <motion.div 
                key="iot"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8 relative"
              >
                {/* Visual Floorplan */}
                <Card 
                  title="Interactive Office Floorplan" 
                  subtitle="Real-time Zone Occupancy & Sensor Mapping"
                >
                  <div className="flex flex-wrap gap-2 mb-6 max-h-24 overflow-y-auto p-1 scrollbar-hide">
                    {Array.from({ length: 20 }).map((_, i) => {
                      const floor = i + 1;
                      return (
                        <button
                          key={floor}
                          onClick={() => setSelectedFloor(floor)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all min-w-[60px]",
                            selectedFloor === floor 
                              ? "bg-aura-primary text-bg-main shadow-[0_0_15px_rgba(0,242,255,0.3)]" 
                              : "bg-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300"
                          )}
                        >
                          L{floor}
                        </button>
                      );
                    })}
                  </div>

                  <div className="relative aspect-[3/1] w-full max-w-4xl mx-auto bg-slate-900/50 rounded-xl border border-white/5 overflow-hidden group">
                    <svg viewBox="0 0 300 100" className="w-full h-full p-4">
                      {/* Grid Lines */}
                      <defs>
                        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>
                        </pattern>
                      </defs>
                      <rect width="300" height="100" fill="url(#grid)" />
                      
                      {/* Zones */}
                      {Object.entries(floorZones[selectedFloor] || floorZones[4]).map(([name, coords]) => {
                        const sensor = sensors.find(s => s.name === name && s.floor === selectedFloor);
                        const isActive = selectedSensor?.name === name && selectedSensor?.floor === selectedFloor;
                        const isOccupied = sensor?.motion === "Detected";

                        return (
                          <motion.g 
                            key={name}
                            onClick={() => setSelectedSensor(sensor || null)}
                            className="cursor-pointer"
                            whileHover={{ scale: 1.01 }}
                          >
                            <motion.rect
                              x={coords.x}
                              y={coords.y}
                              width={coords.w}
                              height={coords.h}
                              rx="2"
                              animate={{
                                fill: isActive ? "rgba(0, 242, 255, 0.2)" : isOccupied ? "rgba(0, 255, 157, 0.05)" : "rgba(255,255,255,0.02)",
                                stroke: isActive ? "#00f2ff" : isOccupied ? "rgba(0, 255, 157, 0.3)" : "rgba(255,255,255,0.1)",
                              }}
                              strokeWidth={isActive ? "1" : "0.5"}
                              transition={{ duration: 0.3 }}
                            />
                            <text 
                              x={coords.x + coords.w / 2} 
                              y={coords.y + coords.h / 2} 
                              textAnchor="middle" 
                              className={cn(
                                "text-[3px] font-bold uppercase tracking-tighter pointer-events-none transition-colors",
                                isActive ? "fill-aura-primary" : "fill-slate-600"
                              )}
                            >
                              {name}
                            </text>
                            {isOccupied && (
                              <circle 
                                cx={coords.x + 2} 
                                cy={coords.y + 2} 
                                r="1" 
                                className="fill-aura-success animate-pulse" 
                              />
                            )}
                          </motion.g>
                        );
                      })}
                    </svg>
                    
                    {/* Map Legend */}
                    <div className="absolute bottom-4 left-4 flex gap-4 bg-bg-main/60 backdrop-blur-md px-3 py-2 rounded-lg border border-white/5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-aura-success" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Occupied</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-700" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vacant</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sensors
                    .filter(s => s.floor === selectedFloor)
                    .filter(s => 
                      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      s.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      s.motion.toLowerCase().includes(searchTerm.toLowerCase())
                    ).length > 0 ? (
                    sensors
                      .filter(s => s.floor === selectedFloor)
                      .filter(s => 
                        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        s.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        s.motion.toLowerCase().includes(searchTerm.toLowerCase())
                      ).map((sensor, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.02, y: -4 }}
                        onClick={() => setSelectedSensor(sensor)}
                        className="cursor-pointer"
                      >
                        <Card 
                          title={sensor.name} 
                          subtitle="IoT Sensor Real-Time Reading"
                          className={cn(
                            "transition-all duration-300 relative h-full",
                            selectedSensor?.name === sensor.name && selectedSensor?.floor === selectedFloor ? "border-aura-primary shadow-[0_0_20px_rgba(0,242,255,0.15)]" : "hover:border-white/20"
                          )}
                        >
                          {/* Status Indicator */}
                          <div className="absolute top-6 right-6 flex items-center gap-2">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              sensor.status === "Active" ? "bg-aura-success" :
                              sensor.status === "Eco" ? "bg-aura-warning" :
                              sensor.status === "Manual" ? "bg-aura-primary" :
                              "bg-aura-danger"
                            )} />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{sensor.status}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-y-4 gap-x-6 mt-4">
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-500 uppercase font-bold">PIR Motion</p>
                              <p className={cn("text-xs font-bold", sensor.motion === "Detected" ? "text-aura-success" : "text-aura-danger")}>{sensor.motion}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-500 uppercase font-bold">Events (1h)</p>
                              <p className="text-xs font-bold text-white font-mono">{sensor.events}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-500 uppercase font-bold">Light Level</p>
                              <p className="text-xs font-bold text-white font-mono">{sensor.light} lux</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-500 uppercase font-bold">Presence</p>
                              <p className="text-xs font-bold text-white font-mono">{sensor.presence}%</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-500 uppercase font-bold">T/H</p>
                              <p className="text-xs font-bold text-white font-mono">{sensor.temp}°C / {sensor.humidity}%</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-500 uppercase font-bold">Battery</p>
                              <div className="flex items-center gap-2">
                                <Battery className="w-3 h-3 text-aura-success" />
                                <p className="text-xs font-bold text-white font-mono">{sensor.battery}%</p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-6 pt-4 border-t border-border-subtle flex justify-between items-center">
                            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Status: {sensor.status}</span>
                            <span className="text-[10px] text-slate-600 font-mono">38s ago</span>
                          </div>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full py-24 text-center glass-card border-dashed border-white/10">
                      <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-sm">No active sensors detected on Level {selectedFloor}</p>
                    </div>
                  )}
                </div>

                <Card title="24-Hour Occupancy Heat Map By Zone" subtitle="Historical Activity Density">
                  <div className="overflow-x-auto pb-4">
                    <div className="min-w-[800px]">
                      <div className="flex mb-6 px-2">
                        <div className="w-32 shrink-0" />
                        <div className="flex-1 flex justify-between">
                          {Array.from({ length: 24 }).map((_, i) => (
                            <div key={i} className="text-[10px] font-bold text-slate-500 text-center w-8">
                              {i.toString().padStart(2, '0')}h
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-3">
                        {occupancyHeatMap.filter(row => row.floor === selectedFloor).length > 0 ? (
                          occupancyHeatMap.filter(row => row.floor === selectedFloor).map((row, i) => (
                            <div key={i} className="flex items-center group px-2">
                              <div className="w-32 shrink-0 text-xs font-bold text-slate-400 group-hover:text-white transition-colors">
                                {row.zone}
                              </div>
                              <div className="flex-1 flex justify-between">
                                {row.data.map((val, j) => (
                                  <motion.div 
                                    key={j}
                                    whileHover={{ scale: 1.1, zIndex: 10 }}
                                    className={cn(
                                      "w-8 h-8 rounded-md flex items-center justify-center text-[10px] font-bold font-mono transition-all duration-200",
                                      val === 0 ? "bg-white/5 text-slate-800 border border-white/5" : "text-white",
                                      val > 85 ? "bg-red-600/50 border border-red-400/30" :
                                      val > 70 ? "bg-orange-600/50 border border-orange-400/30" :
                                      val > 50 ? "bg-amber-600/50 border border-amber-400/30" :
                                      val > 30 ? "bg-blue-600/50 border border-blue-400/30" :
                                      val > 15 ? "bg-cyan-600/50 border border-cyan-400/30" :
                                      val > 0 ? "bg-emerald-600/50 border border-emerald-400/30" : ""
                                    )}
                                  >
                                    {val}
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-12 text-center glass-card mx-2">
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No historical data available for Level {selectedFloor}</p>
                          </div>
                        )}
                      </div>

                      {/* Heat Map Legend */}
                      <div className="mt-10 pt-8 border-t border-white/5 flex flex-wrap gap-8 px-2">
                        <div className="flex items-center gap-3 group cursor-help">
                          <div className="w-5 h-5 rounded bg-emerald-600/50 border border-emerald-400/30" />
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Optimal</span>
                            <span className="text-[8px] font-bold text-emerald-400 uppercase">0-15 Persons</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 group cursor-help">
                          <div className="w-5 h-5 rounded bg-cyan-600/50 border border-cyan-400/30" />
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Low</span>
                            <span className="text-[8px] font-bold text-cyan-400 uppercase">16-30 Persons</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 group cursor-help">
                          <div className="w-5 h-5 rounded bg-blue-600/50 border border-blue-400/30" />
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Moderate</span>
                            <span className="text-[8px] font-bold text-blue-400 uppercase">31-50 Persons</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 group cursor-help">
                          <div className="w-5 h-5 rounded bg-amber-600/50 border border-amber-400/30" />
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">High</span>
                            <span className="text-[8px] font-bold text-amber-400 uppercase">51-70 Persons</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 group cursor-help">
                          <div className="w-5 h-5 rounded bg-orange-600/50 border border-orange-400/30" />
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Very High</span>
                            <span className="text-[8px] font-bold text-orange-400 uppercase">71-85 Persons</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 group cursor-help">
                          <div className="w-5 h-5 rounded bg-red-600/50 border border-red-400/30" />
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Critical</span>
                            <span className="text-[8px] font-bold text-red-400 uppercase">86+ Persons</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 group cursor-help">
                          <div className="w-5 h-5 rounded bg-white/5 border border-white/10" />
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Vacant</span>
                            <span className="text-[8px] font-bold text-slate-600 uppercase">0 Persons</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Detail Side Panel */}
                <AnimatePresence>
                  {selectedSensor && (
                    <>
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedSensor(null)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                      />
                      <motion.div 
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-bg-sidebar border-l border-border-subtle z-[70] shadow-2xl overflow-y-auto"
                      >
                        <div className="p-8 space-y-8">
                          <div className="flex justify-between items-start">
                            <div>
                              <h2 className="text-2xl font-bold text-white tracking-tight">{selectedSensor.name}</h2>
                              <p className="text-xs text-aura-primary font-bold uppercase tracking-widest mt-1">Sensor Node ID: SN-00{sensors.indexOf(selectedSensor) + 1}</p>
                            </div>
                            <button 
                              onClick={() => setSelectedSensor(null)}
                              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            >
                              <X className="w-5 h-5 text-slate-500" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="glass-card p-4 space-y-1">
                              <p className="text-[10px] text-slate-500 uppercase font-bold">Temperature</p>
                              <div className="flex items-center gap-2">
                                <Thermometer className="w-4 h-4 text-aura-warning" />
                                <span className="text-xl font-mono font-bold text-white">{selectedSensor.temp}°C</span>
                              </div>
                            </div>
                            <div className="glass-card p-4 space-y-1">
                              <p className="text-[10px] text-slate-500 uppercase font-bold">Humidity</p>
                              <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-aura-primary" />
                                <span className="text-xl font-mono font-bold text-white">{selectedSensor.humidity}%</span>
                              </div>
                            </div>
                          </div>

                          <Card title="Historical Temperature Trend" subtitle="Last 6 Hours Telemetry">
                            <div className="h-48 w-full mt-4">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={[
                                  { time: "09:00", val: selectedSensor.temp - 1.2 },
                                  { time: "10:00", val: selectedSensor.temp - 0.8 },
                                  { time: "11:00", val: selectedSensor.temp - 0.2 },
                                  { time: "12:00", val: selectedSensor.temp },
                                  { time: "13:00", val: selectedSensor.temp + 0.4 },
                                  { time: "14:00", val: selectedSensor.temp + 0.1 },
                                ]}>
                                  <defs>
                                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#ffb800" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#ffb800" stopOpacity={0}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                  <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                                  <Tooltip contentStyle={{ backgroundColor: '#12141a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                                  <Area type="monotone" dataKey="val" stroke="#ffb800" fill="url(#colorTemp)" strokeWidth={2} />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          </Card>

                          <div className="space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Advanced Diagnostics</h3>
                            <div className="space-y-2">
                              {[
                                { label: "Signal Strength", val: "-64 dBm", status: "Excellent" },
                                { label: "Uptime", val: "14d 02h 11m", status: "Nominal" },
                                { label: "Firmware", val: "v2.4.1-stable", status: "Up to date" },
                                { label: "Last Calibration", val: "2024-03-15", status: "Valid" },
                              ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
                                  <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">{item.label}</p>
                                    <p className="text-xs font-mono font-bold text-white">{item.val}</p>
                                  </div>
                                  <span className="text-[9px] font-bold uppercase px-2 py-1 bg-aura-success/20 text-aura-success rounded">
                                    {item.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
            {activeTab === "settings" && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card title="System Thresholds" subtitle="Configure environmental triggers">
                    <div className="space-y-6 mt-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <label className="text-xs font-bold text-slate-400 uppercase">Target Temperature</label>
                          <span className="text-xs font-mono text-aura-primary">{settings.tempThreshold}°C</span>
                        </div>
                        <input 
                          type="range" 
                          min="16" 
                          max="30" 
                          value={settings.tempThreshold}
                          onChange={(e) => setSettings({...settings, tempThreshold: parseInt(e.target.value)})}
                          className="w-full accent-aura-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <label className="text-xs font-bold text-slate-400 uppercase">Humidity Limit</label>
                          <span className="text-xs font-mono text-aura-primary">{settings.humidityThreshold}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="30" 
                          max="70" 
                          value={settings.humidityThreshold}
                          onChange={(e) => setSettings({...settings, humidityThreshold: parseInt(e.target.value)})}
                          className="w-full accent-aura-primary"
                        />
                      </div>
                    </div>
                  </Card>

                  <Card title="Automation & Logic" subtitle="AI behavior settings">
                    <div className="space-y-4 mt-4">
                      {[
                        { id: 'autoOptimization', label: 'Auto-Optimization', desc: 'Allow AI to adjust HVAC based on occupancy' },
                        { id: 'notifications', label: 'System Notifications', desc: 'Receive alerts for threshold breaches' },
                      ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                          <div>
                            <p className="text-sm font-bold text-white">{item.label}</p>
                            <p className="text-[10px] text-slate-500">{item.desc}</p>
                          </div>
                          <button 
                            onClick={() => setSettings({...settings, [item.id]: !settings[item.id as keyof typeof settings]})}
                            className={cn(
                              "w-10 h-5 rounded-full transition-all relative",
                              settings[item.id as keyof typeof settings] ? "bg-aura-primary" : "bg-slate-700"
                            )}
                          >
                            <div className={cn(
                              "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                              settings[item.id as keyof typeof settings] ? "left-6" : "left-1"
                            )} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card title="API Configuration" subtitle="BACnet & IoT Endpoints">
                    <div className="space-y-4 mt-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Primary BACnet Gateway</label>
                        <input type="text" defaultValue="192.168.1.105" className="w-full bg-white/5 border border-border-subtle rounded-lg px-4 py-2 text-sm font-mono text-white focus:border-aura-primary/50 outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">MQTT Broker URL</label>
                        <input type="text" defaultValue="mqtt://broker.aura-iq.internal" className="w-full bg-white/5 border border-border-subtle rounded-lg px-4 py-2 text-sm font-mono text-white focus:border-aura-primary/50 outline-none" />
                      </div>
                    </div>
                  </Card>

                  <Card title="User Management" subtitle="Access control & roles">
                    <div className="space-y-4 mt-4">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-aura-primary/20 flex items-center justify-center text-aura-primary text-xs font-bold">AD</div>
                          <div>
                            <p className="text-xs font-bold text-white">Admin User</p>
                            <p className="text-[10px] text-slate-500">System Architect</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold uppercase px-2 py-1 bg-aura-primary/20 text-aura-primary rounded">Owner</span>
                      </div>
                      <button className="w-full py-2 border border-dashed border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-aura-primary hover:border-aura-primary/50 transition-all">
                        + Add Team Member
                      </button>
                    </div>
                  </Card>

                  <Card title="Integrations" subtitle="External Data Sources">
                    <div className="space-y-4 mt-4">
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#0078d4]/20 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-[#0078d4]" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">Microsoft Outlook</p>
                            <p className="text-[10px] text-slate-500">Predictive Occupancy Control</p>
                          </div>
                        </div>
                        <button 
                          onClick={isOutlookConnected ? handleDisconnectOutlook : handleConnectOutlook}
                          className={cn(
                            "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                            isOutlookConnected 
                              ? "bg-aura-danger/10 text-aura-danger border border-aura-danger/20 hover:bg-aura-danger/20" 
                              : "bg-aura-primary/10 text-aura-primary border border-aura-primary/20 hover:bg-aura-primary/20"
                          )}
                        >
                          {isOutlookConnected ? "Disconnect" : "Connect"}
                        </button>
                      </div>
                      {isOutlookConnected && (
                        <div className="p-3 bg-aura-success/5 border border-aura-success/20 rounded-lg flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-aura-success animate-pulse" />
                          <p className="text-[10px] text-aura-success font-medium">AURA-IQ is currently syncing calendar data.</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
                
                <div className="flex justify-end gap-4">
                  <button className="px-6 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-all">Discard Changes</button>
                  <button 
                    onClick={() => showToast("Settings saved successfully!", "success")}
                    className="px-8 py-2 bg-aura-primary text-bg-main rounded-lg text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(0,242,255,0.3)] hover:scale-105 transition-all"
                  >
                    Save Configuration
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 20 }}
            className={cn(
              "fixed top-8 right-8 z-[100] px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3",
              toast.type === 'success' ? "bg-aura-success/20 border-aura-success/30 text-aura-success" :
              toast.type === 'error' ? "bg-aura-danger/20 border-aura-danger/30 text-aura-danger" :
              "bg-aura-primary/20 border-aura-primary/30 text-aura-primary"
            )}
          >
            <div className={cn("w-2 h-2 rounded-full", 
              toast.type === 'success' ? "bg-aura-success" :
              toast.type === 'error' ? "bg-aura-danger" :
              "bg-aura-primary"
            )} />
            <span className="font-bold text-sm tracking-wide">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
