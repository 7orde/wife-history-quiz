function play() {
    const event = events[Math.floor(Math.random() * events.length)];
    const userAnswer = prompt(`In which year did the following event occur: ${event.name}?`); }

const events = [
    { id: 1, name: "Soviet Union Established", year: "1922" }, 
    { id: 2, name: "World War II Ends", year: "1945" },
    { id: 3, name: "JFK Assassination", year: "1963" },
    { id: 4, name: "Vietnam War Ends", year: "1975" },
    { id: 5, name: "Chinese Soviet Republic Established", year: "1933" }
];