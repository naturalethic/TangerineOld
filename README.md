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

## Known Issues

### Remix

If you fire up the app for the first time and notice this in your browser
console:

> Warning: Did not expect server HTML to contain a \<script> in \<html>.

... and/or several hydration errors, make sure you don't have [browser extensions injecting \<script> tags and causing issues](https://github.com/remix-run/remix/blob/main/docs/pages/gotchas.md#browser-extensions-injecting-code).

While you're at it, make sure to checkout all of
[Remix's
Gotchas](https://github.com/remix-run/remix/blob/main/docs/pages/gotchas.md).

