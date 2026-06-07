# Chess-Web ♟️

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.x-6DB33F?logo=spring)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk)](https://www.oracle.com/java/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-latest-336791?logo=postgresql)](https://www.postgresql.org/)
[![WebSocket](https://img.shields.io/badge/WebSocket-STOMP-010101?logo=socketdotio)](https://stomp-js.github.io/)

**Chess-Web** is a real-time, multiplayer chess platform that provides a clean, distraction-free environment for playing, analyzing, and mastering the game of chess. Challenge opponents in live matches with real-time move synchronization, in-game chat, and full move history tracking.

![Mid Game](/public/Mid_game.png)

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Security](#security)
- [Database Schema](#database-schema)
- [How to Contribute?](#how-to-contribute)
- [What's Next?](#whats-next)
- [Author](#author)

## About

In a world full of bloated chess platforms, **Chess-Web** strips everything back to what matters — the game. Whether you're a casual player looking for a quick match or a competitive enthusiast refining your strategy, Chess-Web delivers a premium, real-time chess experience with a sleek, dark-themed UI and buttery-smooth interactions. Every move is validated server-side, every game is persisted, and every match feels intentional.

## Features

- **Real-Time Multiplayer**: Play live chess matches with move synchronization powered by WebSocket + STOMP protocol.
- **Server-Side Move Validation**: All moves are validated on the backend using the `chesslib` engine — no client-side cheating.
- **Game Lobby**: Browse available games, create new ones with custom time controls, or join an existing match.
- **In-Game Chat**: Communicate with your opponent in real-time during a match.
- **Move History & Notation**: Full algebraic notation tracking with a scrollable move history table.
- **Game Persistence**: All games and moves are stored in PostgreSQL — review past games anytime.
- **User Authentication**: Secure JWT-based authentication with access + refresh token rotation.
- **Email Verification**: New accounts are verified via email.
- **Player Profiles**: View your game history, stats, and past match records.
- **Time Controls**: Configurable game clocks with server-managed timers and timeout handling
- **PGN support**: Export games in PGN format for analysis with other chess engines

## Tech Stack

### Frontend

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) + React Context API
- **Chess Board**: [react-chessboard](https://www.npmjs.com/package/react-chessboard) + [chess.js](https://github.com/jhlywa/chess.js)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) + [GSAP](https://gsap.com/)
- **WebGL Effects**: [OGL](https://ogl.dev/) (Light Rays background)
- **WebSocket**: [@stomp/stompjs](https://stomp-js.github.io/) + [SockJS](https://github.com/sockjs/sockjs-client)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend

- **Framework**: [Spring Boot 4.x](https://spring.io/projects/spring-boot)
- **Language**: [Java 21](https://www.oracle.com/java/) (Virtual Threads enabled)
- **Auth**: Spring Security + JWT (Access + Refresh Token rotation)
- **WebSocket**: Spring WebSocket + STOMP messaging
- **Chess Engine**: [chesslib](https://github.com/bhlangonijr/chesslib) (server-side move validation)
- **Lichess Integration**: [Chariot](https://github.com/tors42/chariot) (Lichess API client)
- **Database**: [PostgreSQL](https://www.postgresql.org/) + Spring Data JPA
- **Migrations**: [Flyway](https://flywaydb.org/)
- **Email**: [Resend](https://resend.com/) (transactional email delivery)

## Architecture

![Architecture Diagram](/public/architecture.png)

Chess-Web follows a **decoupled client-server architecture** with real-time communication.

**Key Design Decisions:**

- **WebSocket + STOMP** for low-latency, bidirectional move synchronization
- **Server-side validation** — the backend is the single source of truth for game state
- **JWT with refresh rotation** — stateless auth with secure token lifecycle
- **Virtual Threads (Java 21)** — efficient concurrency for handling many concurrent games
- **Flyway** — version-controlled database migrations

## Project Structure

```
chess-web/
├── frontend/                          # Next.js 16 application
│   ├── src/
│   │   ├── app/                       # App Router pages
│   │   ├── components/
│   │   │   ├── game/                  # Chess game components
│   │   │   ├── lobby/                 # Lobby components
│   │   │   ├── layout/               # Layout shell
│   │   │   ├── profile/              # Profile components
│   │   │   └── ui/                   # Reusable UI primitives
│   │   ├── context/                   # React Context providers
│   │   ├── hooks/                     # Custom hooks
│   │   ├── services/                  # API & state services
│   │   ├── types/                     # TypeScript type definitions
│   │   └── utils/                     # Utility functions
│   ├── package.json
│   └── next.config.ts
│
├── backend/                           # Spring Boot application
│   ├── src/main/java/com/akshansh/chessweb/
│   │   ├── ChessWebApplication.java   # Application entry point
│   │   ├── config/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── model/
│   │   │   ├── entity/                # JPA entities
│   │   │   ├── dto/                   # Data transfer objects
│   │   │   └── enums/                 # Game state enums
│   │   ├── repository/                # Spring Data JPA repositories
│   │   ├── filter/                    # JWT authentication filter
│   │   ├── listener/                  # WebSocket event listeners
│   │   ├── exception/                 # Custom exception handling
│   │   └── utils/                     # Utility classes
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   ├── application-prod.properties
│   │   └── db/migration/             # Flyway migrations
│   └── pom.xml
│
└── README.md
```

## Screenshots

### Landing Page

![Landing Page](/public/Landing_page.png)

### Game Lobby

![Game Lobby](/public/Lobby_page.png)

### Live Game

![Live Game](/public/Live_game.png)

### Game Over

![Game Over](/public/Won_result.png)

### Player Profile

![Player Profile](/public/Profile_page.png)

### Authentication

|              Login               |                Register                |
| :------------------------------: | :------------------------------------: |
| ![Login](/public/Login_page.png) | ![Register](/public/Register_page.png) |

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **Java** 21+
- **Maven** 3.9+
- **PostgreSQL** 15+

### 1. Clone the Repository

```bash
git clone https://github.com/Akshansh029/Chess-Web.git
cd Chess-Web
```

### 2. Backend Setup

```bash
cd backend

# Configure environment variables (see Configuration section)
# Then run:
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`.

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:3000`.

## Configuration

### Backend Environment Variables

Create an `application-dev.properties` file or set the following environment variables:

| Variable              | Description                       | Default                 |
| --------------------- | --------------------------------- | ----------------------- |
| `DATASOURCE_URL`      | PostgreSQL JDBC connection URL    | —                       |
| `DATASOURCE_USERNAME` | Database username                 | —                       |
| `DATASOURCE_PASSWORD` | Database password                 | —                       |
| `JWT_SECRET`          | Secret key for signing JWTs       | —                       |
| `APP_URL`             | Backend application URL           | `http://localhost:8080` |
| `FRONTEND_URL`        | Frontend application URL          | `http://localhost:3000` |
| `RESEND_API_KEY`      | Resend API key for email delivery | —                       |

### Frontend Environment Variables

| Variable              | Description            | Default                    |
| --------------------- | ---------------------- | -------------------------- |
| `NEXT_PUBLIC_API_URL` | Backend API base URL   | `http://localhost:8080`    |
| `NEXT_PUBLIC_WS_URL`  | WebSocket endpoint URL | `http://localhost:8080/ws` |

## Security

- **JWT Authentication**: Stateless access tokens with short expiry + long-lived refresh tokens with rotation.
- **Spring Security**: Full request-level authorization with role-based access control.
- **WebSocket Auth**: Custom STOMP interceptor validates JWT on WebSocket handshake.
- **Password Hashing**: BCrypt hashing for all user credentials.
- **Email Verification**: New accounts require email verification before login.
- **CORS**: Configurable cross-origin policy restricted to the frontend origin.
- **Input Validation**: Server-side validation on all incoming requests using Bean Validation.

## Database Schema

![Database Schema](/public/db_schema.png)

### Core Tables

| Table                | Description                                                   |
| -------------------- | ------------------------------------------------------------- |
| `users`              | Player accounts, credentials, and profile data                |
| `games`              | Game metadata (players, result, time control, status)         |
| `move_records`       | Individual moves with FEN, algebraic notation, and timestamps |
| `refresh_tokens`     | JWT refresh token store with expiry tracking                  |
| `user_verifications` | Email verification tokens                                     |

## How to Contribute?

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/your-feature`)
3. **Commit** your changes (`git commit -m 'Add some feature'`)
4. **Push** to the branch (`git push origin feature/your-feature`)
5. **Open** a Pull Request

Please make sure to:

- Follow the existing code style and project structure
- Write descriptive commit messages
- Test your changes before submitting

## What's Next?

- [ ] **ELO Rating System** — Skill-based matchmaking and leaderboards
- [ ] **Game Analysis** — Post-game engine analysis with best move suggestions
- [ ] **Friend System** — Add friends and challenge them directly
- [ ] **Tournament Mode** — Create and manage multi-round tournaments

---

<p align="center">
  Made with ♟️ and ☕
</p>
