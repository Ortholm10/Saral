// Base URL for the FastAPI backend. Only translation/simplification calls go
// through here — audio in/out is handled entirely client-side via the Web Speech API.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
