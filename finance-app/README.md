# Finance App

A personal finance tracker that runs on **mobile (iOS/Android)** and in a **web browser** from a single Expo/React Native codebase. All data is stored locally on the device, so the mobile app works **fully offline** — no server or account required.

## Features

- **Dashboard** — current balance, total money in vs. out, and a summary of outstanding loans.
- **Money** — record income and expenses with categories (salary, rent, interest, loans, services, shopping, etc.), notes and dates. Edit or delete any entry.
- **Loans to people** — track money you lend to others:
  - Borrower contact details (name, phone, email, note).
  - Capital lent and annual interest rate.
  - Payments split into **capital** and **interest**, including **anticipated payments to capital (prepayments)**.
  - Automatically computed remaining capital, accrued interest, interest outstanding and total owed.

## Tech

- [Expo](https://docs.expo.dev/) + React Native (one codebase → iOS, Android, web).
- Local persistence via `@react-native-async-storage/async-storage` (offline-first).
- TypeScript, fully typed. Pure financial calculations live in `src/finance.ts` and are unit-tested.

## Getting started

Requires Node.js (see Expo docs for the supported version) and npm.

```bash
cd finance-app
npm install

npm run web       # run in a web browser
npm run android   # run on an Android emulator/device
npm run ios        # run on an iOS simulator/device (macOS only)
```

## Development

```bash
npm run typecheck  # TypeScript type checking
npm test           # run unit tests (Jest)
```

## Project structure

```
finance-app/
  App.tsx                  # tab navigation + providers
  src/
    types.ts               # data models and default categories
    finance.ts             # pure financial calculations (tested)
    finance.test.ts        # unit tests
    storage.ts             # AsyncStorage persistence
    context/AppContext.tsx # app state + persistence
    components/ui.tsx       # reusable UI primitives
    screens/               # Dashboard, Transactions (Money), Loans
```
