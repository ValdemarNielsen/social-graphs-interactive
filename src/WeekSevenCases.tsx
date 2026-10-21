/** Independent game modules keep mechanics, artwork and controls together. */
export { default as SentimentCase } from './WeekSevenSentimentGame';
export { default as EntityCase } from './WeekSevenEntityGame';
export { default as RetrievalCase } from './WeekSevenRetrievalGame';

export type WeekSevenCaseProps = { reduced: boolean; onSolved?: (id: string) => void };
