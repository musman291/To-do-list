const TimelineModule = (() => {
    // State
    let tasks = [];
    let container = null;

    // Fetch tasks from backend
    async function fetchTasksFromServer() {
        try {
            const res = await fetch('http://localhost:5000/timeline-tasks');
            tasks = await res.json();
        } catch (err) {
            console.error('Error fetching timeline tasks:', err);
        }
    }

    // Initialize module
    async function init(viewContainer) {
        container = viewContainer;
        await fetchTasksFromServer();
        renderTimeline();
        window.dispatchEvent(new CustomEvent('timelineUpdated'));
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
                <button class="primary-btn" onclick="window.openTimelineModal(null)">
                    + Add New Task
                </button>
            </div>
            <div id="timelineGrid" class="timeline-list"></div>
        `;

        const timelineGrid = container.querySelector('#timelineGrid');

        const sortedTasks = tasks.sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return a.time.localeCompare(b.time);
        });

        if (sortedTasks.length === 0) {
            timelineGrid.innerHTML = '<div style="padding:40px; text-align:center; color:var(--text-muted);">No Upcoming Tasks.</div>';
            return;
        }

        // Group tasks by date
        const grouped = {};
        sortedTasks.forEach(task => {
            if (!grouped[task.date]) grouped[task.date] = [];
            grouped[task.date].push(task);
        });

        // Render each date group
        Object.keys(grouped).forEach(date => {
            const groupTasks = grouped[date];
            const dateObj = new Date(date);
            const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

            const groupEl = document.createElement('div');
            groupEl.className = 'timeline-group';

            const tasksHtml = groupTasks.map(task => `
                <div class="timeline-item">
                    <div class="t-row">
                        <span class="t-time">${task.time}</span>
                        <span class="t-name">${task.name}${task.desc ? `<span class=\"t-desc\" style=\"font-weight:normal; color:#555; padding-left:80px;\">${task.desc}</span>` : ''}</span>
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

    // Save or update task
    async function saveTask(taskData) {
        if (!taskData.id) taskData.id = Date.now().toString();

        try {
            const res = await fetch('http://localhost:5000/timeline-tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });
            const savedTask = await res.json();

            const index = tasks.findIndex(t => t.id === savedTask.id);
            if (index !== -1) tasks[index] = savedTask;
            else tasks.push(savedTask);

            renderTimeline();
            window.dispatchEvent(new CustomEvent('timelineUpdated'));
        } catch (err) {
            console.error('Error saving task:', err);
        }
    }

    // Delete task
    async function deleteTask(id) {
        try {
            await fetch(`http://localhost:5000/timeline-tasks/${id}`, { method: 'DELETE' });
            tasks = tasks.filter(t => t.id !== id);
            renderTimeline();
            window.dispatchEvent(new CustomEvent('timelineUpdated'));
        } catch (err) {
            console.error('Error deleting task:', err);
        }
    }

    // Get specific task
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
