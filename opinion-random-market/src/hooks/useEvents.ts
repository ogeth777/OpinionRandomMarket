import { useState, useEffect } from 'react';
import type { OpinionEvent } from '../types';
import { fetchEvents } from '../utils/api';

export const useEvents = () => {
  const [events, setEvents] = useState<OpinionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
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
          setEvents(validEvents);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load events');
        console.error('Hook Error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { events, loading, error };
};
