# iPhone Sales Tracker API

A small, production-minded Express and MongoDB REST API for recording and analysing iPhone sales. It provides CRUD operations, model filtering, aggregate statistics, validation, centralized errors, and a health check.

Preparing to explain or recreate it live? Read [LIVE_CODING_GUIDE.md](LIVE_CODING_GUIDE.md) first.

## Prerequisites

- Node.js 18 or later
- A MongoDB Atlas cluster (or a MongoDB-compatible connection string)
- Postman, optional

## Installation and configuration

```bash
npm install
Copy-Item .env.example .env
```

Set `MONGODB_URI` in `.env` to your Atlas connection string. The included defaults are:

```env
PORT=8800
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=development
```

The server refuses to start when the database cannot connect, so it never accepts requests with an unavailable persistence layer.

## Run and test

```bash
npm start
npm run dev
npm test
```

The API is served at `http://localhost:8800` by default. The included tests cover health, malformed IDs, validation, and malformed JSON without needing a database. Test all CRUD operations against your configured Atlas database with Postman or curl.

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/health` | Returns `{ "status": "ok" }` |
| POST | `/sales` | Create a sale |
| GET | `/sales` | List all sales |
| GET | `/sales?phone_model=iPhone%2015` | Filter exact model matches |
| GET | `/sales/stats` | Sales analytics |
| GET | `/sales/:sale_id` | Get one sale |
| PUT | `/sales/:sale_id` | Update one or more fields |
| DELETE | `/sales/:sale_id` | Delete a sale |

`/sales/stats` is registered before `/:sale_id`, avoiding the route conflict.

### Create a sale

```json
{
  "customer_name": "Aarav Sharma",
  "phone_model": "iPhone 15",
  "color": "Blue",
  "storage_gb": 128,
  "price": 79999,
  "sale_date": "2026-10-19",
  "store_location": "Mumbai Central"
}
```

`POST /sales` returns `201` and the created document, including MongoDB `_id` and `created_at`. All fields are required on create. On `PUT`, supply at least one valid field; schema validation is also enabled for the update.

Example success response (abridged):

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "customer_name": "Aarav Sharma",
  "phone_model": "iPhone 15",
  "price": 79999,
  "created_at": "2026-10-19T10:00:00.000Z"
}
```

`GET /sales/stats` returns:

```json
{
  "total_sales_count": 4,
  "total_revenue": 319996,
  "most_popular_iphone_model": "iPhone 15",
  "average_sale_price": 79999
}
```

For an empty database, count, revenue, and average are `0`; `most_popular_iphone_model` is `null`.

## Errors and status codes

Errors use `{ "error": "..." }`. Validation failures also include a `details` array with field-level messages.

| Status | Meaning |
| --- | --- |
| 200 | Successful read, update, delete, statistics, or health check |
| 201 | Sale created |
| 400 | Invalid JSON, malformed ID, or invalid request fields |
| 404 | Unknown route or sale does not exist |
| 409 | Duplicate-key database conflict |
| 500 | Unexpected server/database error; no stack or database details in production |

## MongoDB Atlas setup

1. Create a free/shared cluster in Atlas.
2. Create a database user with read/write access to the target database.
3. Add your development IP address under **Network Access**.
4. Select **Connect > Drivers**, copy the Node.js connection string, replace its password and database name, and assign it to `MONGODB_URI` in `.env`.
5. Keep `.env` private; it is intentionally gitignored.

## Postman and curl

Import `postman_collection.json` into Postman. Set the `baseUrl` collection variable if necessary. The **Create sale** request saves the returned `_id` into `saleId`, which the get/update/delete requests use.

```bash
curl -X POST http://localhost:8800/sales -H "Content-Type: application/json" -d '{"customer_name":"Aarav Sharma","phone_model":"iPhone 15","color":"Blue","storage_gb":128,"price":79999,"sale_date":"2026-10-19","store_location":"Mumbai Central"}'
curl http://localhost:8800/sales/stats
```

## Design decisions

- One `Sale` Mongoose model keeps the assignment focused on sales records.
- Request validators provide clear `400` responses before database work; Mongoose validates persistence as a second line of defense.
- Statistics use a MongoDB aggregation with a deterministic alphabetical tiebreaker for equally popular models.
- Exact-match `phone_model` filtering is intentional and predictable; add text search only if product requirements call for it.
