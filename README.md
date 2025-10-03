# Channel Optimization Tool - Next.js (Updated 10/03 - 6:30p)

## What it does

This is a Next.js serverless application that generates media plans from YAML input using OpenAI. It provides a simple API endpoint to submit a YAML configuration and returns a generated media plan in both JSON and Markdown formats.

## Tech/Frameworks

*   **Framework:** Next.js
*   **Language:** TypeScript
*   **API:** OpenAI API
*   **Styling:** Tailwind CSS
*   **Containerization:** Docker, Docker Compose

## How to Navigate/Interpret the Application

For judges, the primary interaction with this application will be through the provided `run.sh` script, which demonstrates the core functionality. The script will start the application in a Docker container and then send a sample request to the API, printing the response to the console.

The key files in this repository are:

*   `app/api/plan/route.ts`: The main API endpoint that receives the YAML input and returns the media plan.
*   `lib/llm.ts`: The code that interacts with the OpenAI API.
*   `Dockerfile`: Defines the Docker image for the application.
*   `docker-compose.yml`: Configures the Docker services.
*   `run.sh`: The script to build and run the application.

## How to Run the Application

This application is containerized using Docker. To run it, you will need to have Docker and Docker Compose installed.

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Set up your environment variables:**

    Create a `.env.local` file in the root of the project and add your OpenAI API key:

    ```
    OPENAI_API_KEY=your-api-key-here
    OPENAI_MODEL=gpt-4o-mini
    ```

3.  **Run the application:**

    Execute the `run.sh` script:

    ```bash
    ./run.sh
    ```

### Expected Output

The script will first build the Docker image and then start the container. After a brief pause, it will send a `curl` request to the application's API endpoint and print the JSON response. This indicates that the application has started successfully.

Example output:

```
Building Image...
...
Started container...
Waiting for startup...
Running an example curl to check app is working
{"json":{...},"markdown":"..."}
```

To stop the application, run:

```bash
docker-compose down
```

## Real-World Application and Future Improvements

In a real-world scenario, this tool would be integrated into a larger marketing workflow. A marketing team could use a simple interface to upload their campaign parameters in a YAML file, and the tool would instantly generate a comprehensive media plan. This would save a significant amount of time and effort compared to creating a media plan manually.

### The Advantage of a Custom Fine-Tuned Model

The true power of this application would be realized by using a custom fine-tuned model. A model could be trained on a large dataset of the company's previous media plans and their performance data. This would allow the model to learn the nuances of the company's marketing strategy and generate media plans that are highly optimized for their specific goals.

For example, a fine-tuned model could learn:

*   Which channels are most effective for different types of campaigns.
*   The optimal budget allocation for different channels and ad formats.
*   The best time to run campaigns to maximize reach and engagement.

This would result in more effective media plans, a higher return on investment (ROI), and a significant competitive advantage.

### Proof of Concept (POC)

Given the 24-hour time constraint of this project, we have used a general-purpose model from OpenAI to demonstrate the core functionality of the application. This model is less powerful and less sustainable for a production environment, but it serves as a proof of concept to showcase the potential of this tool. With more time and resources, the next step would be to train and integrate a custom fine-tuned model to unlock the full potential of this application.