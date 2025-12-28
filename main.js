document.addEventListener('DOMContentLoaded', () => {
    // --- Stats Elements ---
    const activeCountEl = document.getElementById('activeCount');
    const urgentCountEl = document.getElementById('urgentCount');

    // --- Timetable Modal Elements ---
    const timetableModal = document.getElementById('timetableModal');
    const closeTimetableModal = document.getElementById('closeTimetableModal');
    const timetableTaskForm = document.getElementById('timetableTaskForm');
    const timetableModalTitle = document.getElementById('timetableModalTitle');

    // --- Timeline Modal Elements ---
    const timelineModal = document.getElementById('timelineModal');
    const closeTimelineModal = document.getElementById('closeTimelineModal');
    const timelineTaskForm = document.getElementById('timelineTaskForm');
    const timelineModalTitle = document.getElementById('timelineModalTitle');

    // --- Views ---
    const timetableView = document.getElementById('timetableContainer');
    const timelineView = document.getElementById('timelineContainer');
    let currentView = 'daily'; // 'daily' (timetable) or 'timeline'

    // --- Initialize Modules ---
    TimetableModule.init(timetableView);
    TimelineModule.init(timelineView);
    updateStats(); // Initial stats

    // --- View Switching ---
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-tab')) {
            currentView = e.target.dataset.view;

            // Update active tab visually
            document.querySelectorAll('.view-tab').forEach(tab => tab.classList.remove('active'));
            e.target.classList.add('active');

            // Show/hide views and render
            if (currentView === 'daily') {
                timetableView.style.display = 'block';
                timelineView.style.display = 'none';
                TimetableModule.renderTimetable();
            } else {
                timetableView.style.display = 'none';
                timelineView.style.display = 'block';
                TimelineModule.renderTimeline();
            }

            updateStats();
        }
    });

    // --- Open Timetable Modal ---
    window.openTimetableModal = function (task = null) {
        timetableModal.style.display = 'flex';
        timetableTaskForm.reset();
        document.getElementById('timetableTaskId').value = '';
        const targetDay = task?.day || new Date().toLocaleDateString('en-US', { weekday: 'long' });

        if (task?.id) {
            document.getElementById('timetableTaskId').value = task.id;
            document.getElementById('timetableTaskName').value = task.name;
            document.getElementById('timetableTaskTime').value = task.time || '';
            document.getElementById('timetableTaskDesc').value = task.desc || '';
            document.getElementById('timetableTaskDay').value = task.day;
            timetableModalTitle.innerText = 'Edit Timetable Task';
        } else {
            document.getElementById('timetableTaskDay').value = targetDay;
            timetableModalTitle.innerText = `Add Task to ${targetDay}`;
        }
    };

    // --- Open Timeline Modal ---
    window.openTimelineModal = function (task = null) {
        timelineModal.style.display = 'flex';
        timelineTaskForm.reset();
        document.getElementById('timelineTaskId').value = '';

        if (task?.id) {
            document.getElementById('timelineTaskId').value = task.id;
            document.getElementById('timelineTaskName').value = task.name;
            document.getElementById('timelineTaskTime').value = task.time || '';
            document.getElementById('timelineTaskDesc').value = task.desc || '';
            document.getElementById('timelineTaskDate').value = task.date;
            timelineModalTitle.innerText = 'Edit Timeline Task';
        } else {
            timelineModalTitle.innerText = 'Add Timeline Task';
        }
    };

    // --- Close Modals ---
    const closeTimetableModalFunc = () => timetableModal.style.display = 'none';
    const closeTimelineModalFunc = () => timelineModal.style.display = 'none';

    closeTimetableModal?.addEventListener('click', closeTimetableModalFunc);
    closeTimelineModal?.addEventListener('click', closeTimelineModalFunc);
    window.addEventListener('click', e => {
        if (e.target === timetableModal) closeTimetableModalFunc();
        if (e.target === timelineModal) closeTimelineModalFunc();
    });

    // --- Time Input Validation ---
    document.addEventListener('input', e => {
        if (e.target.classList.contains('time-24h')) {
            let val = e.target.value.replace(/\D/g, '').substring(0, 4);
            e.target.value = val.length >= 3 ? val.substring(0, 2) + ':' + val.substring(2) : val;
        }
    });
    document.addEventListener('blur', e => {
        if (e.target.classList.contains('time-24h')) {
            const val = e.target.value;
            if (val.length === 5) {
                const [hh, mm] = val.split(':').map(Number);
                if (hh > 23 || mm > 59) { alert('Invalid time!'); e.target.value = ''; }
            } else if (val.length > 0) { alert('Please enter HH:MM'); e.target.value = ''; }
        }
    }, true);

    // --- Form Submissions ---
    timetableTaskForm?.addEventListener('submit', e => {
        e.preventDefault();
        const payload = {
            id: document.getElementById('timetableTaskId').value || undefined,
            day: document.getElementById('timetableTaskDay').value,
            name: document.getElementById('timetableTaskName').value,
            time: document.getElementById('timetableTaskTime').value,
            desc: document.getElementById('timetableTaskDesc').value
        };
        TimetableModule.saveTask(payload);
        closeTimetableModalFunc();
    });

    timelineTaskForm?.addEventListener('submit', e => {
        e.preventDefault();
        const payload = {
            id: document.getElementById('timelineTaskId').value || undefined,
            name: document.getElementById('timelineTaskName').value,
            date: document.getElementById('timelineTaskDate').value,
            time: document.getElementById('timelineTaskTime').value,
            desc: document.getElementById('timelineTaskDesc').value
        };
        TimelineModule.saveTask(payload);
        updateStats();
        closeTimelineModalFunc();
    });

    // --- Global Edit Function ---
    window.editTask = function (type, id) {
        if (type === 'timetable') {
            const task = TimetableModule.getTask(id);
            if (task) window.openTimetableModal(task);
        } else {
            const task = TimelineModule.getTask(id);
            if (task) window.openTimelineModal(task);
        }
    };

    // --- Stats Update ---
    function updateStats() {
        const now = new Date();
        const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const today = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];

        if (currentView === 'daily') {
            const timetables = TimetableModule.getAllTimetables();
            const todayTasks = timetables.filter(r => r.day === today);

            activeCountEl.innerText = todayTasks.length;
            const urgentCount = todayTasks.filter(r => r.time >= currentTimeStr).length;
            urgentCountEl.innerText = urgentCount;
        } else {
            const tasks = TimelineModule.getTasks();
            activeCountEl.innerText = tasks.length;

            const todayIso = now.toISOString().split('T')[0];
            const urgentCount = tasks.filter(t => t.date === todayIso && t.time >= currentTimeStr).length;
            urgentCountEl.innerText = urgentCount;
        }
    }

    // Refresh stats every 30 seconds to catch time transitions
    setInterval(updateStats, 30000);

    // --- Listen for updates ---
    window.addEventListener('timelineUpdated', updateStats);
    window.addEventListener('timetableUpdated', updateStats);
});
