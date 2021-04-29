import { Upload } from './component/upload';
import styled from 'styled-components';
import React from 'react';

function App() {
  return (
    <StyledContainer>
      <StyledTitle>Transcripter</StyledTitle>
      <Upload />
    </StyledContainer>
  );
}

export default App;

const StyledContainer = styled.div`
  text-align: center;
  margin: 100px 50px;
`;

const StyledTitle = styled.h2`
  border-bottom: 2px solid darkgray;
  margin: 30px 400px;
`;