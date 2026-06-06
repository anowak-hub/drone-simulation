class Obstacle:
    def __init__(self, x: int, y: int, label: str = ""):
        self.x = x
        self.y = y
        self.label = label
    
    def position(self) -> tuple[int, int]:
        return (self.x, self.y)
    
    def __repr__(self):
        return f"Obstacle(x={self.x}, y={self.y}, label='{self.label}')"