export default async function fetchWordList(COUNT) {
    const res = await fetch("/toughset3k.txt");
    if (!res.ok) throw new Error("Failed to load word list");

    const text = await res.text();
    const wordArray = text
        .split(/\s+/)
        .map(w => w.trim())
        .filter(Boolean);

    const shuffled = [...wordArray].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, COUNT);

    return selected;
}
