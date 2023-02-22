# ddl-to-gql Example
This page explains how to run the example, to see more about the goal of this application, click [here](https://github.com/onn-software/ddl-to-gql).

## Prerequisites

- Docker
- Docker compose
- Basic knowledge of SQL
- Node and other common sense things

Run in the root folder (that's one folder up from here): `npm install`.

## Start a SQL Database with data
All following commands are executed in the folder `./example`.
- Run `docker compose up`.
- Using your favorite SQL tool, run the `mysqlsampledatabase.sql`.
- Verify the data is present with [Adminer](http://localhost:8080/?server=db&username=root&db=classicmodels).

## Generate code, and run the app
Now that the environment is ready, let's generate code, and run the example.

```npm
npx @onn-software/ddl-to-gql \
    --ddlPath ./example.ddl \
    --defPath ./table-definitions.json \
    --tsFolder src/gen/onn/ts \
    --gqlFolder src/gen/onn/gql \
    --sqlFactory knex
```

Now start the app with `npm run dev`, and go to http://localhost:4000/graphql.

## Licence

By David Hardy and [Onn Software](https://onn.software):

```
The MIT License

Copyright (c) 2023 David Hardy
Copyright (c) 2023 Onn Software

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
