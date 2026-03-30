# ToDoList (Nuxt 3 + Node.js/Express)

- `frontend` — интерфейс на Nuxt 3
- `backend` — REST API на Node.js + Express + TypeScript

## Технологический стек

### Frontend
- Nuxt 3
- Vue 3

### Backend
- Node.js
- Express
- TypeScript
- SQLite
- JWT
- Zod
- CORS, dotenv

## Структура проекта

```text
ToDoList/
  frontend/
  backend/
  README.md
```

## Требования

- Node.js 20+ (рекомендуется LTS)
- npm 10+

## Установка зависимостей

Установите зависимости отдельно в каждом пакете:

```powershell
cd "C:\Users\Дарья\Desktop\Проекты\тестовые задания\ToDoList\frontend"
npm install

cd "C:\Users\Дарья\Desktop\Проекты\тестовые задания\ToDoList\backend"
npm install
```

## Настройка переменных окружения (.env)

Создайте файл `backend/.env` (можно на основе `backend/.env.example`):

```env
PORT=4000
JWT_SECRET=your_super_secret_key
DB_PATH=./data/todos.sqlite
CORS_ORIGIN=http://localhost:3000
```

Описание переменных:
- `PORT` — порт backend API
- `JWT_SECRET` — ключ подписи JWT (обязателен)
- `DB_PATH` — путь к SQLite файлу
- `CORS_ORIGIN` — origin фронтенда для CORS

## Запуск проекта

### 1) Запуск backend

```powershell
cd "C:\Users\Дарья\Desktop\Проекты\тестовые задания\ToDoList\backend"
npm run dev
```

Backend будет доступен на `http://localhost:4000`.

### 2) Запуск frontend

```powershell
cd "C:\Users\Дарья\Desktop\Проекты\тестовые задания\ToDoList\frontend"
npm run dev
```

Frontend по умолчанию стартует на `http://localhost:3000`.

## Формат API-ответов

Успех:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

Ошибка:

```json
{
  "success": false,
  "error": {
    "code": 400,
    "message": "Validation error"
  }
}
```

## Аутентификация

Для защищенных endpoints используется заголовок:

```http
x-access-token: <jwt>
```

JWT выдается через `POST /api/auth/login`.

## API эндпоинты

### Auth

- `POST /api/auth/login`
  - назначение: вход пользователя; если пользователя нет, он создается
  - body:
    ```json
    {
      "email": "user@example.com",
      "password": "secret123"
    }
    ```
  - response `200/201`: JWT + пользователь
    ```json
    {
      "success": true,
      "data": {
        "token": "...",
        "user": {
          "id": 1,
          "email": "user@example.com",
          "createdAt": "2026-03-30 10:00:00"
        }
      },
      "error": null
    }
    ```

- `POST /api/auth/logout`
  - назначение: выход (клиент удаляет токен из `localStorage`)
  - response:
    ```json
    {
      "success": true,
      "data": { "loggedOut": true },
      "error": null
    }
    ```

### Tasks (защищенные, нужен `x-access-token`)

- `GET /api/tasks`
  - назначение: список задач текущего пользователя
  - query (все опционально):
    - `status`: `all | active | completed | overdue`
    - `search`: строка поиска по `title/description`
    - `dueDateFrom`: дата (например `2026-04-01`)
    - `dueDateTo`: дата (например `2026-04-30`)
    - `sortBy`: `createdAt | dueDate | status`
    - `order`: `asc | desc`
  - response: массив задач текущего пользователя

- `POST /api/tasks`
  - назначение: создать задачу текущего пользователя
  - body:
    ```json
    {
      "title": "Подготовить отчет",
      "description": "Черновик и финальная версия",
      "dueDate": "2026-04-15",
      "isCompleted": false
    }
    ```

- `PUT /api/tasks/{id}`
  - назначение: обновить задачу по `id` (только свою)
  - body (частично):
    ```json
    {
      "title": "Новое название",
      "description": "Обновленное описание",
      "dueDate": "2026-04-20",
      "isCompleted": true
    }
    ```

- `DELETE /api/tasks/{id}`
  - назначение: удалить задачу по `id` (только свою)
  - response:
    ```json
    {
      "success": true,
      "data": {
        "deleted": true,
        "id": 1
      },
      "error": null
    }
    ```

## Быстрая проверка API

Готовые HTTP-сценарии находятся в `backend/test.http`.

