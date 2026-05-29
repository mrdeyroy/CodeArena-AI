# CodeArena AI — Backend API Architecture Spec

This document outlines the API endpoints, request payloads, response schemas, and system behaviors required to support the CodeArena AI platform.

---

## 1. Authentication & Profiles (`/api/v1/auth`)

### 1.1 User Register
* **Route**: `POST /api/v1/auth/register`
* **Purpose**: Register a new developer account.
* **Payload**:
  ```json
  {
    "name": "Alex Rivera",
    "email": "alex.rivera@dev.io",
    "password": "securepassword123"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "token": "jwt_token_here",
    "user": {
      "id": "usr_1",
      "name": "Alex Rivera",
      "email": "alex.rivera@dev.io"
    }
  }
  ```

### 1.2 User Login
* **Route**: `POST /api/v1/auth/login`
* **Purpose**: Authenticate credentials and establish session context.
* **Payload**:
  ```json
  {
    "email": "alex.rivera@dev.io",
    "password": "securepassword123"
  }
  ```
* **Response (200 OK)**: Similar to register response.

---

## 2. Coding Practice & Sandbox Workspace (`/api/v1/problems`)

### 2.1 Fetch Problems List
* **Route**: `GET /api/v1/problems`
* **Purpose**: Retrieve coding problems with filters.
* **Query Parameters**:
  - `difficulty`: `Easy` | `Medium` | `Hard`
  - `topic`: e.g. `Arrays`, `Graphs`, `Dynamic Programming`
  - `company`: e.g. `Google`, `Meta`
  - `status`: `Solved` | `Attempted` | `Unsolved`
  - `search`: search query string
* **Response (200 OK)**:
  ```json
  {
    "problems": [
      {
        "id": "prob_1",
        "title": "Two Sum",
        "slug": "two-sum",
        "difficulty": "Easy",
        "acceptanceRate": 49.2,
        "estimatedTime": "15 mins",
        "topics": ["Arrays", "Hashing"],
        "companies": ["Google", "Amazon"],
        "status": "Solved",
        "isAIRecommended": false
      }
    ]
  }
  ```

### 2.2 Get Problem Details
* **Route**: `GET /api/v1/problems/:slug`
* **Purpose**: Fetch instructions, code templates, examples, constraints, and hints.
* **Response (200 OK)**: Returns full problem details matching the client-side type definitions.

### 2.3 Run Custom Test Cases
* **Route**: `POST /api/v1/problems/:id/run`
* **Purpose**: Compile code in a secure sandboxed environment.
* **Payload**:
  ```json
  {
    "language": "python",
    "code": "def twoSum(nums, target): ...",
    "customInput": "nums = [2,7,11,15], target = 9"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "status": "Accepted",
    "runtime": "12ms",
    "memory": "14.2 MB",
    "stdout": "[0, 1]",
    "stderr": ""
  }
  ```

### 2.4 Submit Solution
* **Route**: `POST /api/v1/problems/:id/submit`
* **Purpose**: Evaluate code against all hidden test assertions and save submissions history.
* **Payload**:
  ```json
  {
    "language": "python",
    "code": "def twoSum(nums, target): ..."
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "status": "Accepted",
    "runtime": "8ms",
    "memory": "13.9 MB",
    "passedCount": 45,
    "totalCount": 45,
    "ratingDelta": 5
  }
  ```

---

## 3. Skill Graph Engine (`/api/v1/graph`)

### 3.1 Get Skill Graph Map
* **Route**: `GET /api/v1/graph`
* **Purpose**: Fetch all syllabus nodes, dependencies, and mastery ratings.
* **Response (200 OK)**:
  ```json
  {
    "nodes": [
      {
        "id": "node_arrays",
        "label": "Arrays & Hashing",
        "status": "mastered",
        "mastery": 92,
        "problemsCount": 45,
        "problemsSolved": 42
      }
    ],
    "edges": [
      { "id": "e_arr_ptr", "source": "node_arrays", "target": "node_pointers" }
    ]
  }
  ```

### 3.2 Get Specific Node Insights
* **Route**: `GET /api/v1/graph/nodes/:id/insights`
* **Purpose**: Trigger LLM summary mapping current gaps and recommended modules.
* **Response (200 OK)**:
  ```json
  {
    "aiInsight": "Your recursion complexity looks excellent. Focus on topological sort cycle detections.",
    "recommendedProblems": ["course-schedule", "alien-dictionary"]
  }
  ```

---

## 4. AI Mentor Agent (`/api/v1/coach`)

### 4.1 Chat Stream
* **Route**: `POST /api/v1/coach/chat`
* **Purpose**: Conversational coach loop. Can support stream text buffers.
* **Payload**:
  ```json
  {
    "message": "Help me optimize my dynamic programming matrix spaces."
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "reply": "We can optimization space from O(N*M) to O(Min(N,M)) using two 1D arrays instead..."
  }
  ```

### 4.2 Get Weaknesses
* **Route**: `GET /api/v1/coach/weaknesses`
* **Purpose**: Aggregate fail compilation categories.
* **Response (200 OK)**:
  ```json
  {
    "weaknesses": [
      {
        "topic": "Graph Traversal (DFS/BFS)",
        "mastery": 35,
        "accuracy": 42,
        "aiSuggestion": "Avoid deep recursive recursion limits using explicit stacks."
      }
    ]
  }
  ```

---

## 5. Mock Interview Room (`/api/v1/interview`)

### 5.1 Initialize Mock Interview Session
* **Route**: `POST /api/v1/interview/sessions`
* **Payload**:
  ```json
  {
    "type": "DSA" | "System Design" | "Behavioral",
    "durationLimit": 30
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "sessionId": "int_sess_948",
    "question": "Can you design a sliding window rate limiter?"
  }
  ```

### 5.2 Submit Vocal / Text Responses
* **Route**: `POST /api/v1/interview/sessions/:id/response`
* **Purpose**: Post dialogue blocks and obtain interviewer follow-ups.
* **Payload**:
  ```json
  {
    "candidateAnswer": "I would use a Redis sorted set to record timestamps..."
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "nextInterviewerPrompt": "Excellent. How would you evict expired keys to clean space?"
  }
  ```

### 5.3 Close Session & Generate Radar Report
* **Route**: `POST /api/v1/interview/sessions/:id/finalize`
* **Purpose**: Run technical accuracies, communication clarity, and confidence checks.
* **Response (200 OK)**: Returns detailed score mappings for radar charts (communication, technical accuracy, problem solving, strengths, weaknesses, overall readiness score).

---

## 6. Contests & Leaderboards (`/api/v1/contests`)

### 6.1 Get Active Contests
* **Route**: `GET /api/v1/contests`
* **Response (200 OK)**: Lists upcoming, live, and ended matches.

### 6.2 Fetch Rank List
* **Route**: `GET /api/v1/contests/:id/leaderboard`
* **Response (200 OK)**: Sorted ranking rows containing user offsets.
