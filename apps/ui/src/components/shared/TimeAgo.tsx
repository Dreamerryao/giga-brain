'use client';

import React, { useState, useEffect } from 'react';

import { formatRelativeTime } from '@/lib/time';

export function TimeAgo({ timestamp }: { timestamp: number | string }) {
  const [formattedTime, setFormattedTime] = useState('');
  const [fullDateTime, setFullDateTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      // Convert UTC to local time
      const date = new Date(timestamp);

      // Format full datetime for tooltip
      setFullDateTime(date.toLocaleString());

      // Format relative time
      setFormattedTime(formatRelativeTime(timestamp));
    };

    updateTime();

    // Update every minute
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, [timestamp]);

  return (
    <span className='cursor-help' title={fullDateTime}>
      {formattedTime}
    </span>
  );
}
