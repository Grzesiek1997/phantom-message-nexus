import React from "react";

function App() {
  console.log('🚀 App starting...');
  
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#1a1a1a',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px'
    }}>
      <div>
        <h1>Test - App działa!</h1>
        <p>Jeśli widzisz ten tekst, aplikacja się ładuje poprawnie.</p>
      </div>
    </div>
  );
}

export default App;