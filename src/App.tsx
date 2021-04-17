import React, { useEffect, useState } from 'react';
import { request } from './hooks';

type SecondData = {
  list: {
    id: number,
    name: string
  }[]
}

const initialSecondData = {
  list: [{
    id: 0,
    name: 'sample',
  }]
}

function App() {
  const [firstData, setFirstData] = useState<string[]>([]);
  const [secondData, setSecondData] = useState<SecondData>(initialSecondData);

  const getFirstData = async () => {
    const res = await request<string[]>({ method: 'GET', path: '/api/first' });
    setFirstData(res);
  }

  const getSecondData = async () => {
    const res = await request<SecondData>({ method: 'GET', path: '/api/second' });
    setSecondData(res);
  }

  useEffect(() => {
    getFirstData();
    getSecondData();
  }, []);

  return (
    <div className="App">
      <h2>First Data</h2>
      {firstData.map(item => <p>{item}</p>)}
      <h2>Second Data</h2>
      {secondData['list'].map(item => <p>Id: {item.id}, Name: {item.name}</p>)}
    </div>
  );
}

export default App;
