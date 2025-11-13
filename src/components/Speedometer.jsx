import React from "react";
import ReactSpeedometer from "react-d3-speedometer";

export default function Speedometer({ wpm, col }) {
    let val = wpm.toFixed(2);
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
            <div style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                alignContent: "center",
                justifyContent: "center"
            }}>
                <div style={{
                    fontWeight: "700",
                    fontSize: "18px"
                }}>Avg WPM :</div>
                <div style={{
                    marginLeft: "10px",
                    fontWeight: "700",
                    fontSize: "3rem",
                    color: `${col}`
                }}>{val}</div>
            </div>
            <p className="avg-info">Get your Live Words Per Minute :)</p>
        </div >
    );
}

