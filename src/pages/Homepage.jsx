import React, { useEffect, useRef, useState } from "react";
import SpeedGraphCanvas from "../components/SpeedGraphCanvas";
import Speedometer from "../components/Speedometer";
import "../styles/Homepage.css";

export default function Homepage() {
    const [text, setText] = useState("");
    const [startedAt, setStartedAt] = useState(null);
    const [running, setRunning] = useState(false);
    const [avgWpm, setAvgWpm] = useState(0);
    const [testOver, setTestOver] = useState(false);

    const totalCharsRef = useRef(0);
    const avgIntervalRef = useRef(null);
    const TEST_DURATION_MS = 60000;

    const startTest = () => {
        setText("");
        totalCharsRef.current = 0;
        setAvgWpm(0);
        setTestOver(false);

        const now = Date.now();
        setStartedAt(now);
        setRunning(true);

        if (avgIntervalRef.current) clearInterval(avgIntervalRef.current);
        avgIntervalRef.current = setInterval(() => {
            const elapsedMin = (Date.now() - now) / 60000;
            const avg = elapsedMin > 0 ? (totalCharsRef.current / 5) / elapsedMin : 0;
            setAvgWpm(Number(avg.toFixed(2)));

            if (Date.now() - now >= TEST_DURATION_MS) {
                stopTest();
            }
        }, 500);
    };

    const stopTest = () => {
        setRunning(false);
        setTestOver(true);
        if (avgIntervalRef.current) clearInterval(avgIntervalRef.current);
    };

    const handleInput = (e) => {
        const newText = e.target.value;
        const diff = newText.length - text.length;
        if (running && diff > 0) totalCharsRef.current += diff;
        setText(newText);
    };

    const getCurrentWpm = () => {
        if (!startedAt) return 0;
        const elapsedMin = (Date.now() - startedAt) / 60000;
        return elapsedMin > 0 ? (totalCharsRef.current / 5) / elapsedMin : 0;
    };

    useEffect(() => {
        return () => clearInterval(avgIntervalRef.current);
    }, []);

    return (
        <div className="homepage-container">
            <div className="homepage-content">
                <header className="header-section">
                    <div className="header-left">
                        <div id="headline">⌨️ KeySprint</div>
                        <p className="subtext">Start now → 60s key sprint → with real time SpeeeeD</p>
                    </div>

                    <div className="header-right">
                        <div className="status-text">
                            {testOver ? "Test ended" : running ? "Running" : "Ready"}
                        </div>
                        <div className="btn-group">
                            <button
                                className={`btn start-btn ${running ? "disabled" : ""}`}
                                onClick={startTest}
                                disabled={running}
                            >
                                Start
                            </button>
                            <button
                                className="btn stop-btn"
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
                    <textarea
                        id="textarea-input"
                        value={text}
                        onChange={handleInput}
                        placeholder={
                            running
                                ? "Type... (characters counted when added)"
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

                    <Speedometer wpm={avgWpm}></Speedometer>
                </section>
            </div>
        </div>
    );
}
