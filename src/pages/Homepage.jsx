//@refresh reset
import React, { useEffect, useRef, useState } from "react";
import SpeedGraphCanvas from "../components/SpeedGraphCanvas";
import Speedometer from "../components/Speedometer";
import "../styles/Homepage.css";
import getwordlist from "../modules/wordlist.js";

export default function Homepage() {
    const [text, setText] = useState("");
    const [startedAt, setStartedAt] = useState(null);
    const [running, setRunning] = useState(false);
    const [avgWpm, setAvgWpm] = useState(0);
    const [testOver, setTestOver] = useState(false);
    const [wordset, setWordSet] = useState([]);
    const [wordsCol, setWordsCol] = useState([]);
    const [currentLev, setCurrentLev] = useState("easy");
    const [maxspeed,setmax] = useState(localStorage.getItem("maxWpm") || 0);
    const rendix = useRef(0);


    const textareaRef = useRef(null);

    const COUNT = 300;
    const TOT_WORDS = 15;
    const totalCharsRef = useRef(0);
    const totalWordsRef = useRef(0);
    const avgIntervalRef = useRef(null);
    const TEST_DURATION_MS = 60000;

    useEffect(() => {
        const loadWords = async () => {
            console.log("loadling : ", currentLev)
            const words = await getwordlist({ COUNT, currentLev });
            setWordSet(words);
            setWordsCol(Array(words.length).fill(""));
        };
        loadWords();
    }, [currentLev]);


    const markWord = (index, className) => {
        setWordsCol(prev => {
            const newCol = [...prev];
            newCol[index] = className;
            return newCol;
        });
    };

    const startTest = () => {
        setText("");
        totalCharsRef.current = 0;
        setAvgWpm(0);
        setTestOver(false);
        rendix.current = 0;

        setTimeout(() => {
            textareaRef.current?.focus();
        }, 10);

        if (avgWpm) {
            const loadWords = async () => {
                console.log("loadling : ", currentLev)
                const words = await getwordlist({ COUNT, currentLev });
                setWordSet(words);
                setWordsCol(Array(words.length).fill(""));
            };
            loadWords();
        }

        const now = Date.now();
        setStartedAt(now);
        setRunning(true);

        if (avgIntervalRef.current) clearInterval(avgIntervalRef.current);
        avgIntervalRef.current = setInterval(() => {
            const elapsedMin = (Date.now() - now) / 60000;
            const avg = elapsedMin > 0 ? (totalWordsRef.current) / elapsedMin : 0;
            setAvgWpm(Number(avg.toFixed(2)));

            if (Date.now() - now >= TEST_DURATION_MS) stopTest();
        }, 500);
    };

    const stopTest = () => {
        setRunning(false);
        setTestOver(true);
        totalWordsRef.current = 0;
        if (avgIntervalRef.current) clearInterval(avgIntervalRef.current);

        const currentMax = Number(localStorage.getItem("maxWpm") || 0);
        if (avgWpm > currentMax) {
            localStorage.setItem("maxWpm", avgWpm.toFixed(2));
            setmax(localStorage.getItem("maxWpm") || 0)
        }
    };

    const updateList = () => {
        rendix.current = 0;
        const arr = [...wordset];
        arr.splice(0, TOT_WORDS);
        setWordSet(arr);
        for (let i = 0; i < TOT_WORDS; i++) markWord(i, "");
    };

    const handleInput = (e) => {
        let newText = e.target.value;
        if (!running) return;

        const currentWord = wordset[rendix.current] || "";
        const spacePressed = newText.endsWith(" ");
        let wordDone = false;

        if (spacePressed) {
            newText = newText.trim();
            if (newText === currentWord) {
                markWord(rendix.current, "correct");
                markWord(rendix.current + 1, "ongoing");
                totalWordsRef.current++;
                wordDone = true;
            } else if (newText.length) {
                markWord(rendix.current, "red");
                markWord(rendix.current + 1, "ongoing");
                wordDone = true;
            }
            newText = "";
        } else {
            if (!currentWord.startsWith(newText)) {
                markWord(rendix.current, "red");
            } else {
                markWord(rendix.current, "ongoing");
            }
        }

        if (wordDone) {
            rendix.current++;
            if (rendix.current % TOT_WORDS === 0) updateList();
        }

        setText(newText);
    };

    const getCurrentWpm = () => {
        if (!startedAt) return 0;
        const elapsedMin = (Date.now() - startedAt) / 60000;
        return elapsedMin > 0 ? (totalWordsRef.current) / elapsedMin : 0;
    };

    useEffect(() => {
        return () => clearInterval(avgIntervalRef.current);
    }, []);


    const toggleLevel = () => {
        setCurrentLev(prev =>
            prev === "easy" ? "medium" : prev === "medium" ? "hard" : "easy"
        );
    };

    return (
        <div className="homepage-container">
            <div className="homepage-content">
                <header className="header-section">
                    <div className="header-left">
                        <div id="headline"><h1>⌨️ KeySprint</h1></div>
                        <p className="subtext">
                            Start now → 60s key sprint → with real time SpeeeeD |
                            | Your Max ({maxspeed})
                        </p>
                    </div>

                    <div className="header-right">
                        <div className="status-text">
                            {testOver
                                ? "Test ended"
                                : running
                                    ? `Running : ${((Date.now() - startedAt) / 1000).toFixed(0)}s`
                                    : "Ready"}
                        </div>
                        <div className="btn-group">

                            <button
                                className={`btn level-btn ${currentLev}`}
                                onClick={toggleLevel}
                                disabled={running}
                            >
                                {currentLev.toUpperCase()}
                            </button>

                            <button
                                className={`btn start-btn ${running ? "disabled" : ""}`}
                                onClick={startTest}
                                disabled={running}
                            >
                                Start
                            </button>
                            <button
                                className={`btn stop-btn ${running ? "" : "disabled"}`}
                                onClick={() => {
                                    stopTest();
                                    setText("");
                                    totalCharsRef.current = 0;
                                }}
                            >
                                Stop
                            </button>
                        </div>
                    </div>
                </header>

                <section className="typing-section">
                    <div id="word-section">
                        {wordset.slice(0, TOT_WORDS).map((word, i) => (
                            <div key={i} className={`word ${wordsCol[i]}`}>{word}</div>
                        ))}
                    </div>
                    <textarea
                        ref={textareaRef}
                        id="textarea-input"
                        value={text}
                        onChange={handleInput}
                        placeholder={
                            running
                                ? "Type... (words counted if correct)"
                                : "Click Start to begin the 60s test"
                        }
                        disabled={!running}
                    />
                </section>

                <section className="stats-section">
                    <div className="graph-container">
                        <SpeedGraphCanvas
                            getCurrentWpm={getCurrentWpm}
                            startTime={startedAt}
                            running={running}
                            duration={60}
                        />
                    </div>

                    <Speedometer wpm={avgWpm} />
                </section>
            </div>
        </div>
    );
}
