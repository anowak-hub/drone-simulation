import heapq

def dijkstra(world, start: tuple[int, int], goal: tuple[int, int]) -> list[tuple[int, int]]:
    open_set = []
    heapq.heappush(open_set, (0, start))

    came_from = {}
    cost = {start: 0}

    while open_set:
        current_cost, current = heapq.heappop(open_set)

        if current == goal:
            path = []
            while current in came_from:
                path.append(current)
                current = came_from[current]
            path.append(start)
            path.reverse()
            return path

        for neighbor in world.get_neighbors(*current):
            new_cost = cost[current] + world.get_cost(*neighbor)

            if neighbor not in cost or new_cost < cost[neighbor]:
                came_from[neighbor] = current
                cost[neighbor] = new_cost
                heapq.heappush(open_set, (new_cost, neighbor))

    return []