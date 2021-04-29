import { request } from '../hooks';
import React, { useCallback, useState } from 'react';
import styled, { css } from 'styled-components';
import { useDropzone } from 'react-dropzone'

type UploadResponse = {
  signed_url: string,
  key: string,
}

type TranscriptedData = {
  jobName: string;
  accountId: number;
  results: {
    transcripts: {
      transcript: string;
    }[],
    items: {
      start_time: number;
      end_time: number;
      alternatives: {
        confidence: number;
        content: string;
      }[],
      type: string;
    }[],
  },
  status: string;
};

export const Upload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [key, setKey] = useState('input/sample.mp3'); // TODO: AWS Trascriptionの上限があるのでサンプルを表示
  const [transcription, setTranscription] = useState('');

  const accept = ['audio/*', 'video/*'];
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

    const obj: TranscriptedData = JSON.parse(res);
    const convertedData = obj.results.transcripts[0].transcript;

    setTranscription(convertedData.replace(/\s+/g, ''));
  }, [key]);

  return (
    <>
      <StyledContainer {...getRootProps()}>
        <input {...getInputProps()} />
        <StyledDropArea isActive={isDragActive}>動画または音声ファイルを選択 もしくは ドラッグ＆ドロップしてください</StyledDropArea>
        {isUploading && <p>アップロード中</p>}
      </StyledContainer>
      <div>
        <p>ファイル名: {key.replace(/input\//,'')}</p>
        <StyledDataContainer>
          {transcription}
        </StyledDataContainer>
        <button onClick={handleFetchTranscription}>更新</button>
      </div>
    </>
  )
}

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 500px;
  height: 300px;
  margin: 0 auto;
  border: 1px solid darkgray;
  border-radius: 4px;
`;

const StyledDropArea = styled.span<{ isActive: boolean }>`
  font-size: 14px;
  ${({ isActive }) =>
  css`
    color: ${isActive ? 'silver' : 'gray'};
  `}
`;

const StyledDataContainer = styled.div`
  width: 900px;
  height: 300px;
  margin: 5px auto;
  border: 1px solid darkgray;
  border-radius: 4px;
  overflow-y: auto;
  text-align: left;
`;
