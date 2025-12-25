document.addEventListener('DOMContentLoaded', () => {
    // --- Stats Elements ---
    const activeCountEl = document.getElementById('activeCount');
    const urgentCountEl = document.getElementById('urgentCount');

    // --- Routine Modal Elements ---
    const routineModal = document.getElementById('routineModal');
    const closeRoutineModal = document.getElementById('closeRoutineModal');
    const routineTaskForm = document.getElementById('routineTaskForm');
    const routineModalTitle = document.getElementById('routineModalTitle');

    // --- Timeline Modal Elements ---
    const timelineModal = document.getElementById('timelineModal');
    const closeTimelineModal = document.getElementById('closeTimelineModal');
    const timelineTaskForm = document.getElementById('timelineTaskForm');
    const timelineModalTitle = document.getElementById('timelineModalTitle');

    // --- Views ---
    const routineView = document.getElementById('routineContainer');
    const timelineView = document.getElementById('timelineContainer');
    let currentView = 'daily'; // 'daily' (routine) or 'timeline'

    // --- Initialize Modules ---
    RoutineModule.init(routineView);
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
                routineView.style.display = 'block';
                timelineView.style.display = 'none';
                RoutineModule.renderRoutineView();
            } else {
                routineView.style.display = 'none';
                timelineView.style.display = 'block';
                TimelineModule.renderTimeline();
            }

            updateStats();
        }
    });

    // --- Open Routine Modal ---
    window.openRoutineModal = function(task = null) {
        routineModal.style.display = 'flex';
        routineTaskForm.reset();
        document.getElementById('routineTaskId').value = '';
        const targetDay = task?.day || new Date().toLocaleDateString('en-US', { weekday: 'long' });

        if (task?.id) {
            document.getElementById('routineTaskId').value = task.id;
            document.getElementById('routineTaskName').value = task.name;
            document.getElementById('routineTaskTime').value = task.time || '';
            document.getElementById('routineTaskDesc').value = task.desc || '';
            document.getElementById('routineTaskDay').value = task.day;
            routineModalTitle.innerText = 'Edit Routine Task';
        } else {
            document.getElementById('routineTaskDay').value = targetDay;
            routineModalTitle.innerText = `Add Task to ${targetDay}`;
        }
    };

    // --- Open Timeline Modal ---
    window.openTimelineModal = function(task = null) {
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
    const closeRoutineModalFunc = () => routineModal.style.display = 'none';
    const closeTimelineModalFunc = () => timelineModal.style.display = 'none';

    closeRoutineModal?.addEventListener('click', closeRoutineModalFunc);
    closeTimelineModal?.addEventListener('click', closeTimelineModalFunc);
    window.addEventListener('click', e => {
        if (e.target === routineModal) closeRoutineModalFunc();
        if (e.target === timelineModal) closeTimelineModalFunc();
    });

    // --- Time Input Validation ---
    document.addEventListener('input', e => {
        if (e.target.classList.contains('time-24h')) {
            let val = e.target.value.replace(/\D/g, '').substring(0,4);
            e.target.value = val.length >= 3 ? val.substring(0,2) + ':' + val.substring(2) : val;
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
    routineTaskForm?.addEventListener('submit', e => {
        e.preventDefault();
        const payload = {
            id: document.getElementById('routineTaskId').value || undefined,
            day: document.getElementById('routineTaskDay').value,
            name: document.getElementById('routineTaskName').value,
            time: document.getElementById('routineTaskTime').value,
            desc: document.getElementById('routineTaskDesc').value
        };
        RoutineModule.saveTask(payload);
        closeRoutineModalFunc();
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
    window.editTask = function(type, id) {
        if (type === 'routine') {
            const task = RoutineModule.getTask(id);
            if (task) window.openRoutineModal(task);
        } else {
            const task = TimelineModule.getTask(id);
            if (task) window.openTimelineModal(task);
        }
    };

    // --- Stats Update ---
    function updateStats() {
        if (currentView === 'daily') {
            const routines = RoutineModule.getAllRoutines();
            activeCountEl.innerText = routines.length;
            const today = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];
            const urgentCount = routines.filter(r => r.day === today).length;
            urgentCountEl.innerText = urgentCount;
        } else {
            const tasks = TimelineModule.getTasks();
            activeCountEl.innerText = tasks.length;
            const now = new Date();
            const urgentCount = tasks.filter(t => {
                const taskDate = new Date(`${t.date}T${t.time}`);
                const diffHours = (taskDate - now)/(1000*60*60);
                return diffHours > 0 && diffHours < 24;
            }).length;
            urgentCountEl.innerText = urgentCount;
        }
    }

    // --- Listen for updates ---
    window.addEventListener('timelineUpdated', updateStats);
    window.addEventListener('routineUpdated', updateStats);
});
