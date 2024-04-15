import { Provider } from 'react-redux';
import { Route, Routes } from 'react-router-dom';

import Editor from './pages/Editor';
import store from './redux/store';

function App() {
  return (
    <Provider store={store}>
      <Routes>
        <Route path="/" element={<Editor />} />
      </Routes>
    </Provider>
  );
}

export default App;