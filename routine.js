const RoutineModule = (() => {
    // State
    let routines = JSON.parse(localStorage.getItem('routines')) || [];
    let container = null;
    let clockInterval = null;

    const daysOfWeek = [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
    ];

    function init(viewContainer) {
        container = viewContainer;
        renderRoutineView();
    }

    function getFormattedTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    function startClock() {
        // Clear any existing interval
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

    function renderRoutineView() {
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
            <div id="routineList" class="timeline-list"></div>
        `;
        startClock();
        const routineList = document.getElementById('routineList');

        daysOfWeek.forEach(day => {
            const dayTasks = routines.filter(t => t.day === day).sort((a, b) => a.time.localeCompare(b.time));

            const groupEl = document.createElement('div');
            groupEl.className = 'timeline-group';

            let tasksHtml = '';

            if (dayTasks.length > 0) {
                tasksHtml = dayTasks.map(task => `
                    <div class="timeline-item">
                        <div class="t-row">
                            <span class="t-time">${task.time}</span>
                            <span class="t-name">${task.name}</span>
                            <div class="actions">
                                <button onclick="window.editTask('routine', '${task.id}')" class="action-btn edit-btn" style="margin-right:8px;">Edit</button>
                                <button onclick="RoutineModule.deleteTask('${task.id}')" class="action-btn delete-btn">Delete</button>
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
                    <button class="add-day-task-btn" onclick="window.openModal({ day: '${day}' })" title="Add task to ${day}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                </div>
                ${tasksHtml}
            `;
            routineList.appendChild(groupEl);
        });
    }

    function saveTask(taskData) {
        // taskData: { id (optional), day, name, time, desc }
        if (taskData.id) {
            // Update
            const index = routines.findIndex(t => t.id === taskData.id);
            if (index !== -1) {
                routines[index] = { ...routines[index], ...taskData };
            }
        } else {
            // Create
            const newTask = {
                id: Date.now().toString(),
                ...taskData
            };
            routines.push(newTask);
        }

        localStorage.setItem('routines', JSON.stringify(routines));
        renderRoutineView();
        window.dispatchEvent(new CustomEvent('routineUpdated'));
    }

    function deleteTask(id) {
        routines = routines.filter(t => t.id !== id);
        localStorage.setItem('routines', JSON.stringify(routines));
        renderRoutineView();
        window.dispatchEvent(new CustomEvent('routineUpdated'));
    }

    function getTask(id) {
        return routines.find(t => t.id === id);
    }

    function getAllRoutines() {
        return routines;
    }

    return {
        init,
        renderRoutineView,
        saveTask,
        deleteTask,
        getTask,
        getAllRoutines
    };
})();

window.RoutineModule = RoutineModule;
