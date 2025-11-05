import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function SpeedGraph({ currentRun, prevRun }) {
    return (
        <div style={{ width: "90%", height: 300, margin: "auto" }}>
            <ResponsiveContainer>
                <LineChart data={currentRun}>
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 'dataMax + 20']} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="wpm" stroke="#8884d8" name="Current Run" />
                    {prevRun && (
                        <Line type="monotone" dataKey="wpm" data={prevRun} stroke="#82ca9d" name="Previous Run" />
                    )}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
