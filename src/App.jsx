// src/App.tsx (yoki routes/index.ts)
import React from 'react';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { store } from './store';
import { router } from './app/router';

function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}

export default App;