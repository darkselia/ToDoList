# ToDoList (Nuxt 3 + Node.js/Express)


- `frontend` — интерфейс на Nuxt 3
- `backend` — REST API на Node.js + Express + TypeScript

## Технологический стек

### Frontend
- Nuxt 3
- Vue 3
- Vue Router

### Backend
- Node.js
- Express
- TypeScript
- SQLite 
- JWT
- CORS, dotenv

## Структура проекта

```text
ToDoList/
  frontend/
  backend/
  .gitignore
  README.md
```

## Требования

- Node.js 20+ (рекомендуется LTS)
- npm 10+

## Установка

Установите зависимости отдельно для frontend и backend:

```powershell
cd "C:\Users\Дарья\Desktop\Проекты\тестовые задания\ToDoList\frontend"
npm install

cd "C:\Users\Дарья\Desktop\Проекты\тестовые задания\ToDoList\backend"
npm install
```

## Настройка .env

Создайте файл `backend/.env`:

```env
PORT=4000
JWT_SECRET=your_super_secret_key
DB_PATH=./data/todos.sqlite
CORS_ORIGIN=http://localhost:3000
```

Примечания:
- `PORT` — порт backend API
- `JWT_SECRET` — секрет для подписи JWT
- `DB_PATH` — путь к файлу SQLite
- `CORS_ORIGIN` — адрес фронтенда

## Запуск проекта

### 1) Backend

```powershell
cd "C:\Users\Дарья\Desktop\Проекты\тестовые задания\ToDoList\backend"
npm run dev
```


### 2) Frontend

```powershell
cd "C:\Users\Дарья\Desktop\Проекты\тестовые задания\ToDoList\frontend"
npm run dev
```

По умолчанию Nuxt стартует на `http://localhost:3000`.

