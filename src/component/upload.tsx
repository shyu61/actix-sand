import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone'
import styled from 'styled-components';
import { request } from '../hooks';

export const Upload = () => {
  const [signedUrl, setSignedUrl] = useState('');

  const onDrop = async (files: File[]) => {
    const body = new FormData();
    body.set('fileName', files[0].name);
    body.set('fileType', files[0].type);

    const res = await request<string>(
      {
        method: 'POST',
        path: '/upload',
        body: body,
      }
    )
    setSignedUrl(res);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <StyledContainer {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag 'n' drop some files here, or click to select files</p>
        )
      }
    </StyledContainer>
  )
}

const StyledContainer = styled.div`
  width: 300px;
  height: 250px;
  border: 1px solid gray;
`;
