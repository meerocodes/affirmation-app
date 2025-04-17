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
  'I radiate positivity and joy'
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

  // check match
  useEffect(() => {
    if (!transcript || stage !== 'affirming') return;
    const said = transcript.trim().toLowerCase();
    const target = affirmations[index].toLowerCase();

    if (said === target) {
      setStatus('correct');
      SpeechRecognition.stopListening();

      // play video (silent autoplay, just for the animation)
      const vid = document.createElement('video');
      vid.src = successVideo;
      vid.play().catch(() => { }); // ignore autoplay block

      // show checkmark animation
      setShowCheck(true);

      setTimeout(() => {
        setPoints(p => p + 10);
        setShowCheck(false);
        resetTranscript();

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
    return (
      <div className="App">
        <p>Speech recognition not supported.</p>
      </div>
    );
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
        
        <button
         className="start-btn"
                 onClick={() => setStage('affirming')}
       >
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

  // affirming stage
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

        {/* checkmark animation */}
        {showCheck && (
          <div className="checkmark-box">
            ✔️
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
