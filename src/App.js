import React, { useState, useEffect } from 'react';
import SpeechRecognition, {
  useSpeechRecognition
} from 'react-speech-recognition';
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
  const [stage, setStage] = useState('set-goal');
  const [goal, setGoal] = useState(50);
  const [points, setPoints] = useState(0);
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState('idle');
  const [showCheck, setShowCheck] = useState(false);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    if (!transcript || stage !== 'affirming') return;
    const said = transcript.trim().toLowerCase();
    const target = affirmations[index].toLowerCase();

    if (said === target) {
      setStatus('correct');
      SpeechRecognition.stopListening();
      resetTranscript();  // clear so "try-again" won't flash

      // play video animation
      const vid = document.createElement('video');
      vid.src = successVideo;
      vid.play().catch(() => { });

      // show checkmark
      setShowCheck(true);

      setTimeout(() => {
        setPoints(p => p + 10);
        setShowCheck(false);
        if (points + 10 >= goal) {
          setStage('finished');
        } else if (index < affirmations.length - 1) {
          setIndex(i => i + 1);
          setStatus('idle');
        } else {
          setIndex(0);
          setStatus('idle');
        }
      }, 1000);

    } else {
      setStatus('try-again');
    }
  }, [transcript, index, stage, goal, points, resetTranscript]);

  const startListening = () => {
    setStatus('listening');
    resetTranscript();
    SpeechRecognition.startListening({ continuous: false, language: 'en-US' });
  };

  if (!browserSupportsSpeechRecognition) {
    return <div className="App"><p>Speech recognition not supported.</p></div>;
  }

  if (stage === 'set-goal') {
    return (
      <div className="App set-goal">
        <h1>Set Your Point Goal</h1>
        <input
          className="goal-input"
          type="number"
          min="10"
          step="10"
          value={goal}
          onChange={e => setGoal(Number(e.target.value))}
        />
        <button className="start-btn" onClick={() => setStage('affirming')}>
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
      </div>
    );
  }

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
          disabled={listening}
        >
          {listening ? 'Listening…' : 'Speak Now'}
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
