import React from 'react';
import ReactDom from 'react-dom';

import { Autocomplete  } from './Autocomplete';
import './index.scss';

ReactDom.render(
  <div>
    Город:
    <Autocomplete />

    <input className="input-for-test"
           placeholder="Следующий input для теста перехода"
    />
  </div>,
  document.getElementById('root')
);
