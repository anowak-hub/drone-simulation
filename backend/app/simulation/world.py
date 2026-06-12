class World:
    def __init__(self, width: int, height: int):
        self.width = width
        self.height = height
        self.obstacles: set[tuple[int, int]] = set()
        self.threat_zones: set[tuple[int, int]] = set()

    def add_obstacle(self, x: int, y: int):
        self.obstacles.add((x, y))

    def add_threat(self, x: int, y: int):
        self.threat_zones.add((x, y))

    def remove_threat(self, x: int, y: int):
        self.threat_zones.discard((x, y))

    def is_passable(self, x: int, y: int) -> bool:
        if x < 0 or x >= self.width:
            return False
        if y < 0 or y >= self.height:
            return False
        return (x, y) not in self.obstacles

    def is_threat(self, x: int, y: int) -> bool:
        return (x, y) in self.threat_zones

    def get_neighbors(self, x: int, y: int) -> list[tuple[int, int]]:
        directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]
        return [
            (x + dx, y + dy)
            for dx, dy in directions
            if self.is_passable(x + dx, y + dy)
        ]

    def get_cost(self, x: int, y: int) -> float:
        if self.is_threat(x, y):
            return 5.0
        return 1.0