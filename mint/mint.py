import json 
import os

class MintConfigError(Exception):
    """A Mint-specific class for errors related to Mint's config."""
    def __init__(self, message, path=None):
        self.message = message
        self.path = path
        super().__init__(self.__str__())

    def __str__(self):
        if self.path:
            return f"MintConfigError in '{self.path}': {self.message}"
        return f"MintConfigError: {self.message}"
    
class MintUnknownError(Exception):
    """A Mint-specific class for unknown errors"""
    def __init__(self, message):
        self.message = message
        super().__init__(self.__str__())

    def __str__(self):
        return f"MintUnknownError: {self.message}"

def loadConfig(path="~/.mintfsh/config.json"):
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
    config = {
        "hosts": [
            {
                "name": "default",
                "host": "https://giacomosm.github.io/mint-default",
                "priority": 0,
                "identity": "default",
            }
        ],
        "tor": False, # can be overridden by specifying the --tor or --notor flags
        "identity": "default", # can be overridden by specifying the --id flag, or by configuring host-specific identities
    }
    try:
        with open(path, "w") as f:
            json.dump(config, f, indent=4)
    except Exception as e:
        raise MintUnknownError(f"An unknown error occurred when creating Mint config: {e}")
    return config

def main():
    config = loadConfig()
    print("Mint configuration loaded successfully:\n", json.dumps(config, indent=4))

if __name__ == "__main__":
    main()