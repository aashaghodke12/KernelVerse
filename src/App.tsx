import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { VoiceNarratorWidget } from './components/common/VoiceNarratorWidget';
import { SearchModal } from './components/common/SearchModal';
import { SettingsModal } from './components/common/SettingsModal';
import { DashboardView } from './features/dashboard/DashboardView';
import { BankerLabView } from './features/banker/BankerLabView';
import { CpuSchedulingView } from './features/cpu-scheduling/CpuSchedulingView';
import { MemoryAllocationView } from './features/memory-allocation/MemoryAllocationView';
import { PageReplacementView } from './features/page-replacement/PageReplacementView';
import { SynchronizationView } from './features/synchronization/SynchronizationView';
import { ResourceAllocationGraphView } from './features/deadlock-rag/ResourceAllocationGraphView';
import { ProcessManagementView } from './features/process-management/ProcessManagementView';
import { DiskSchedulingView } from './features/disk-scheduling/DiskSchedulingView';
import { MemoryPalaceView } from './features/memory-palace/MemoryPalaceView';
import { QuizArenaView } from './features/quiz-arena/QuizArenaView';
import { LeaderboardView } from './features/leaderboard/LeaderboardView';
import { HandwrittenNotesView } from './features/handwritten-notes/HandwrittenNotesView';
import { progressService } from './services/progressService';
import { speechService } from './services/speechService';
import { UserProgress } from './types';

// Scroll to top and track last visited path on route changes
const RouteTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    progressService.setLastVisitedPath(location.pathname);
    // Cancel or stop speech when navigating away from a lesson as requested in prompt!
    speechService.stop();
  }, [location.pathname]);

  return null;
};

export const App: React.FC = () => {
  const [progress, setProgress] = useState<UserProgress>(progressService.getProgress());
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(speechService.getSettings().enabled);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsub = progressService.subscribe(newProgress => {
      setProgress(newProgress);
    });
    return () => unsub();
  }, []);

  const handleToggleVoice = () => {
    const next = !isVoiceActive;
    speechService.updateSettings({ enabled: next });
    setIsVoiceActive(next);
  };

  return (
    <BrowserRouter>
      <RouteTracker />
      <div className="flex min-h-screen bg-background text-text-main font-sans selection:bg-blue-100 selection:text-blue-900">
        {/* Sidebar */}
        <Sidebar
          progress={progress}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar
            progress={progress}
            isVoiceActive={isVoiceActive}
            onToggleVoice={handleToggleVoice}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
          />

          <main className="flex-1 pb-16">
            <Routes>
              {/* Home / Dashboard */}
              <Route path="/" element={<DashboardView progress={progress} />} />
              <Route path="/dashboard" element={<Navigate to="/" replace />} />

              {/* Core Banker Lab */}
              <Route path="/banker" element={<BankerLabView />} />

              {/* Additional OS Simulators */}
              <Route path="/simulators/cpu-scheduling" element={<CpuSchedulingView />} />
              <Route path="/simulators/memory-allocation" element={<MemoryAllocationView />} />
              <Route path="/simulators/page-replacement" element={<PageReplacementView />} />
              <Route path="/simulators/synchronization" element={<SynchronizationView />} />
              <Route path="/simulators/resource-graph" element={<ResourceAllocationGraphView />} />
              <Route path="/simulators/process-management" element={<ProcessManagementView />} />
              <Route path="/simulators/disk-scheduling" element={<DiskSchedulingView />} />

              {/* Gamification & Learning Extensions */}
              <Route path="/memory-palace" element={<MemoryPalaceView />} />
              <Route path="/quiz-arena" element={<QuizArenaView />} />
              <Route path="/leaderboard" element={<LeaderboardView />} />
              <Route path="/handwritten-notes" element={<HandwrittenNotesView />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        {/* Docked Floating Voice Assistant */}
        <VoiceNarratorWidget />

        {/* Global Modals */}
        <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onProgressReset={() => setProgress(progressService.getProgress())}
        />
      </div>
    </BrowserRouter>
  );
};

export default App;
