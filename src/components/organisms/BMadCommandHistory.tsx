/**
 * BMad Command History Component
 * 
 * Displays command history and analytics for BMad users
 */

import React, { useState, useEffect } from 'react';
import { BMadSessionManager } from '@/lib/bmad-interface';
import { logger } from '@/lib/logger';

interface CommandHistoryProps {
  userId: string;
  maxEntries?: number;
  showExecutionTime?: boolean;
  showAgent?: boolean;
  className?: string;
}

export default function BMadCommandHistory({
  userId,
  maxEntries = 50,
  showExecutionTime = true,
  showAgent = true,
  className = "max-w-2xl",
}: CommandHistoryProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState<'timestamp' | 'executionTime' | 'agent' | 'module'>('timestamp');

  useEffect(() => {
    loadHistory();
  }, [userId, maxEntries]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const history = await BMadSessionManager.getSessionHistory(userId, maxEntries);
      setHistory(history);
      logger.debug('Command history loaded', { userId, entries: history.length });
    } catch (error) {
      logger.error('Failed to load command history', error as Error, { userId });
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      setLoading(true);
      await BMadSessionManager.clearSession(userId);
      setHistory([]);
      logger.info('Command history cleared', { userId });
    } catch (error) {
      logger.error('Failed to clear command history', error as Error, { userId });
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(entry => {
    if (filter && !entry.command.toLowerCase().includes(filter.toLowerCase())) {
      return false;
    }
    if (sortBy && sortBy) {
      const [field, direction] = sortBy.split('-');
      const aValue = field === 'agent' ? entry.agent : entry.command;
      const bValue = field === 'agent' ? entry.command : entry.agent;
      
      return direction === 'asc' 
        ? (aValue as string).localeCompare(bValue as string)
        : (bValue as string).localeCompare(aValue as string);
    }
    return true;
  });

  const sortedHistory = [...history].sort((a, b) => {
    if (sortBy === 'executionTime') {
      return b.executionTime - a.executionTime;
    }
    if (sortBy === 'timestamp') {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
    if (sortBy === 'agent') {
      return a.agent?.localeCompare(b.agent || '') || 0;
    }
    return 0;
  });

  const getModuleIcon = (module: string) => {
    const icons: Record<string, string> = {
      core: '🧙',
      bmm: '📋',
      bmb: '🛠️',
      cis: '💡',
    };
    return icons[module] || '🔧';
  };

  const getCommandIcon = (command: string) => {
    if (command.includes('agents')) return '🤖';
    if (command.includes('workflows')) return '⚙';
    if (command.includes('tasks')) return '📝';
    return '🎯';
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
            <span className="ml-3 text-lg text-gray-600">Loading command history...</span>
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-500">BMad v2.0</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <h2 className="text-2xl font-bold text-gray-900">BMad Command History</h2>
          <div className="text-sm text-gray-600">Session management and analytics</div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearHistory}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Clear History
          </button>
          <button
            onClick={() => loadHistory()}
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-secondary rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-900">Total Commands</div>
          <div className="text-3xl font-bold text-primary">{history.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-900">Sessions</div>
          <div className="text-3xl font-bold text-primary">{new Set(history.map(item => item.userId)).size}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-900">Avg Execution Time</div>
          <div className="text-3xl font-bold text-primary">
            {history.length > 0 
              ? Math.round(history.reduce((sum, entry) => sum + (entry.executionTime || 0), 0) / history.length / 1000) + 'ms'
              : '0ms'}
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-4 mb-4">
          <input
            type="text"
            placeholder="Filter commands..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'timestamp' | 'executionTime' | 'agent' | 'module')}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="timestamp">Time</option>
            <option value="executionTime">Execution Time</option>
            <option value="agent">Agent</option>
            <option value="module">Module</option>
          </select>
        </div>
      </div>

      {/* Command List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          {sortedHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">No commands executed yet</div>
              <div className="text-sm text-gray-400 mt-2">
                Try executing some BMad commands to see your history here!
              </div>
            </div>
          ) : (
            <ul className="space-y-2">
              {sortedHistory.map((entry, index) => (
                <li key={`${entry.id}-${index}`} className="flex items-start justify-between p-3 hover:bg-gray-50">
                  <div className="flex-1 space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-md ${getModuleIcon(entry.command.split(':')[0] || '')}`}>
                        {getCommandIcon(entry.command)}
                      </span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {entry.command}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(entry.timestamp).toLocaleString()}
                        </div>
                        {showExecutionTime && (
                          <div className="text-xs text-gray-500">
                            ({entry.executionTime}ms)
                          </div>
                        )}
                        {showAgent && entry.agent && (
                          <div className="text-xs text-blue-600 font-medium">
                            via {entry.agent}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 space-x-3 text-right">
                      <div className="text-sm text-gray-500">
                        {sortBy === 'timestamp' && (
                          <span className="font-medium">#{index + 1}</span>
                        )}
                      </div>
                    </div>
                  </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

BMadCommandHistory.displayName = 'BMadCommandHistory';