import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone'
import styled from 'styled-components';
import { request } from '../hooks';

type UploadResponse = {
  signed_url: string,
  key: string,
}

export const Upload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [key, setKey] = useState('');
  const [transcription, setTranscription] = useState('');

  const accept = ['image/*', 'audio/*', 'video/*'] // TODO: 'image/*'を削除する
  const onDrop = useCallback(async (files: File[]) => {
    setIsUploading(true);
    const body = { file_name: files[0].name }

    const { signed_url: signedUrl, key } = await request<UploadResponse>({
        method: 'POST',
        path: '/api/upload',
        body: JSON.stringify(body),
    });
    setKey(key);

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

  const handleFetchTranscription = useCallback(async () => {
    const res = await request<string>({
      method: 'GET',
      path: `/api/transcription?key=${key}`,
    });

    setTranscription(res);
  }, [key])

  return (
    <>
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
      <div>
        <p>s3_key: {key}</p>
        <p>{transcription}</p>
        <button onClick={handleFetchTranscription}>更新</button>
      </div>
    </>
  )
}

const StyledContainer = styled.div`
  width: 300px;
  height: 250px;
  border: 1px solid gray;
`;
