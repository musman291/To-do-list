document.addEventListener('DOMContentLoaded', () => {
    // Stats
    const activeCountEl = document.getElementById('activeCount');
    const urgentCountEl = document.getElementById('urgentCount');

    // UI Elements
    const taskModal = document.getElementById('taskModal');
    const closeModal = document.querySelector('.close-modal');
    const taskForm = document.getElementById('taskForm');
    const modalTitle = document.getElementById('modalTitle');
    const modalDateFields = document.getElementById('modalDateFields');

    // View Switching
    const routineView = document.getElementById('routineView');
    const timelineView = document.getElementById('timelineView');

    let currentView = 'daily'; // 'daily' (mapped to routine) or 'timeline'

    // Initialize Modules
    RoutineModule.init(routineView);
    TimelineModule.init(timelineView);
    updateStats(); // Initial stats

    // --- View Switcher Logic (Event Delegation) ---
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-tab')) {
            const tab = e.target;
            currentView = tab.dataset.view; // 'daily' (mapped to routine) or 'timeline'

            const isRoutine = currentView === 'daily';

            if (isRoutine) {
                routineView.style.display = 'block';
                timelineView.style.display = 'none';
                RoutineModule.renderRoutineView(); // Refresh to update active state
            } else {
                routineView.style.display = 'none';
                timelineView.style.display = 'block';
                TimelineModule.renderTimeline(); // Refresh to update active state
            }
            updateStats();
        }
    });

    // --- Modal Logic ---
    window.openModal = function (taskToEdit = null) {
        taskModal.style.display = 'flex';
        taskForm.reset();
        document.getElementById('taskId').value = '';

        // Determine Mode: Edit (has ID) vs Add (no ID)
        const isEdit = taskToEdit && taskToEdit.id;

        let targetDay = '';

        if (isEdit) {
            document.getElementById('taskId').value = taskToEdit.id;
            document.getElementById('taskName').value = taskToEdit.name;
            document.getElementById('taskDesc').value = taskToEdit.desc || '';
            modalTitle.innerText = 'Edit Task';
            targetDay = taskToEdit.day;
        } else {
            // For Add Mode in Routine, we depend on the passed day argument
            targetDay = (taskToEdit && taskToEdit.day) ? taskToEdit.day : new Date().toLocaleDateString('en-US', { weekday: 'long' });
            modalTitle.innerText = currentView === 'daily' ? `Add Task to ${targetDay}` : 'Add Timeline Task';
        }

        // Context Aware Inputs & Population
        if (currentView === 'daily') {
            // Simplified for Routine: No Day Dropdown, Just Title (in static HTML) and Time
            // We inject the day as a hidden field
            modalDateFields.innerHTML = `
                <input type="hidden" id="taskDay" value="${targetDay}">
                <div class="form-row">
                    <div class="input-group">
                        <label for="taskTime">Time (24h)</label>
                        <input type="text" id="taskTime" class="time-24h" placeholder="HH:MM" maxlength="5" required value="${(taskToEdit && taskToEdit.time) ? taskToEdit.time : ''}">
                    </div>
                </div>
            `;
        } else {
            // Timeline Mode: Date and Time
            modalDateFields.innerHTML = `
                <div class="form-row">
                    <div class="input-group">
                        <label for="taskDate">Date</label>
                        <input type="date" id="taskDate" max="9999-12-31" required value="${(taskToEdit && taskToEdit.date) ? taskToEdit.date : ''}">
                    </div>
                    <div class="input-group">
                        <label for="taskTime">Time (24h)</label>
                        <input type="text" id="taskTime" class="time-24h" placeholder="HH:MM" maxlength="5" required value="${(taskToEdit && taskToEdit.time) ? taskToEdit.time : ''}">
                    </div>
                </div>
            `;
        }
    };

    // --- Time Input Restriction (24h HH:MM) ---
    document.addEventListener('input', function (e) {
        if (e.target && e.target.classList.contains('time-24h')) {
            let input = e.target.value.replace(/\D/g, ''); // Remove non-digits
            if (input.length > 4) input = input.substring(0, 4);

            if (input.length >= 3) {
                // Insert colon
                e.target.value = input.substring(0, 2) + ':' + input.substring(2);
            } else {
                e.target.value = input;
            }
        }
    });

    document.addEventListener('blur', function (e) {
        if (e.target && e.target.classList.contains('time-24h')) {
            // Validate limits
            const val = e.target.value;
            if (val.length === 5) {
                const [hh, mm] = val.split(':').map(Number);
                if (hh > 23 || mm > 59) {
                    alert('Invalid Time! Please use 24h format (00:00 to 23:59)');
                    e.target.value = ''; // Reset
                }
            } else if (val.length > 0) {
                // Incomplete
                alert('Please enter valid 24h time (HH:MM)');
                e.target.value = '';
            }
        }
    }, true);

    // --- Date Year Restriction (Max 4 digits) ---
    document.addEventListener('blur', function (e) {
        if (e.target.id === 'taskDate') {
            const val = e.target.value;
            if (val) {
                const parts = val.split('-');
                // parts[0] is year
                if (parts[0].length > 4) {
                    parts[0] = parts[0].substring(0, 4);
                    e.target.value = parts.join('-');
                }
            }
        }
    }, true);

    function closeModalFunc() {
        taskModal.style.display = 'none';
    }

    // Global Edit Function (called from modules)
    window.editTask = function (type, id) {
        let task = null;
        if (type === 'routine') {
            task = RoutineModule.getTask(id);
        } else {
            task = TimelineModule.getTask(id);
        }

        if (task) {
            // Ensure we are in the correct view (though button is only visible in that view)
            window.openModal(task);
        }
    };

    // --- Event Listeners ---
    if (closeModal) closeModal.addEventListener('click', closeModalFunc);
    window.addEventListener('click', (e) => {
        if (e.target === taskModal) closeModalFunc();
    });

    if (taskForm) {
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const id = document.getElementById('taskId').value;
            const name = document.getElementById('taskName').value;
            const desc = document.getElementById('taskDesc').value;
            const time = document.getElementById('taskTime').value;

            if (currentView === 'daily') {
                const day = document.getElementById('taskDay').value;
                const payload = { day, name, time, desc };
                if (id) payload.id = id;

                RoutineModule.saveTask(payload);
            } else {
                const date = document.getElementById('taskDate').value;
                const payload = { name, date, time, desc };
                if (id) payload.id = id;

                TimelineModule.saveTask(payload);
                updateStats(); // Update stats for timeline
            }

            closeModalFunc();
        });
    }

    // Global Stats Update
    function updateStats() {
        if (currentView === 'daily') {
            const routines = RoutineModule.getAllRoutines();
            activeCountEl.innerText = routines.length;

            // Urgent for Routine: Tasks Scheduled for Today (System Date)
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const todayName = days[new Date().getDay()];

            // Count tasks for today
            const urgentCount = routines.filter(r => r.day === todayName).length;
            urgentCountEl.innerText = urgentCount;

        } else {
            const tasks = TimelineModule.getTasks();
            activeCountEl.innerText = tasks.length;

            // Urgent for Timeline: Tasks < 24h
            const now = new Date();
            const urgentCount = tasks.filter(task => {
                const taskDate = new Date(`${task.date}T${task.time}`);
                const diffMs = taskDate - now;
                const diffHours = diffMs / (1000 * 60 * 60);
                return diffHours > 0 && diffHours < 24;
            }).length;

            urgentCountEl.innerText = urgentCount;
        }
    }

    // Listen for updates
    window.addEventListener('timelineUpdated', updateStats);
    window.addEventListener('routineUpdated', updateStats);
});
