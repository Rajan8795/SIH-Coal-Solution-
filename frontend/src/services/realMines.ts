import { Mine } from '../types';

const API_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api/v1/real-mines/`
  : 'http://127.0.0.1:8000/api/v1/real-mines/';

export async function fetchRealMines(): Promise<Mine[]> {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(`Unable to load real mine data (${response.status})`);
  }
  return response.json() as Promise<Mine[]>;
}