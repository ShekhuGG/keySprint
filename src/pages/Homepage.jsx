//@refresh reset
import React, { useEffect, useRef, useState } from "react";
import SpeedGraphCanvas from "../components/SpeedGraphCanvas";
import Speedometer from "../components/Speedometer";
import "../styles/Homepage.css";
import getwordlist from "../modules/wordlist.js";
import TestStats from "../components/TestStats.jsx"

export default function Homepage() {
    const [text, setText] = useState("");
    const [startedAt, setStartedAt] = useState(null);
    const [running, setRunning] = useState(false);
    const [avgWpm, setAvgWpm] = useState(0);
    const [testOver, setTestOver] = useState(false);
    const [wordset, setWordSet] = useState([]);
    const [wordsCol, setWordsCol] = useState([]);
    const [currentLev, setCurrentLev] = useState("easy");
    const [stopcnt, setstopcnt] = useState(0);
    const [maxspeed, setmax] = useState(localStorage.getItem("maxWpm") || 0);
    const rendix = useRef(0);

    const textareaRef = useRef(null);
    const COUNT = 300;
    const TOT_WORDS = 15;
    const totalCharsRef = useRef(0);
    const totalWordsRef = useRef(0);
    const avgIntervalRef = useRef(null);
    const TEST_DURATION_MS = 60000;
    const startedAtRef = useRef(null);
    const mxcolRef = useRef("black");
    const speedCol = ["#85c9a0ff", "#72d690ff", "#6bd147ff", "#d3ff25ff", "#ffe055ff", "#ff7a55ff", "#ff1717ff", "#9900ffff"]
    const speednow = localStorage.getItem("maxWpm")
    const getspeedcol = (speed) => {
        console.log("val : ", (Math.log10(speed ** 3).toFixed(0)));
        return speedCol[Math.max(0, (Math.log10(speed ** 3)).toFixed(0))];
    }
    mxcolRef.current = getspeedcol(speednow || 0);
    console.log("Col now : ", mxcolRef.current, speednow, getspeedcol(speednow))

    const totalCorrectRef = useRef(0);
    const totalIncorrectRef = useRef(0);
    const errorWordsRef = useRef([]);
    const stoppedAtRef = useRef(null);
    const [stats, setStats] = useState(null);

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
        console.log("AVG WPM : ", avgWpm);
        setText("");
        totalCharsRef.current = 0;
        setAvgWpm(0);
        setTestOver(false);
        rendix.current = 0;


        totalCorrectRef.current = 0;
        totalIncorrectRef.current = 0;
        errorWordsRef.current = [];
        stoppedAtRef.current = null;
        setStats(null);

        setTimeout(() => {
            textareaRef.current?.focus();
        }, 10);

        console.log("avg at st : ", avgWpm)

        if (wordsCol[0]) {
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
        startedAtRef.current = now;
        setRunning(true);

        if (avgIntervalRef.current) clearInterval(avgIntervalRef.current);
        avgIntervalRef.current = setInterval(() => {
            const elapsedMin = (Date.now() - now) / 60000;
            const avg = elapsedMin > 0 ? (totalWordsRef.current) / elapsedMin : 0;
            setAvgWpm(Number(avg.toFixed(2)));

            if (Date.now() - now >= TEST_DURATION_MS) {
                const n = stopcnt;
                setstopcnt(n + 1);
            };
        }, 500);
    };

    const stopTest = () => {
        if (stopcnt == 0) return;
        if (running)
            setTestOver(true);
        setRunning(false);
        console.log("beforeset : ", avgWpm);


        stoppedAtRef.current = Date.now();

        const elapsedMin = (stoppedAtRef.current - startedAtRef.current) / 60000;
        const finalWpm = elapsedMin > 0 ? totalWordsRef.current / elapsedMin : 0;
        console.log(Date.now(), startedAtRef.current, elapsedMin, " _ ", finalWpm);
        setAvgWpm(Number(finalWpm.toFixed(2)));
        console.log("afterset : ", avgWpm);


        const correctCount = totalCorrectRef.current;
        const incorrectCount = totalIncorrectRef.current;
        const totalTypedWords = correctCount + incorrectCount;
        const rawSpeed = elapsedMin > 0 ? totalTypedWords / elapsedMin : 0;

        const letterCounts = {};
        for (const item of errorWordsRef.current) {
            const src = (item.input || item.word || "").toLowerCase();
            for (const ch of src) {
                if (ch >= 'a' && ch <= 'z') {
                    letterCounts[ch] = (letterCounts[ch] || 0) + 1;
                }
            }
        }
        const topLetters = Object.entries(letterCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([letter, count]) => ({ letter, count }));

        const statsObj = {
            durationSec: Math.round((stoppedAtRef.current - startedAtRef.current) / 1000), // seconds
            durationMin: elapsedMin,
            rawSpeed: Number(rawSpeed.toFixed(2)),
            correctCount,
            incorrectCount,
            totalTypedWords,
            topLetters
        };
        setStats(statsObj);


        const currentMax = Number(localStorage.getItem("maxWpm") || 0);
        console.log("CUR MAX : ", currentMax, avgWpm);

        if (finalWpm > currentMax) {
            localStorage.setItem("maxWpm", finalWpm.toFixed(2));
            console.log("max updated");
            setmax(localStorage.getItem("maxWpm") || 0)
        }

        totalWordsRef.current = 0;
        if (avgIntervalRef.current) clearInterval(avgIntervalRef.current);
    };

    useEffect(stopTest, [stopcnt]);

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

                totalCorrectRef.current++;

                wordDone = true;
            } else if (newText.length) {
                markWord(rendix.current, "red");
                markWord(rendix.current + 1, "ongoing");

                totalIncorrectRef.current++;
                errorWordsRef.current.push({ word: currentWord, input: newText });

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


    // ==================================================

    return (
        <div className="homepage-container">
            <div className="homepage-content">
                <header className="header-section">
                    <div className="header-left">
                        <div id="headline"><h1>⌨️ KeySprint</h1></div>
                        <div style={{
                            display: "flex",
                            flexDirection: "row",
                            alignContent: "center",
                            alignItems: "center"

                        }} className="subtext">
                            <p>Start now → 60s key sprint → with real time SpeeeeD </p>
                            <p style={{ color: mxcolRef.current }} className="maxCol"> Your Max ({maxspeed})</p>
                        </div>
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
                                    setstopcnt(1);
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

                    <Speedometer wpm={avgWpm} col={getspeedcol(avgWpm)} />


                    {testOver && stats && (
                        <TestStats stats={stats} />
                    )}

                </section>
                <footer>
                    Made with <i style={{ color: "rgb(215, 11, 11)" }} className="fa-regular fa-heart"></i> by ShekZz
                </footer>
            </div >
        </div >
    );
}
