class TryExcept:
    """Context manager for error handling in try-except blocks."""

    def __init__(self, name=None):
        self.name = name

    def __enter__(self):
        pass

    def __exit__(self, exc_type, exc_value, traceback):
        if exc_type is not None:
            print(f"Error in {self.name or ''}: {exc_value}")
        return True  # Suppress exception