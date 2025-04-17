// src/App.js
import React, { useState, useEffect } from 'react';
import { createModel } from 'vosk-browser';
import successVideo from './assets/cheerfulDing.mov';
import './App.css';

const affirmations = [
  'I am strong',
  'I believe in myself',
  'I am capable of amazing things',
  'I embrace challenges with courage',
  'I radiate positivity and joy',
  'I am confident in my abilities',
  'I deserve happiness and success',
  'I trust the journey of my life',
  'I am grateful for this moment',
  'I choose peace and calm',
  'I am creative and resourceful',
  'I attract abundance effortlessly',
  'I am surrounded by love',
  'I am healthy and vital',
  'I forgive myself and grow',
  'I embrace my uniqueness',
  'I am evolving every day',
  'I deserve self-care and rest',
  'I am resilient and persistent',
  'I trust my intuition and wisdom',
  'I spread kindness wherever I go',
  'I am worthy of my dreams',
  'I release fear and embrace love',
  'I am proud of who I am',
  'I welcome new opportunities'
];

function App() {
  const getRandomIndex = () =>
    Math.floor(Math.random() * affirmations.length);

  // State
  const [modelReady, setModelReady] = useState(false);
  const [recognizer, setRecognizer] = useState(null);
  const [finalText, setFinalText] = useState('');
  const [status, setStatus] = useState('idle');       // 'idle' | 'listening' | 'try-again' | 'correct'
  const [stage, setStage] = useState('set-goal');   // 'set-goal' | 'affirming' | 'finished'
  const [goal, setGoal] = useState(50);
  const [points, setPoints] = useState(0);
  const [index, setIndex] = useState(getRandomIndex);
  const [showCheck, setShowCheck] = useState(false);

  // 1. Load Vosk model
  useEffect(() => {
    (async () => {
      const model = await createModel('/model/vosk-model-small-en-us-0.15.tar.gz');
      model.setLogLevel(0);
      const rec = new model.KaldiRecognizer();
      rec.setWords(false);
      rec.on('result', msg => setFinalText(msg.result.text));
      rec.on('partialresult', msg => {/*optional*/ });
      setRecognizer(rec);
      setModelReady(true);
    })();
  }, []);

  // 2. Hook mic & always stream into recognizer
  useEffect(() => {
    if (!recognizer) return;
    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 }
      });
      const ctx = new AudioContext();
      const node = ctx.createScriptProcessor(4096, 1, 1);
      node.onaudioprocess = e => {
        try { recognizer.acceptWaveform(e.inputBuffer) }
        catch { }
      };
      const src = ctx.createMediaStreamSource(stream);
      src.connect(node);
      node.connect(ctx.destination);
    })();
  }, [recognizer]);

  // 3. On finalText change, check affirmation
  useEffect(() => {
    if (stage !== 'affirming' || status !== 'listening' || !finalText) return;

    const said = finalText.trim().toLowerCase();
    const target = affirmations[index].toLowerCase();

    if (said === target) {
      setStatus('correct');
      // play animation
      const vid = document.createElement('video');
      vid.src = successVideo;
      vid.play().catch(() => { });
      setShowCheck(true);
      setTimeout(() => {
        setPoints(p => p + 10);
        setShowCheck(false);
        if (points + 10 >= goal) setStage('finished');
        else {
          setIndex(getRandomIndex());
          setStatus('idle');
        }
      }, 1000);
    } else {
      setStatus('try-again');
    }
  }, [finalText, index, stage, status, goal, points]);

  // start listening handler
  const startListening = () => {
    setFinalText('');       // wipe out previous result
    setStatus('listening'); // only evaluate while listening
  };

  // start affirmations
  const startAffirmations = () => {
    setIndex(getRandomIndex());
    setPoints(0);
    setStatus('idle');
    setStage('affirming');
  };

  if (!modelReady) {
    return <div className="App"><p>⏳ Loading speech model…</p></div>;
  }

  if (stage === 'set-goal') {
    return (
      <div className="App set-goal">
        <h1>Set Your Point Goal</h1>
        <input
          className="goal-input"
          type="number" min="10" step="10"
          value={goal}
          onChange={e => setGoal(Number(e.target.value))}
        />
        <button className="start-btn" onClick={startAffirmations}>
          ✨ Start Affirmations
        </button>
      </div>
    );
  }

  if (stage === 'finished') {
    return (
      <div className="App finished">
        <h1>🎉 Congratulations! 🎉</h1>
        <p>You reached {points} points.</p>
        <button className="start-btn" onClick={() => setStage('set-goal')}>
          🔄 Play Again
        </button>
      </div>
    );
  }

  // Affirming screen with Speak button
  const current = affirmations[index];
  return (
    <div className="App">
      <header>
        <h1>Positive Affirmations</h1>
        <div className="scoreboard">
          Points: {points} / {goal}
        </div>
      </header>

      <div className="card">
        <p className="affirmation">“{current}”</p>

        <button
          className="speak-btn"
          onClick={startListening}
          disabled={status === 'listening'}
        >
          {status === 'listening' ? 'Listening…' : 'Speak Now'}
        </button>

        {status === 'try-again' && (
          <p className="feedback wrong">Try again!</p>
        )}

        {showCheck && (
          <div className="checkmark-box">✔️</div>
        )}
      </div>
    </div>
  );
}

export default App;