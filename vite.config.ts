import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    chunkSizeWarningLimit: 500,
    rolldownOptions: { output: { comments: { legal: true }, banner: '/*! Social Graphs: original code MIT; adapted teaching content CC BY-SA 4.0 (Sune Lehmann / DTU). React, React DOM and Scheduler: Copyright (c) Meta Platforms, Inc. and affiliates, MIT. GSAP 3.15.0 / ScrollTrigger: Copyright 2008-2026, GreenSock. All rights reserved. Subject to https://gsap.com/standard-license/ . Full notices and font licenses distributed in ../licenses/ and ../THIRD_PARTY_NOTICES.md. */' } },
  },
});
