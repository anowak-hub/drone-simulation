# Drone Simulation

## Overview
This projects primary aim is to simulate autonomous drone operations in a dynamic environment. The system supports waypoint navigation, obstacle avoidance, pathfinding, telemetry monitoring, and mission execution within a simulated airspace.

## Features
- Multi-drone fleet management with 3 independently controllable drones
- A* and Dijkstra pathfinding with real-time algorithm switching
- Autonomous waypoint navigation with multi-stop mission queuing
- Obstacle avoidance with draggable obstacle repositioning
- Threat zone placement with cost-weighted pathfinding penalties
- Collision avoidance with automatic rerouting between drones
- Live telemetry — battery, position, steps, and mission status
- Apple Maps-style dark UI with real-time map visualization
- Mission reset without server restart

## Architecture
The simulator is split into a Python backend and a React frontend.

The backend models the simulation environment — a 10x10 grid world with obstacles and threat zones. Each drone holds its own position, path, and status. Missions are assigned per drone and execute a pathfinding algorithm to generate a step-by-step route. On each step, the backend checks for collisions with other drones and reroutes if necessary. FastAPI exposes the simulation state through a REST API that the frontend polls.

The frontend renders the live simulation on a Leaflet map. Drones, obstacles, threat zones, and planned waypoints are all visualized in real time. The sidebar provides mission controls, fleet status, and telemetry

## Tech Stack
### Backend
- Python
- FastAPI
### Algorithms
- A* Pathfinding
- Dijkstra's Algorithm
### Frontend
- React
- TypeScript
- Vite
### Visualization
- Leaflet
### Data and Validation
- Pydantic
### Testing
- Pytest
### Version Control 
- Git 
- GitHub

## Installation
### Prerequisites 
- Python 3.10+
- Node.js 18+
- Git
### Backend 
```bash
cd backend 
pip install -r requirements.txt 
```
### Frontend 
```bash
cd frontend 
npm install
```
### Running the Project
Start the frontend dev server:
```bash
cd frontend 
npm run dev 
```
Open http://localhost:5173 in your browser.

## Usage
1. Start the backend server from `backend/app` with your virtual environment active
2. Start the frontend dev server from `frontend`
3. Open http://localhost:5173
4. Select a drone, choose an algorithm, add waypoints, and click Launch
5. Click anywhere inside the yellow boundary to place or remove threat zones
6. Drag red obstacle markers to reposition them
7. Click Reset to restore all drones to their starting positions

## Future Enhancements
- Simulated radar sensors that detect targets and auto-dispatch drones
- Swarm behavior and coordinated fleet movements
- Terrain-aware navigation with elevation cost mapping
- Dynamic mission reassignment based on battery levels
- 3D visualization using Three.js

## Screenshots
- Refer to docs/screenshots