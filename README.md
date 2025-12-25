# To-Do List Application

A simple web-based To-Do List application with login and sign-in functionality, timeline, and timetable features.

## Features
- User login and sign-in pages
- Add, edit, and delete tasks
- Timeline and timetable views for tasks
- Persistent storage via server

## Project Structure
```
login.html        # Login page
login.js          # Login logic
signin.html       # Sign-in (registration) page
signin.js         # Sign-in logic
main.html         # Main app UI
main.js           # Main app logic
style.css         # App styling
server.js         # Node.js backend server
package.json      # Project dependencies and scripts
model/
  TimelineTask.js   # Timeline task model
  TimetableTask.js  # Timetable task model
timeline.js       # Timeline feature logic
timetable.js      # Timetable feature logic
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)

### Installation
1. Clone the repository:
   ```sh
   git clone <repo-url>
   ```
2. Install dependencies:
   ```sh
   npm install
   ```

### Running the Application
1. Start the server:
   ```sh
   node server.js
   ```
