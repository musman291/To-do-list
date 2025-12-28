const TimetableModule = (() => {
    // State
    let timetables = [];
    let container = null;
    let clockInterval = null;

    const daysOfWeek = [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
    ];

    // Fetch tasks from backend
    async function fetchTasksFromServer() {
        try {
            const res = await fetch('http://localhost:5000/timetable-tasks');
            timetables = await res.json();
        } catch (err) {
            console.error('Error fetching tasks:', err);
        }
    }

    // Initialize module
    async function init(viewContainer) {
        container = viewContainer;
        await fetchTasksFromServer();
        renderTimetable();
        window.dispatchEvent(new CustomEvent('timetableUpdated'));
    }

    function getFormattedTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    function startClock() {
        if (clockInterval) clearInterval(clockInterval);

        const clockEl = document.getElementById('liveClock');
        if (clockEl) {
            clockEl.textContent = getFormattedTime();
            clockInterval = setInterval(() => {
                const el = document.getElementById('liveClock');
                if (el) el.textContent = getFormattedTime();
            }, 1000);
        }
    }

    // Render routine tasks
    function renderTimetable() {
        container.innerHTML = `
            <div class="content-header">
                <div>
                    <h1 class="page-title" id="liveClock">${getFormattedTime()}</h1>
                    <div class="view-switcher">
                        <button class="view-tab active" data-view="daily">Schedule</button>
                        <button class="view-tab" data-view="timeline">Timeline</button>
                    </div>
                </div>
            </div>
            <div id="timetableList" class="timeline-list"></div>
        `;

        startClock();
        const timetableList = document.getElementById('timetableList');

        // Rotate days so current day is on top
        const baseDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayIndex = new Date().getDay();
        const rotatedDays = [...baseDays.slice(todayIndex), ...baseDays.slice(0, todayIndex)];

        rotatedDays.forEach(day => {
            const dayTasks = timetables.filter(t => t.day === day).sort((a, b) => a.time.localeCompare(b.time));

            const groupEl = document.createElement('div');
            groupEl.className = 'timeline-group';

            let tasksHtml = '';

            if (dayTasks.length > 0) {
                tasksHtml = dayTasks.map(task => `
                    <div class="timeline-item">
                        <div class="t-row" style="align-items: center;">
                            <span class="t-time">${task.time}</span>
                            <span class="t-name">${task.name}${task.desc ? `<span class="t-desc" style="font-weight:normal; color:#555; padding-left:80px;">${task.desc}</span>` : ''}</span>
                            <div class="actions">
                                <button onclick="window.editTask('timetable', '${task.id}')" class="action-btn edit-btn" style="margin-right:8px;">Edit</button>
                                <button onclick="TimetableModule.deleteTask('${task.id}')" class="action-btn delete-btn">Delete</button>
                            </div>
                        </div>
                    </div>
                `).join('');
            } else {
                tasksHtml = '<div class="timeline-empty-space"></div>';
            }

            groupEl.innerHTML = `
                <div class="timeline-date">
                    <span>${day}</span>
                    <button class="add-day-task-btn" onclick="window.openTimetableModal({ day: '${day}' })" title="Add task to ${day}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                </div>
                ${tasksHtml}
            `;
            timetableList.appendChild(groupEl);
        });
    }

    // Save or update a task
    async function saveTask(taskData) {
        if (!taskData.id) taskData.id = Date.now().toString();

        try {
            const res = await fetch('http://localhost:5000/timetable-tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });
            const savedTask = await res.json();

            const index = timetables.findIndex(t => t.id === savedTask.id);
            if (index !== -1) timetables[index] = savedTask;
            else timetables.push(savedTask);

            renderTimetable();
            window.dispatchEvent(new CustomEvent('timetableUpdated'));
        } catch (err) {
            console.error('Error saving task:', err);
        }
    }

    // Delete a task
    async function deleteTask(id) {
        try {
            await fetch(`http://localhost:5000/timetable-tasks/${id}`, { method: 'DELETE' });
            timetables = timetables.filter(t => t.id !== id);
            renderTimetable();
            window.dispatchEvent(new CustomEvent('timetableUpdated'));
        } catch (err) {
            console.error('Error deleting task:', err);
        }
    }

    // Get a specific task
    function getTask(id) {
        return timetables.find(t => t.id === id);
    }

    function getAllTimetables() {
        return timetables;
    }

    return {
        init,
        renderTimetable,
        saveTask,
        deleteTask,
        getTask,
        getAllTimetables
    };
})();

window.TimetableModule = TimetableModule;