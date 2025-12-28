# To-Do List Application

A professional task management web application with dual-view capabilities for managing daily routines and timeline-based tasks.

## Features

### 🔐 Authentication
- User login and signup functionality
- Simple email and password authentication
- Persistent session management

### 📅 Dual View System
- **TimeTable View**: Organize tasks by day of the week (Monday-Sunday)
- **Timeline View**: Manage tasks with specific dates and times
- Easy switching between views with real-time updates

### ✨ Task Management
- Create, edit, and delete tasks
- Add task descriptions
- Set specific times for tasks (24-hour format)
- Mark tasks as completed
- Automatic task sorting by date and time

### 📊 Dashboard Features
- Live clock display
- Active task counter
- Critical task counter
- User-friendly interface with modern design
- Responsive layout

### 💾 Data Persistence
- LocalStorage-based data storage
- Separate storage for routines and timeline tasks
- No backend required

## File Structure

```
To-do-list/
├── login.html          # Login page
├── signin.html         # User registration page
├── main.html           # Main dashboard
├── style.css           # Application styles
├── login.js            # Login page logic
├── signin.js           # Signup page logic
├── main.js             # Main dashboard logic
├── timetable.js        # Timetable view module
└── timeline.js         # Timeline view module
```

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- No server or backend required

### Installation

1. Clone or download this repository to your local machine

2. Open the project folder

3. And Enjoy!!

### Usage

1. **Login/Signup**
   - Open `login.html` to access the login page
   - New users can click "Sign Up" to create an account
   - Existing users can log in with their credentials

2. **Schedule View (Daily Routine)**
   - View tasks organized by day of the week
   - Add tasks to specific days with time slots
   - Live clock shows current time
   - Perfect for recurring weekly tasks

3. **Timeline View**
   - View all tasks in chronological order
   - Add tasks with specific dates and times
   - Tasks grouped by date for easy management
   - Ideal for one-time events and deadlines

4. **Managing Tasks**
   - Click "+ Add New Task" to create a task
   - Click on any task to edit it
   - Mark tasks as completed using the checkbox
   - Delete tasks using the delete button


## Key Features Explained

### Modular Architecture
The application uses a modular JavaScript pattern with:
- `TimetableModule`: Handles weekly schedule view
- `TimelineModule`: Manages timeline-based tasks
- Separate concerns for better maintainability

### Data Management
- Tasks and routines stored separately in LocalStorage
- Automatic synchronization across views
- Real-time statistics updates

### Time Management
- 24-hour time format (HH:MM)
- Input validation for time entries
- Automatic sorting by date and time


