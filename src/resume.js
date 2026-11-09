// Open the resume pop-up from anywhere: import { openResume } from '../resume'
export const RESUME_EVENT = 'open-resume'
export const openResume = () => window.dispatchEvent(new Event(RESUME_EVENT))
