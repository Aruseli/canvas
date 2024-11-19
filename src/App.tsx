// src/App.tsx
import React from 'react';
import Canvas from './canvas';

const App: React.FC = () => {

  return (
    <div>
      <h1 className="text-2xl p-6 md:p-8 font-black">Canvas Drawing Example</h1>
      <Canvas  />
    </div>
  );
};

export default App;