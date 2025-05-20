# Flight Delay Hackathon Frontend

## Usage

1. Start the backend API server (see backend instructions).
2. Start the frontend app:

   ```
   npm install
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.
4. Select a day of the week and an airport, then click "Search" to see the results.

The frontend will call the `/api/flight-delay?day=...&airport=...` endpoint and display the result.

## Python Virtual Environment

To ensure consistent dependencies, use a Python virtual environment:

```sh
python3 -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
pip install -r requirements.txt
```

You can now run Python scripts and install packages in an isolated environment.

To deactivate the environment, run:
```sh
deactivate
```
