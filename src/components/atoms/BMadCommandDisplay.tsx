/**
 * BMad Command Display Component
 * Simple component for displaying BMad commands
 */

import React from 'react';

interface BMadCommandDisplayProps {
  command?: string;
  result?: string;
}

export function BMadCommandDisplay({ command, result }: BMadCommandDisplayProps) {
  if (!command) return null;

  return (
    <div className="bg-gray-100 p-4 rounded-md">
      <div className="font-mono text-sm">
        <div className="text-gray-600">$ {command}</div>
        {result && (
          <div className="mt-2 text-green-600">
            {result}
          </div>
        )}
      </div>
    </div>
  );
}