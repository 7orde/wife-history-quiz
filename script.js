// Event data
let events = [];
let currentEventIndex = 0;
let score = 0;
let totalEvents = 0;
let distances = [];
let submitted = false;

// DOM elements
const eventQuestionEl = document.getElementById('eventQuestion');
const eventContainerEl = document.getElementById('eventContainer');
const yearSliderEl = document.getElementById('yearSlider');
const selectedYearEl = document.getElementById('selectedYear');
const submitBtn = document.getElementById('submitBtn');
const nextBtn = document.getElementById('nextBtn');
const feedbackEl = document.getElementById('feedback');
const timelineContainer = document.getElementById('timelineContainer');
const userMarker = document.getElementById('userMarker');
const correctMarker = document.getElementById('correctMarker');
const answerPopup = document.getElementById('answerPopup');
const correctCountEl = document.getElementById('correctCount');
const totalCountEl = document.getElementById('totalCount');
const accuracyEl = document.getElementById('accuracy');
const eventsCompletedEl = document.getElementById('eventsCompleted');

const statsArea = document.getElementById('statsArea');
const yearDecrementBtn = document.getElementById('yearDecrement');
const yearIncrementBtn = document.getElementById('yearIncrement');

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Check if event is USSR-related
function isUSSREvent(eventName) {
    const ussrKeywords = ['USSR', 'Soviet', 'Bolshevik', 'Lenin', 'Stalin', 'Russian Revolution', 'October Revolution'];
    return ussrKeywords.some(keyword => eventName.includes(keyword));
}

// Load events from JSON
async function loadEvents() {
    try {
        const response = await fetch('./events.json');
        events = await response.json();
        events = shuffleArray(events);
        totalEvents = events.length;
        totalCountEl.textContent = totalEvents;
        console.log('Events loaded and shuffled:', events);
        
        if (events.length > 0) {
            loadEvent();
        }
    } catch (error) {
        console.error('Error loading events:', error);
        eventQuestionEl.textContent = 'Error loading events';
    }
}

// Load a new event with animation
function loadEvent() {
    if (currentEventIndex >= events.length) {
        showGameOver();
        return;
    }

    submitted = false;
    const event = events[currentEventIndex];
    
    console.log('Loading event:', event);
    
    // Reset UI
    feedbackEl.textContent = '';
    feedbackEl.className = '';
    yearSliderEl.value = 1950;
    selectedYearEl.textContent = '1950';
    correctMarker.classList.remove('show');
    answerPopup.classList.remove('show', 'correct', 'incorrect');
    submitBtn.style.display = 'block';
    nextBtn.style.display = 'none';
    
    // Set the text first
    const questionText = event.name;
    eventQuestionEl.textContent = questionText;
    console.log('Question text set to:', questionText);
    
    // Animate the parent container in
    gsap.fromTo('#eventContainer', 
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'back.out' }
    );
    
    // Update marker position
    updateTimelineMarker();
}

// Update timeline marker based on slider
function updateTimelineMarker() {
    const year = parseInt(yearSliderEl.value);
    const minYear = parseInt(yearSliderEl.min);
    const maxYear = parseInt(yearSliderEl.max);
    const percentage = ((year - minYear) / (maxYear - minYear)) * 100;
    
    gsap.to(userMarker, {
        left: percentage + '%',
        duration: 0.3,
        ease: 'power2.out'
    });
    
    selectedYearEl.textContent = year;
    
    // Update arrow button states
    yearDecrementBtn.disabled = year <= minYear;
    yearIncrementBtn.disabled = year >= maxYear;
    yearDecrementBtn.style.opacity = year <= minYear ? '0.5' : '1';
    yearIncrementBtn.style.opacity = year >= maxYear ? '0.5' : '1';
}

// Slider event listener
yearSliderEl.addEventListener('input', updateTimelineMarker);

// Arrow button event listeners for year adjustment
yearDecrementBtn.addEventListener('click', () => {
    const currentYear = parseInt(yearSliderEl.value);
    const minYear = parseInt(yearSliderEl.min);
    if (currentYear > minYear) {
        yearSliderEl.value = currentYear - 1;
        updateTimelineMarker();
    }
});

