# Tangerine

## An experimental CMS built on [SurrealDB](https://surrealdb.com) and [Remix](https://remix.run/)

## ![Screenshot](https://i.ibb.co/yXjZs8N/Screenshot-2022-10-28-at-2-40-25-PM.png)

### Install

#### Install and run SurrealDB

- `brew install surrealdb/tap/surreal`
- `brew services start surreal`

##### Create an initial user
- `npm run sql`
- `> CREATE _identity SET username = 'admin', password = crypto::argon2::generate('admin'), admin = true`

#### Setup project
- `npm install`
- `cp .env.example .env`

### Develop

```sh
npm run dev
```
