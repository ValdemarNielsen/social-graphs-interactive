export interface Week {
  id: number; title: string; subtitle: string; question: string; intro: string;
  theme: string; lab: string; objectives: string[];
  sections: { id: string; title: string; body: string[]; formula?: string; terms?: string; example?: string; pitfall?: string }[];
  exercises: { id: string; mode: 'Learn' | 'Builder' | 'Tool'; title: string; task: string; hint: string }[];
  checklist: string[];
  resources: { title: string; url: string; status?: string }[];
  source: string; gaps: string[];
}