yearIncrementBtn.addEventListener('click', () => {
    const currentYear = parseInt(yearSliderEl.value);
    const maxYear = parseInt(yearSliderEl.max);
    if (currentYear < maxYear) {
        yearSliderEl.value = currentYear + 1;
        updateTimelineMarker();
    }
});

// Submit answer
submitBtn.addEventListener('click', checkAnswer);

// Next button
nextBtn.addEventListener('click', () => {
    currentEventIndex++;
    nextBtn.style.display = 'none';
    submitBtn.style.display = 'block';
    yearSliderEl.disabled = false;
    yearDecrementBtn.disabled = false;
    yearIncrementBtn.disabled = false;
    submitBtn.disabled = false;
    loadEvent();
});

function checkAnswer() {
    if (submitted) return;
    submitted = true;

    const userYear = parseInt(yearSliderEl.value);
    const correctYear = parseInt(events[currentEventIndex].date);
    const distance = Math.abs(userYear - correctYear);
    const maxDistance = 100; // Max possible distance in years
    const isCorrect = distance === 0; // Exactly correct

    distances.push(distance);

    // Show correct answer marker
    const minYear = parseInt(yearSliderEl.min);
    const maxYear = parseInt(yearSliderEl.max);
    const correctPercentage = ((correctYear - minYear) / (maxYear - minYear)) * 100;
    
    // Position the correct marker
    correctMarker.style.left = correctPercentage + '%';
    correctMarker.classList.add('show');
    gsap.to(correctMarker, {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out'
    });

    // Show answer popup
    answerPopup.classList.add('show');
    if (isCorrect) {
        answerPopup.classList.add('correct');
        answerPopup.classList.remove('incorrect');
    } else {
        answerPopup.classList.add('incorrect');
        answerPopup.classList.remove('correct');
    }

    // Update score
    if (isCorrect) {
        score++;
        correctCountEl.textContent = score;
        
        // Easter egg: Show hammer and sickle for USSR events
        if (isUSSREvent(events[currentEventIndex].name)) {
            const ussrLogo = document.getElementById('ussrLogo');
            ussrLogo.style.filter = 'blur(10px)';
            gsap.to(ussrLogo, {
                opacity: 1,
                duration: 0.8,
                ease: 'power2.out',
                onStart: () => {
                    ussrLogo.style.filter = 'blur(10px)';
                },
                onUpdate: function() {
                    const progress = this.progress();
                    const blur = 10 * (1 - progress);
                    ussrLogo.style.filter = `blur(${blur}px)`;
                }
            });
        }
        
        // Success animation
        gsap.to(feedbackEl, {
            opacity: 1,
            duration: 0.3
        });
        
        feedbackEl.innerHTML = `
            <div class="text-green-400 font-bold">✓ Correct!</div>
            <div class="text-xs text-gray-600 mt-1">You were ${distance} year${distance !== 1 ? 's' : ''} off</div>
        `;
        feedbackEl.className = 'text-center';

        answerPopup.innerHTML = `
            <div class="font-bold text-green-400 mb-1">✓ Correct!</div>
            <div class="text-sm text-white">${events[currentEventIndex].name}</div>
            <div class="text-xs text-gray-500 mt-2">${correctYear}</div>
        `;

        // Popup animation
        gsap.fromTo(answerPopup,
            { opacity: 0, y: -20, scale: 0.8 },
            { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out' }
        );

        // Celebration animation
        gsap.to(submitBtn, {
            backgroundColor: '#4ade80',
            color: '#000',
            duration: 0.5
        });

        createConfetti();
    } else {
        // Incorrect animation
        gsap.to(feedbackEl, {
            opacity: 1,
            duration: 0.3
        });
        
        feedbackEl.innerHTML = `
            <div class="text-red-400 font-bold">✗ Incorrect</div>
            <div class="text-xs text-gray-600 mt-1">
                Your guess: <span class="font-semibold">${userYear}</span> | 
                Correct: <span class="font-semibold">${correctYear}</span>
            </div>
            <div class="text-xs text-gray-700 mt-1">You were ${distance} years off</div>
        `;
        feedbackEl.className = 'text-center';

        answerPopup.innerHTML = `
            <div class="font-bold text-red-400 mb-1">✗ Incorrect</div>
            <div class="text-sm text-white">${events[currentEventIndex].name}</div>
            <div class="text-xs text-gray-500 mt-2">${correctYear}</div>
        `;

        // Popup animation with shake
        gsap.fromTo(answerPopup,
            { opacity: 0, y: -20, scale: 0.8 },
            { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out' }
        );
    }

    // Disable slider after submission
    yearSliderEl.disabled = true;
    yearDecrementBtn.disabled = true;
    yearIncrementBtn.disabled = true;
    submitBtn.disabled = true;
    gsap.to(submitBtn, { opacity: 0.6, duration: 0.3 });

    // Hide answer popup after 5 seconds
    gsap.delayedCall(5, () => {
        gsap.to(answerPopup, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                answerPopup.classList.remove('show');
            }
        });
    });

    // Show next button after delay
    gsap.delayedCall(1.5, () => {
        nextBtn.style.display = 'block';
        gsap.fromTo(nextBtn,
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out' }
        );
    });

    updateStats();
}

