
import React, { useEffect, useRef, useState } from 'react';
import { TurnstileManager } from '@/lib/captcha/turnstile';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: (error: string) => void;
  onLoad?: () => void;
  className?: string;
}

const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
  onVerify,
  onError,
  onLoad,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [widgetId, setWidgetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initTurnstile = async () => {
      if (!containerRef.current) return;

      try {
        setIsLoading(true);
        
        const elementId = `turnstile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        containerRef.current.id = elementId;

        const id = await TurnstileManager.render(elementId, (token: string) => {
          console.log('🔐 Turnstile verification successful');
          onVerify(token);
        });

        if (id) {
          setWidgetId(id);
          onLoad?.();
        } else {
          onError?.('Failed to initialize CAPTCHA');
        }
      } catch (error) {
        console.error('Turnstile initialization error:', error);
        onError?.('CAPTCHA initialization failed');
      } finally {
        setIsLoading(false);
      }
    };

    initTurnstile();

    return () => {
      if (widgetId) {
        TurnstileManager.reset(widgetId);
      }
    };
  }, [onVerify, onError, onLoad]);

  const retry = () => {
    if (widgetId) {
      TurnstileManager.reset(widgetId);
    }
  };

  return (
    <div className={`turnstile-container ${className}`}>
      <div ref={containerRef} className="cf-turnstile">
        {isLoading && (
          <div className="flex items-center justify-center p-4 bg-gray-800 rounded border border-gray-600">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mr-3"></div>
            <span className="text-gray-300">Loading security verification...</span>
          </div>
        )}
      </div>
      
      <div className="text-center mt-2">
        <button
          type="button"
          onClick={retry}
          className="text-xs text-blue-400 hover:text-blue-300 underline"
        >
          Retry CAPTCHA
        </button>
      </div>
    </div>
  );
};

export default TurnstileWidget;
