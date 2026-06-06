class Drone:
    def __init__(self, drone_id: str, start: tuple[int, int]):
        self.drone_id = drone_id
        self.position = start
        self.path: list[tuple[int, int]] = []
        self.path_index = 0
        self.status = "idle" # idle, moving, arrived, stuck
    
    def assign_path(self, path: list[tuple[int, int]]):
        self.path = path
        self.path_index = 0
        self.status = "moving"
    
    def step(self):
        if self.status != "moving":
            return 

        if self.path_index >= len(self.path) - 1:
            self.status = "arrived"
            return

        self.path_index += 1
        self.position = self.path[self.path_index]
        
    def is_done(self) -> bool:
        return self.status == "arrived"
    
    def __repr__(self):
        return f"Drone(id={self.drone_id}, pos={self.position}, status={self.status})"