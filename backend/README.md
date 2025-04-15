<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

<p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

```

## API List

### VnExpress

- `GET /news/vnexpress/body-html`: Returns news data with HTML article body.
- `GET /news/vnexpress/body-text`: Returns news data with plain text article body.

**Request Body Example:**
```json
{
  "url": "https://vnexpress.net/example.html"
}
```

### DanTri

- `GET /news/dantri/body-html`: Returns news data with HTML article body.
- `GET /news/dantri/body-text`: Returns news data with plain text article body.

**Request Body Example:**
```json
{
  "url": "https://dantri.com.vn/example.html"
}
```

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
