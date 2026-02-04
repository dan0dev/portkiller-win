import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PortInfo, Settings, ViewMode, SortConfig } from '../types';

interface AppState {
  // Ports data
  ports: PortInfo[];
  setPorts: (ports: PortInfo[]) => void;

  // Selection
  selectedPort: PortInfo | null;
  setSelectedPort: (port: PortInfo | null) => void;

  // Favorites
  favorites: number[];
  addFavorite: (port: number) => void;
  removeFavorite: (port: number) => void;
  isFavorite: (port: number) => boolean;

  // Watch list
  watchedPorts: number[];
  addWatched: (port: number) => void;
  removeWatched: (port: number) => void;
  isWatched: (port: number) => boolean;

  // Filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterType: string | null;
  setFilterType: (type: string | null) => void;

  // View
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  sortConfig: SortConfig;
  setSortConfig: (config: SortConfig) => void;

  // Settings
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;

  // UI state
  isRefreshing: boolean;
  setIsRefreshing: (refreshing: boolean) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;

  // Sidebar
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Ports
      ports: [],
      setPorts: (ports) => set({ ports }),

      // Selection
      selectedPort: null,
      setSelectedPort: (port) => set({ selectedPort: port }),

      // Favorites
      favorites: [],
      addFavorite: (port) => set((state) => ({
        favorites: [...state.favorites, port]
      })),
      removeFavorite: (port) => set((state) => ({
        favorites: state.favorites.filter((p) => p !== port)
      })),
      isFavorite: (port) => get().favorites.includes(port),

      // Watch list
      watchedPorts: [],
      addWatched: (port) => set((state) => ({
        watchedPorts: [...state.watchedPorts, port]
      })),
      removeWatched: (port) => set((state) => ({
        watchedPorts: state.watchedPorts.filter((p) => p !== port)
      })),
      isWatched: (port) => get().watchedPorts.includes(port),

      // Filter
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      filterType: null,
      setFilterType: (type) => set({ filterType: type }),

      // View
      viewMode: 'list',
      setViewMode: (mode) => set({ viewMode: mode }),
      sortConfig: { field: 'port', direction: 'asc' },
      setSortConfig: (config) => set({ sortConfig: config }),

      // Settings
      settings: {
        refreshInterval: 5000,
        launchAtStartup: false,
        showNotifications: true,
        minimizeToTray: true,
        theme: 'dark',
      },
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      // UI state
      isRefreshing: false,
      setIsRefreshing: (refreshing) => set({ isRefreshing: refreshing }),
      showSettings: false,
      setShowSettings: (show) => set({ showSettings: show }),

      // Sidebar
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    }),
    {
      name: 'portkiller-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        favorites: state.favorites,
        watchedPorts: state.watchedPorts,
        settings: state.settings,
        viewMode: state.viewMode,
        sortConfig: state.sortConfig,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
