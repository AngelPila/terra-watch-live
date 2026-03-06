# AirMap

AirMap is a web application designed to visualize environmental data and provide air quality predictions using machine learning. The platform allows users to explore weather and air quality information, read news related to environmental topics, and discover relevant events.

## Features

- Air quality prediction using a trained machine learning model
- Integration with the OpenWeatherMap API
- Interactive map visualization
- Environmental news publishing system
- Event creation and management
- Role-based users (general users, news creators, event creators)

## Tech Stack

**Frontend**
- TypeScript
- Python

**Backend**
- Python

**Machine Learning**
- Trained prediction model for air quality estimation

**External APIs**
- OpenWeatherMap API


## Setup Instructions

### 1. Configure Environment Variables

Create environment files to store the API keys.

Add the following content in two locations:

- In the **project root** as `.env.local`
- Inside the **`prediction_api`** folder as `.env`

```
VITE_OPENWEATHERMAP_API_KEY="4a8ecf18eb0954c0c1b546696bfc9719"
OWM_API_KEY="4a8ecf18eb0954c0c1b546696bfc9719"
```

**Note:**  
These API keys are available for testing and review purposes. They will be **disabled on October 8, 2025**.

### 2. Add the Trained Model

Upload the trained machine learning model into the `prediction_api` folder.

### 3. Run the Backend

Navigate to the backend folder and create a virtual environment.

```
cd prediction_api
python -m venv venv
```

Activate the environment.

**Windows**

```
venv\Scripts\activate
```

**Mac / Linux**

```
source venv/bin/activate
```

Install the required dependencies.

```
pip install -r requirements.txt
```

Run the backend server.

```
python app.py
```

### 4. Run the Frontend

Open a new terminal in the project root and run:

```
npm install
npm run dev
```

The application should now be running locally.

## Test Users

The following accounts are available to test different system roles.

### General User

Email:
```
paulisaacpo@hotmail.com
```

Password:
```
rayito05
```

### News Creator

Email:
```
ivancede@espol.edu.ec
```

Password:
```
bebesita123
```

### Event Creator

Email:
```
apilataxi4@gmail.com
```

Password:
```
123456
```

## Notes

- These users are intended for testing purposes only.
- API keys included in this repository are temporary and will be disabled after the review period.
