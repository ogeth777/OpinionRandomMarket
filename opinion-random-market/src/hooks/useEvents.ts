import { useState, useEffect } from 'react';
import type { OpinionEvent } from '../types';
import { fetchEvents } from '../utils/api';

export const useEvents = () => {
  const [events, setEvents] = useState<OpinionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let isInitialLoad = true;

    const load = async (showSpinner: boolean) => {
      try {
        if (showSpinner) {
          setLoading(true);
        }
        setError(null);
        
        console.log('Hook: Starting fetchEvents...');
        const data = await fetchEvents();
        console.log('Hook: fetchEvents returned', data.length, 'items');

        if (!data || data.length === 0) {
           setError('No events found. API might be down.');
           setLoading(false);
           return;
        }

        // Filter: ensure image and markets exist
        const validEvents = data.filter(e => 
          e.markets && e.markets.length > 0 && e.title
        );
        
        console.log('Hook: Valid events after filter', validEvents.length);
        
        if (validEvents.length === 0) {
          setError('No valid events found after filtering.');
        } else {
          if (!cancelled) {
            setEvents(validEvents);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load events');
        console.error('Hook Error:', err);
      } finally {
        if (!cancelled && showSpinner) {
          setLoading(false);
        }
      }
    };
    
    // Initial load with spinner
    load(true);

    // Periodic refresh without spinner to keep YES/NO prices fresh
    const interval = setInterval(() => {
      if (!cancelled) {
        load(false);
      }
    }, 60000); // every 60 seconds

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { events, loading, error };
};
