export default async function fetchWordList({ COUNT, currentLev }) {

    const fileName = currentLev + '.txt';
    const res = await fetch(fileName);
    if (!res.ok) throw new Error("Failed to load word list");
    console.log("Fetching : ", currentLev, fileName);
    const text = await res.text();
    const wordArray = text
        .split(/\s+/)
        .map(w => w.trim())
        .filter(Boolean);

    const shuffled = [...wordArray].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, COUNT);

    return selected;
}
