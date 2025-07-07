import React from 'react';

const SafeRealTimeChatInterface: React.FC = () => {
  console.log('🔧 SafeRealTimeChatInterface rendered');
  
  return (
    <div className="flex w-full h-full justify-center items-center p-4">
      <div className="text-white text-center">
        <h2 className="text-2xl mb-4">Chat publiczny</h2>
        <p className="text-muted-foreground">
          Czat będzie dostępny po pełnym załadowaniu aplikacji
        </p>
      </div>
    </div>
  );
};

export default SafeRealTimeChatInterface;