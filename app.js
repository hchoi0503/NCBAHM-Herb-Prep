(() => {
  // ---------- State ----------
  let allQuestions = [];
  let quizQuestions = [];
  let currentIndex = 0;
  let correctCount = 0;
  let answeredCount = 0;
  let answered = false;

  // ---------- DOM ----------
  const homeScreen = document.getElementById("home");
  const quizScreen = document.getElementById("quiz");
  const resultsScreen = document.getElementById("results");

  const overallScoreEl = document.getElementById("overall-score");
  const overallGradeEl = document.getElementById("overall-grade");
  const overallQuoteEl = document.getElementById("overall-quote");
  const overallDetailEl = document.getElementById("overall-detail");
  const availableCountEl = document.getElementById("available-count");

  const progressText = document.getElementById("progress-text");
  const progressFill = document.getElementById("progress-fill");
  const questionIntro = document.getElementById("question-intro");
  const questionText = document.getElementById("question-text");
  const optionsContainer = document.getElementById("options-container");
  const revealBtn = document.getElementById("reveal-btn");
  const feedback = document.getElementById("feedback");
  const answerDisplay = document.getElementById("answer-display");
  const extraDisplay = document.getElementById("extra-display");
  const flashcardActions = document.getElementById("flashcard-actions");
  const nextBtn = document.getElementById("next-btn");
  const gotRightBtn = document.getElementById("got-right");
  const gotWrongBtn = document.getElementById("got-wrong");

  const setScoreEl = document.getElementById("set-score");
  const setPercentEl = document.getElementById("set-percent");
  const resultsOverallEl = document.getElementById("results-overall");
  const resultsGradeEl = document.getElementById("results-grade");
  const resultsQuoteEl = document.getElementById("results-quote");
  const resultsTitleEl = document.getElementById("results-title");
  const homeBtn = document.getElementById("home-btn");
  const exitBtn = document.getElementById("exit-btn");

  // ---------- Storage ----------
  const STORAGE_KEY = "nc-bahm-herb-prep-stats";

  function loadStats() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { correct: 0, total: 0 };
      const data = JSON.parse(raw);
      return {
        correct: Number(data.correct) || 0,
        total: Number(data.total) || 0,
      };
    } catch {
      return { correct: 0, total: 0 };
    }
  }

  function saveStats(stats) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }

  function getGradeInfo(percent) {
    if (percent >= 90) {
      return {
        label: "Chapter Master",
        key: "a",
        quote: "The Emperor protects. Your knowledge is a beacon in the darkness.",
      };
    }
    if (percent >= 80) {
      return {
        label: "Captain",
        key: "b",
        quote: "For the Emperor and the Imperium! Lead by example.",
      };
    }
    if (percent >= 70) {
      return {
        label: "Sergeant",
        key: "c",
        quote: "Duty is its own reward. Stay the course, warrior.",
      };
    }
    if (percent >= 60) {
      return {
        label: "Battle-Brother",
        key: "d",
        quote: "Blessed is the mind too small for doubt. Keep training.",
      };
    }
    return {
      label: "Heretic",
      key: "f",
      quote: "Suffer not the heretic to live. Repent, and study harder.",
    };
  }

  function updateOverallDisplay() {
    const stats = loadStats();
    if (stats.total === 0) {
      overallScoreEl.textContent = "—";
      overallGradeEl.textContent = "—";
      overallGradeEl.className = "grade-badge";
      overallQuoteEl.textContent = "";
      overallDetailEl.textContent = "No trials completed yet";
      return;
    }
    const percent = Math.round((stats.correct / stats.total) * 100);
    const info = getGradeInfo(percent);
    overallScoreEl.textContent = percent + "%";
    overallGradeEl.textContent = info.label;
    overallGradeEl.className = "grade-badge grade-" + info.key;
    overallQuoteEl.textContent = info.quote;
    overallDetailEl.textContent = `${stats.correct} correct out of ${stats.total}`;
  }

  // ---------- Helpers ----------
  function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function isMcq(q) {
    return Array.isArray(q.options) && q.options.length > 0;
  }

  const QUESTION_INTROS = [
    "The Emperor asks:",
    "The Undying Emperor demands:",
    "A Tech-Priest inquires:",
    "The Inquisition probes:",
    "A Commissar tests your faith:",
    "The Chapter Librarian questions:",
    "An Adept of Mars seeks knowledge:",
    "The Ecclesiarchy examines you:",
    "A Veteran Sergeant challenges:",
    "The Ordo Hereticus asks:",
    "A Magos Biologis queries:",
    "The Imperial Creed tests you:",
    "A Battle-Brother wonders:",
    "The Schola Progenium examines:",
    "An Interrogator demands:",
  ];

  function randomIntro() {
    return QUESTION_INTROS[Math.floor(Math.random() * QUESTION_INTROS.length)];
  }

  function showScreen(screen) {
    homeScreen.classList.add("hidden");
    quizScreen.classList.add("hidden");
    resultsScreen.classList.add("hidden");
    screen.classList.remove("hidden");
  }

  // ---------- Load questions ----------
  async function loadQuestions() {
    try {
      const res = await fetch("questions.json");
      if (!res.ok) throw new Error("Failed to load questions.json");
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("questions.json must be an array");
      allQuestions = data;
      availableCountEl.textContent =
        data.length > 0
          ? `${data.length} question${data.length === 1 ? "" : "s"} available`
          : "No questions found in questions.json";
    } catch (err) {
      console.error(err);
      allQuestions = [];
      availableCountEl.textContent = "Could not load questions.json";
    }
  }

  // ---------- Quiz flow ----------
  function startQuiz(count) {
    if (allQuestions.length === 0) {
      alert("No questions available. Add questions to questions.json.");
      return;
    }

    const take = Math.min(count, allQuestions.length);
    quizQuestions = shuffle(allQuestions).slice(0, take);
    currentIndex = 0;
    correctCount = 0;
    answeredCount = 0;
    answered = false;
    showScreen(quizScreen);
    renderQuestion();
  }

  function renderQuestion() {
    const q = quizQuestions[currentIndex];
    answered = false;

    progressText.textContent = `Question ${currentIndex + 1} / ${quizQuestions.length}`;
    progressFill.style.width = `${((currentIndex) / quizQuestions.length) * 100}%`;

    const intro = randomIntro();
    if (questionIntro) {
      questionIntro.textContent = intro;
    }
    questionText.textContent = q.question || "";

    // Reset UI
    optionsContainer.innerHTML = "";
    optionsContainer.classList.add("hidden");
    revealBtn.classList.add("hidden");
    feedback.classList.add("hidden");
    flashcardActions.classList.add("hidden");
    nextBtn.classList.add("hidden");
    answerDisplay.innerHTML = "";
    extraDisplay.textContent = "";

    if (isMcq(q)) {
      optionsContainer.classList.remove("hidden");
      q.options.forEach((opt) => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.textContent = opt;
        btn.addEventListener("click", () => handleMcqAnswer(opt, q));
        optionsContainer.appendChild(btn);
      });
    } else {
      // Flashcard
      revealBtn.classList.remove("hidden");
    }
  }

  function handleMcqAnswer(selected, q) {
    if (answered) return;
    answered = true;
    answeredCount++;

    const correct = selected === q.answer;
    if (correct) correctCount++;

    // Mark options
    const buttons = optionsContainer.querySelectorAll(".option-btn");
    buttons.forEach((btn) => {
      btn.disabled = true;
      if (btn.textContent === q.answer) {
        btn.classList.add("correct");
      } else if (btn.textContent === selected && !correct) {
        btn.classList.add("incorrect");
      }
    });

    showFeedback(q, correct);
  }

  function handleReveal() {
    if (answered) return;
    const q = quizQuestions[currentIndex];
    revealBtn.classList.add("hidden");
    showFeedback(q, null); // null = waiting for self-grade
    flashcardActions.classList.remove("hidden");
  }

  function handleFlashcardGrade(gotItRight) {
    if (answered) return;
    answered = true;
    answeredCount++;
    if (gotItRight) correctCount++;
    flashcardActions.classList.add("hidden");
    nextBtn.classList.remove("hidden");
  }

  function showFeedback(q, wasCorrect) {
    feedback.classList.remove("hidden");

    const label = document.createElement("span");
    label.className = "label";
    label.textContent = "Answer";
    answerDisplay.innerHTML = "";
    answerDisplay.appendChild(label);
    answerDisplay.appendChild(document.createTextNode(q.answer || ""));

    if (q.extra) {
      extraDisplay.textContent = q.extra;
    } else {
      extraDisplay.textContent = "";
    }

    if (wasCorrect !== null) {
      // MCQ path – already graded
      nextBtn.classList.remove("hidden");
    }
    // Flashcard path keeps the Right/Wrong buttons visible
  }

  function nextQuestion() {
    currentIndex++;
    if (currentIndex >= quizQuestions.length) {
      finishQuiz();
    } else {
      renderQuestion();
    }
  }

  function finishQuiz(earlyExit = false) {
    const total = answeredCount;
    const percent = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    // Update persistent stats only for questions that were answered
    const stats = loadStats();
    stats.correct += correctCount;
    stats.total += total;
    saveStats(stats);

    // Display results
    resultsTitleEl.textContent = earlyExit ? "Trial Aborted" : "Trial Complete";
    setScoreEl.textContent = `${correctCount} / ${total}`;
    setPercentEl.textContent =
      total > 0 ? `${percent}% correct` : "No questions answered";

    const overallPercent =
      stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    if (stats.total > 0) {
      const info = getGradeInfo(overallPercent);
      resultsOverallEl.textContent = overallPercent + "%";
      resultsGradeEl.textContent = info.label;
      resultsGradeEl.className = "grade-badge grade-" + info.key;
      resultsQuoteEl.textContent = info.quote;
    } else {
      resultsOverallEl.textContent = "—";
      resultsGradeEl.textContent = "—";
      resultsGradeEl.className = "grade-badge";
      resultsQuoteEl.textContent = "";
    }

    progressFill.style.width = "100%";
    showScreen(resultsScreen);
    updateOverallDisplay();
  }

  function exitQuiz() {
    if (answeredCount === 0) {
      // Nothing graded yet — just return home, no stats change
      showScreen(homeScreen);
      updateOverallDisplay();
      return;
    }
    finishQuiz(true);
  }

  // ---------- Events ----------
  document.querySelectorAll("[data-count]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const count = parseInt(btn.dataset.count, 10);
      startQuiz(count);
    });
  });

  revealBtn.addEventListener("click", handleReveal);
  gotRightBtn.addEventListener("click", () => handleFlashcardGrade(true));
  gotWrongBtn.addEventListener("click", () => handleFlashcardGrade(false));
  nextBtn.addEventListener("click", nextQuestion);
  exitBtn.addEventListener("click", exitQuiz);
  homeBtn.addEventListener("click", () => {
    showScreen(homeScreen);
    updateOverallDisplay();
  });

  // ---------- Init ----------
  loadQuestions().then(() => {
    updateOverallDisplay();
  });
})();
