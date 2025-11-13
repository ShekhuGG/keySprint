import "../styles/TestStats.css"

export default function TestStats({ stats }) {
    if (!stats) return null; 
    const badge = (label, value, color) => (
        <div className="badge">
            <div className="e1">{label}</div>
            <div className="e2" style={{ color, marginLeft: "3vw" }}>{value}</div>
        </div>
    );

    return (
        <div id="stats-container">
            <div  className="test-stats">
                <h3 style={{ margin: "0 0 8px 0", textAlign: "center" }}>Test Summary</h3>
                {badge("Total duration", `${stats.durationSec} s (${(stats.durationMin * 60).toFixed(0)}s)`, "#333")}
                {badge("Raw speed (wpm)", stats.rawSpeed, "#333")}
                {badge("Correct words", stats.correctCount, "green")}
                {badge("Incorrect words", stats.incorrectCount, "red")}
                <div style={{ paddingTop: 8, width: "30vw", display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                    <div style={{ marginBottom: 6, fontWeight: 600 }}>Top 5 tough letters</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {stats.topLetters.length ? (
                            stats.topLetters.map(t => (
                                <div key={t.letter} style={{ padding: "6px 8px", borderRadius: 6, background: "#f4f4f4" }}>
                                    <div style={{ fontWeight: 700 }}>{t.letter}</div>
                                    <div style={{ fontSize: 12, color: "#666" }}>{t.count}</div>
                                </div>
                            ))
                        ) : (
                            <div style={{ color: "#666" }}>No frequent mistakes recorded</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};