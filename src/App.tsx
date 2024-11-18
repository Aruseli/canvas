// src/App.tsx
import React from 'react';
import Canvas from './canvas';

const App: React.FC = () => {
  const rectangle1 = { position: { x: 100, y: 100 }, size: { width: 50, height: 50 } };
  const rectangle2 = { position: { x: 300, y: 300 }, size: { width: 50, height: 50 } };
  
  // Пример точек для ломаной линии
  // const pointsArray = [
  //   { x: 100, y: 125 }, // Точка подключения к первому прямоугольнику
  //   { x: 100, y: 135 }, // Промежуточная точка
  //   { x: 300, y: 135 }, // Промежуточная точка
  //   { x: 300, y: 275 }, // Точка подключения ко второму прямоугольнику
  // ];

  return (
    <div>
      <h1>Canvas Drawing Example</h1>
      <Canvas />
    </div>
  );
};

export default App;