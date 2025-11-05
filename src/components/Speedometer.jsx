import React from "react";
import ReactSpeedometer from "react-d3-speedometer";

export default function Speedometer({ wpm }) {
    return (
        <div className="speedometer-container" id="speedometer">
            <ReactSpeedometer
                maxValue={200}
                value={wpm}
                needleColor="#111827"
                startColor="#84ff4fff"
                endColor="#f93c16ff"
                segments={8}
                height={220}
                width={320}
                textColor="#0f172a"
                ringWidth={40}
            />
            <div className="avg-wpm">Avg WPM: {wpm.toFixed(2)}</div>
            <p className="avg-info">Get your Live Words Per Minute :)</p>
        </div>
    );
}

