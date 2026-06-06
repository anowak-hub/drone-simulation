class World:
    def __init__(self, width: int, height: int):
        self.width = width
        self.height = height
        self.obstacles: set[tuple[int, int]] = set()

    def add_obstacle(self, x: int, y: int):
        self.obstacles.add((x, y))

    def is_passable(self, x: int, y: int) -> bool:
        if x < 0 or x >= self.width:
            return False
        if y < 0 or y >= self.height:
            return False
        return (x, y) not in self.obstacles

    def get_neighbors(self, x: int, y: int) -> list[tuple[int, int]]:
        directions = [(0,1),(0,-1),(1,0),(-1,0)]
        return [
            (x + dx, y + dy)
            for dx, dy in directions
            if self.is_passable(x + dx, y + dy)
        ]