// Create confetti effect for correct answers
function createConfetti() {
    const colors = ['#ffffff', '#4ade80', '#60a5fa', '#fbbf24'];
    const confettiCount = 20;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.borderRadius = '50%';
        confetti.style.pointerEvents = 'none';
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.style.top = '-10px';
        confetti.style.zIndex = '9999';
        
        document.body.appendChild(confetti);

        gsap.to(confetti, {
            y: window.innerHeight + 10,
            x: (Math.random() - 0.5) * 200,
            opacity: 0,
            duration: 2 + Math.random() * 1,
            ease: 'power2.in',
            onComplete: () => {
                confetti.remove();
            }
        });
    }
}

// Update statistics
function updateStats() {
    eventsCompletedEl.textContent = currentEventIndex + 1;
    
    const accuracy = Math.round((score / (currentEventIndex + 1)) * 100);
    accuracyEl.textContent = accuracy + '%';
    
    statsArea.classList.remove('hidden');
}

// Show game over screen
function showGameOver() {
    const minY = 20;
    const maxY = 200;
    const randomY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

    gsap.to(submitBtn, { opacity: 0, y: randomY, duration: 0.5 });
    gsap.to(nextBtn, { opacity: 0, y: randomY, duration: 0.5 });
    
    const finalAccuracy = Math.round((score / totalEvents) * 100);

    const gameOverHTML = `
        <div class="text-center">
            <h2 class="text-3xl font-bold text-white mb-8">Quiz Complete! 🎉</h2>
            <div class="space-y-4 mb-8">
                <div>
                    <div class="text-4xl font-bold text-white">${score}</div>
                    <div class="text-sm text-gray-600">Correct Answers</div>
                </div>
                <div>
                    <div class="text-4xl font-bold text-white">${finalAccuracy}%</div>
                    <div class="text-sm text-gray-600">Accuracy</div>
                </div>
            </div>
            <button id="restartBtn" class="w-full bg-white text-black font-semibold py-3 px-8 rounded-lg hover:shadow-lg transition-all">
                Try Again
            </button>
        </div>
    `;

    feedbackEl.innerHTML = gameOverHTML;
    feedbackEl.className = 'text-center';
    
    gsap.fromTo(feedbackEl,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out' }
    );

    document.getElementById('restartBtn').addEventListener('click', restartQuiz);
}

// Restart quiz
function restartQuiz() {
    currentEventIndex = 0;
    score = 0;
    distances = [];
    correctCountEl.textContent = '0';
    statsArea.classList.add('hidden');
    feedbackEl.textContent = '';
    feedbackEl.className = '';
    yearSliderEl.disabled = false;
    submitBtn.disabled = false;
    gsap.to(submitBtn, { opacity: 1, duration: 0.3, backgroundColor: 'rgb(102, 126, 234)' });
    
    loadEvent();
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', loadEvents);