import json
import os

RESET = "\033[0m"

#aaf0d1
MINT = "\033[38;2;170;240;209m"
MINT_BOLD = "\033[1;38;2;170;240;209m"

#ffff00
YELLOW = "\033[38;2;255;255;0m"
YELLOW_BOLD = "\033[1;38;2;255;255;0m"

WHITE = "\033[38;2;255;255;255m"

def printm(*args, **kwargs):
    print(MINT + " ".join(map(str, args)) + RESET, **kwargs)
def printmb(*args, **kwargs):
    print(MINT_BOLD + " ".join(map(str, args)) + RESET, **kwargs)
def printy(*args, **kwargs):
    print(YELLOW + " ".join(map(str, args)) + RESET, **kwargs)
def printyb(*args, **kwargs):
    print(YELLOW_BOLD + " ".join(map(str, args)) + RESET, **kwargs)
def printr(*args, **kwargs):
    print(RESET + " ".join(map(str, args)) + RESET, **kwargs)

class MintConfigError(Exception):
    def __init__(self, message, path=None):
        self.message = message
        self.path = path
        super().__init__(self.__str__())

    def __str__(self):
        if self.path:
            return f"MintConfigError in '{self.path}': {self.message}"
        return f"MintConfigError: {self.message}"
    
class MintUnknownError(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.__str__())

    def __str__(self):
        return f"MintUnknownError: {self.message}"

class MintDownloadError(Exception):
    def __init__(self, file_hash, message):
        self.file_hash = file_hash
        self.message = message
        super().__init__(self.__str__())

    def __str__(self):
        return f"MintDownloadError for file with SHA256 sum '{self.file_hash}': {self.message}"

class MintPublishError(Exception):
    def __init__(self, file_path, message):
        self.file_path = file_path
        self.message = message
        super().__init__(self.__str__())

    def __str__(self):
        return f"MintPublishError for file at path'{self.file_path}': {self.message}"

def loadConfig(path="~/.mintfsh/config.json"):
    path = os.path.expanduser(path)
    if not os.path.exists(path):
        doCreateConfig = input(f"Configuration file at path {path} does not exist. Have Mint create the default config there? [Y/n]: ").strip().lower()
        if doCreateConfig in ["y", "yes", ""]:
            return createConfig(path)
        else:
            raise MintConfigError(f"Configuration file at path {path} not found (user declined to create it)")
    try:
        with open(path, "r") as f:
            config = json.load(f)
    except json.JSONDecodeError as e:
        raise MintConfigError(f"Error decoding Mint config: {e}", path)
    except FileNotFoundError:
        raise MintConfigError(f"Configuration file at path {path} not found")
    except Exception as e:
        raise MintUnknownError(f"An unknown error occured when running Mint: {e}")
    return config

def createConfig(path="~/.mintfsh/config.json"):
    path = os.path.expanduser(path)
    config = {
        "hosts": [
            {
                "name": "default",
                "host": "https://giacomosm.github.io/mint-default",
                "priority": 0,
                "identity": "default",
            }
        ],
        "tor": False,
        "identity": "default",
    }
    try:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "x") as f:
            json.dump(config, f, indent=4)
    except Exception as e:
        raise MintUnknownError(f"An unknown error occurred when creating Mint config: {e}")
    return config

def main():
    config = loadConfig()
    printm("Mint configuration loaded successfully:\n", json.dumps(config, indent=4))

if __name__ == "__main__":
    main()
