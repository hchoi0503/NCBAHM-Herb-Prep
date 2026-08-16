# Codex Herbalis

Warhammer 40k–themed quiz app for NCBAHM herb prep practice.

## How to use

1. Replace the contents of `questions.json` with your own questions.
2. Push the folder to a GitHub repository.
3. Enable **GitHub Pages** (Settings → Pages → Deploy from branch → main / root).
4. Open the Pages URL on your phone or computer.

## Question format

```json
[
  {
    "id": 1,
    "question": "Your question text here",
    "options": ["Option A", "Option B", "Option C"],   // optional – presence of options = multiple choice
    "answer": "Option B",
    "extra": "Optional explanation shown after answering"
  },
  {
    "id": 2,
    "question": "Flashcard-style question (no options)",
    "answer": "The answer text",
    "extra": "Optional explanation"
  }
]
```

- If `options` exists and is a non-empty array → multiple-choice question.
- If `options` is missing → flashcard (Reveal Answer → self-grade Right / Wrong).
- `extra` is optional.

## Features

- Choose 10 / 20 / 50 questions (or fewer if the bank is smaller)
- Questions are randomly shuffled each set
- After every question the correct answer + explanation are shown
- Overall percentage and letter grade (A–F) are saved in the browser and persist across sessions
- Dark, minimal, mobile-first design

## Files

| File            | Purpose                          |
|-----------------|----------------------------------|
| `index.html`    | Structure only (no logic)        |
| `styles.css`    | All styling                      |
| `app.js`        | All application logic            |
| `questions.json`| Your question bank               |
