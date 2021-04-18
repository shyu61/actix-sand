import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone'
import styled from 'styled-components';
import { request } from '../hooks';

export const Upload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const accept = ['image/*', 'video/*'] // TODO: 'image/*'を削除する
  const onDrop = useCallback(async (files: File[]) => {
    setIsUploading(true);
    const body = { file_name: files[0].name }

    const signedUrl = await request<string>({
        method: 'POST',
        path: '/api/upload',
        body: JSON.stringify(body),
    });

    const formData = new FormData();
    formData.set('file', files[0]);
    await request<string>({
      method: 'PUT',
      path: signedUrl,
      body: formData,
      customHeaders: new Headers({ 'Content-Type': files[0].type })
    });

    setIsUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ accept, onDrop });

  return (
    <StyledContainer {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag 'n' drop some files here, or click to select files</p>
        )
      }
      {isUploading && <p>アップロード中</p>}
    </StyledContainer>
  )
}

const StyledContainer = styled.div`
  width: 300px;
  height: 250px;
  border: 1px solid gray;
`;
