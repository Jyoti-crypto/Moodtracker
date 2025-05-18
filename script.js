document.addEventListener('DOMContentLoaded', function() {
    const moodForm = document.getElementById('moodForm');
    const moodSelect = document.getElementById('mood');
    const moodHistory = document.getElementById('moodHistory');
    const moodHistoryHeader = document.getElementById('moodHistoryHeader');
    const clearHistoryButton = document.getElementById('clearHistory');
    const monthlyReport = document.getElementById('monthlyReport');
    const monthlyReportHeader = document.getElementById('monthlyReportHeader');
    const moodCalendarBody = document.querySelector("#moodCalendar tbody");
    const musicSuggestionHeader = document.getElementById("musicSuggestionHeader");
    const musicSuggestion = document.getElementById("musicSuggestion");
    const themeToggleButton = document.getElementById("themeToggle");

    const moodMusic = {
        happy: [{ song: "Happy - Pharrell Williams", link: "https://youtu.be/ZbZSe6N_BXs" }],
        sad: [{ song: "Someone Like You - Adele", link: "https://youtu.be/hLQl3WQQoQ0" }],
        anxious: [{ song: "Weightless - Marconi Union", link: "https://youtu.be/UfcAVejslrU" }],
        angry: [{ song: "Bring Me To Life - Evanescence", link: "https://youtu.be/UQ92eyxnxmA" }],
        excited: [{ song: "Titanium - David Guetta ft. Sia", link: "https://youtu.be/JRfuAukYTKg" }]
    };

    let savedMoods = JSON.parse(localStorage.getItem('moodHistory')) || [];

    function generateCalendar() {
        moodCalendarBody.innerHTML = '';

        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let dateCounter = 1;
        for (let week = 0; week < 6; week++) {
            const tr = document.createElement('tr');

            for (let day = 0; day < 7; day++) {
                const td = document.createElement('td');

                if (week === 0 && day < firstDay || dateCounter > daysInMonth) {
                    td.textContent = '';
                } else {
                    td.textContent = dateCounter;
                    td.setAttribute('data-date', `${year}-${month + 1}-${dateCounter}`);
                    dateCounter++;
                }

                tr.appendChild(td);
            }

            moodCalendarBody.appendChild(tr);
            if (dateCounter > daysInMonth) break;
        }
    }

    function updateMoodCalendar(moodData) {
        const allTds = moodCalendarBody.querySelectorAll('td');
        allTds.forEach(td => td.classList.remove('happy-day', 'sad-day', 'anxious-day', 'angry-day', 'excited-day'));

        const moodCounts = {};
        moodData.forEach(({ timestamp, value }) => {
            const dateObj = new Date(timestamp);
            const dateKey = `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}-${dateObj.getDate()}`;
            moodCounts[dateKey] = moodCounts[dateKey] || {};
            moodCounts[dateKey][value] = (moodCounts[dateKey][value] || 0) + 1;
        });

        allTds.forEach(td => {
            const dateKey = td.getAttribute('data-date');
            if (dateKey && moodCounts[dateKey]) {
                const dominantMood = Object.keys(moodCounts[dateKey]).reduce((a, b) => moodCounts[dateKey][a] > moodCounts[dateKey][b] ? a : b);
                if (dominantMood) td.classList.add(`${dominantMood}-day`);
            }
        });
    }

    function generateMonthlyReport(moodData) {
        if (!moodData.length) {
            monthlyReport.innerHTML = '';
            monthlyReportHeader.style.display = 'none';
            return;
        }

        const moodCounts = {};
        moodData.forEach(({ value }) => moodCounts[value] = (moodCounts[value] || 0) + 1);

        const dominantMood = Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b);
        monthlyReport.innerHTML = `Your dominant mood this month is <strong>${dominantMood}</strong>.`;
        monthlyReportHeader.style.display = 'block';
    }

    function suggestMusic(mood) {
        musicSuggestion.innerHTML = "";
        if (moodMusic[mood]) {
            musicSuggestionHeader.style.display = "block";
            moodMusic[mood].forEach(track => {
                const p = document.createElement("p");
                p.innerHTML = `<a href="${track.link}" target="_blank">${track.song}</a>`;
                musicSuggestion.appendChild(p);
            });
        }
    }

    function renderMoodHistory() {
        moodHistory.innerHTML = '';
        if (savedMoods.length === 0) {
            moodHistoryHeader.style.display = 'none';
            clearHistoryButton.style.display = 'none';
            monthlyReportHeader.style.display = 'none';
            musicSuggestionHeader.style.display = 'none';
            return;
        }

        savedMoods.forEach(({ text, timestamp, value }) => {
            const li = document.createElement('li');
            li.innerHTML = `${text} <span class="date">${timestamp}</span>`;
            li.classList.add(`mood-${value}`);
            moodHistory.appendChild(li);
        });

        moodHistoryHeader.style.display = 'block';
        clearHistoryButton.style.display = 'block';
        generateMonthlyReport(savedMoods);
        updateMoodCalendar(savedMoods);
    }

    generateCalendar();
    renderMoodHistory();

    moodForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const mood = moodSelect.value;
        if (!mood) return;

        const timestamp = new Date().toLocaleString();
        savedMoods.push({ text: moodSelect.options[moodSelect.selectedIndex].text, value: mood, timestamp });
        localStorage.setItem('moodHistory', JSON.stringify(savedMoods));

        renderMoodHistory();
        suggestMusic(mood);
        moodSelect.value = '';
    });

    clearHistoryButton.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear all mood history?')) {
            savedMoods = [];
            localStorage.removeItem('moodHistory');
            moodHistory.innerHTML = '';
            moodHistoryHeader.style.display = 'none';
            clearHistoryButton.style.display = 'none';
            monthlyReport.innerHTML = '';
            monthlyReportHeader.style.display = 'none';
            musicSuggestion.innerHTML = '';
            musicSuggestionHeader.style.display = 'none';

            generateCalendar();
            moodCalendarBody.querySelectorAll('td').forEach(td => td.className = '');
        }
    });

    // ✅ Dark Mode Toggle Logic
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }

    themeToggleButton.addEventListener('click', function () {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    });
});
