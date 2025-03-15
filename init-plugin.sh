# #!/bin/bash

name=$1
mkdir ./src-tauri/src/plugins/$name; pnpm tauri plugin init -d ./src-tauri/src/plugins/$name --no-api --no-example;