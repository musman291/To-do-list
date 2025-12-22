const TimelineModule = (() => {
    // State
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let container = null;

    function init(viewContainer) {
        container = viewContainer;
        renderTimeline();
    }

    function getFormattedDate() {
        const now = new Date();
        const day = now.toLocaleDateString('en-US', { weekday: 'long' });
        const month = now.toLocaleDateString('en-US', { month: 'long' });
        const date = now.getDate();
        return `${day} ${month}, ${date}`;
    }

    function renderTimeline() {
        container.innerHTML = `
            <div class="content-header">
                <div>
                    <h1 class="page-title">${getFormattedDate()}</h1>
                    <div class="view-switcher">
                        <button class="view-tab" data-view="daily">Schedule</button>
                        <button class="view-tab active" data-view="timeline">Timeline</button>
                    </div>
                </div>
                <button class="primary-btn" onclick="window.openModal(null)">
                    + Add New Task
                </button>
            </div>
            <div id="timelineGrid" class="timeline-list"></div>
        `;
        const timelineGrid = document.getElementById('timelineGrid');

        const sortedTasks = tasks.sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return a.time.localeCompare(b.time);
        });

        if (sortedTasks.length === 0) {
            timelineGrid.innerHTML = '<div style="padding:40px; text-align:center; color:var(--text-muted);">No Upcoming Tasks.</div>';
            return;
        }

        // Group by Date
        const grouped = {};
        sortedTasks.forEach(task => {
            if (!grouped[task.date]) grouped[task.date] = [];
            grouped[task.date].push(task);
        });

        // Loop through dates
        Object.keys(grouped).forEach(date => {
            const groupTasks = grouped[date];
            const dateObj = new Date(date);
            const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

            const groupEl = document.createElement('div');
            groupEl.className = 'timeline-group';

            let tasksHtml = groupTasks.map(task => `
                <div class="timeline-item">
                    <div class="t-row">
                        <span class="t-time">${task.time}</span>
                        <span class="t-name">${task.name}</span>
                        <div class="actions">
                             <button onclick="window.editTask('timeline', '${task.id}')" class="action-btn edit-btn" style="margin-right:8px;">Edit</button>
                            <button onclick="TimelineModule.deleteTask('${task.id}')" class="action-btn delete-btn">Delete</button>
                        </div>
                    </div>
                </div>
            `).join('');

            groupEl.innerHTML = `
                <div class="timeline-date">${dateStr}</div>
                ${tasksHtml}
            `;
            timelineGrid.appendChild(groupEl);
        });
    }

    function saveTask(taskData) {
        // taskData: { id (optional), name, date, time, desc }
        if (taskData.id) {
            // Update
            const index = tasks.findIndex(t => t.id === taskData.id);
            if (index !== -1) {
                tasks[index] = { ...tasks[index], ...taskData };
            }
        } else {
            // Create
            const newTask = {
                id: Date.now().toString(),
                ...taskData
            };
            tasks.push(newTask);
        }

        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTimeline();
        window.dispatchEvent(new CustomEvent('timelineUpdated'));
        return true;
    }

    function deleteTask(id) {
        tasks = tasks.filter(t => t.id !== id);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTimeline();
        // Trigger global stats update if needed
        window.dispatchEvent(new CustomEvent('timelineUpdated'));
    }

    function getTask(id) {
        return tasks.find(t => t.id === id);
    }

    function getTasks() {
        return tasks;
    }

    return {
        init,
        saveTask,
        deleteTask,
        getTask,
        getTasks,
        renderTimeline
    };
})();

window.TimelineModule = TimelineModule;
