start watchify BuildingEditor.ts -p [ tsify --noImplicitAny ] -o public/build/BuildingEditor.js -v
start watchify Main.ts -p [ tsify --noImplicitAny ] -o public/build/Main.js -v
timeout 1
start "" "http://localhost:3000/Main.html"