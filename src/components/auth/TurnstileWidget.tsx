
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TurnstileManager } from '@/lib/captcha/turnstile';
import { RefreshCw, Shield, AlertCircle } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const initTurnstile = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Initializing Turnstile widget...');
      
      const elementId = `turnstile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      containerRef.current.id = elementId;

      const id = await TurnstileManager.render(elementId, (token: string) => {
        console.log('✅ CAPTCHA verification successful');
        setError(null);
        onVerify(token);
      });

      if (id) {
        setWidgetId(id);
        setError(null);
        onLoad?.();
        console.log('✅ Turnstile widget initialized successfully');
      } else {
        throw new Error('Failed to initialize CAPTCHA widget');
      }
    } catch (error: any) {
      console.error('❌ Turnstile initialization error:', error);
      const errorMessage = error.message || 'CAPTCHA initialization failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [onVerify, onError, onLoad]);

  useEffect(() => {
    initTurnstile();

    return () => {
      if (widgetId) {
        TurnstileManager.reset(widgetId);
      }
    };
  }, [initTurnstile]);

  const handleRetry = useCallback(() => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      console.log(`🔄 Retrying CAPTCHA (attempt ${retryCount + 1}/${maxRetries})`);
      
      if (widgetId) {
        TurnstileManager.reset(widgetId);
      }
      
      // Clear container and reinitialize
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      
      setTimeout(() => {
        initTurnstile();
      }, 500);
    } else {
      setError('Maximum retry attempts reached. Please refresh the page.');
    }
  }, [retryCount, widgetId, initTurnstile]);

  if (error) {
    return (
      <div className={`turnstile-container ${className}`}>
        <div className="flex flex-col items-center justify-center p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
          <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
          <p className="text-red-300 text-sm text-center mb-3">{error}</p>
          {retryCount < maxRetries && (
            <button
              type="button"
              onClick={handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry CAPTCHA ({retryCount + 1}/{maxRetries})
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`turnstile-container ${className}`}>
      <div ref={containerRef} className="cf-turnstile min-h-[65px]">
        {isLoading && (
          <div className="flex items-center justify-center p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="animate-spin w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full mr-3"></div>
            <Shield className="w-5 h-5 text-blue-400 mr-2" />
            <span className="text-blue-300 text-sm">Loading security verification...</span>
          </div>
        )}
      </div>
      
      {!isLoading && !error && (
        <div className="text-center mt-2">
          <button
            type="button"
            onClick={handleRetry}
            className="text-xs text-blue-400 hover:text-blue-300 underline flex items-center justify-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh CAPTCHA
          </button>
        </div>
      )}
    </div>
  );
};

export default TurnstileWidget;
