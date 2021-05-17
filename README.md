# Salesforce Connector API - Resource Watch 

[![Build Status](https://travis-ci.com/gfw-api/salesforce-connector.svg?branch=dev)](https://travis-ci.com/gfw-api/salesforce-connector)
[![Test Coverage](https://api.codeclimate.com/v1/badges/6998e7a532fb2d138ca3/test_coverage)](https://codeclimate.com/github/gfw-api/salesforce-connector/test_coverage)

## Dependencies

This service is built using [Node.js](https://nodejs.org/en/), and can be executed either natively or using Docker, each of which has its own set of requirements.

Native execution requires:
- [Node.js](https://nodejs.org/en/)
- [Yarn](https://yarnpkg.com/)

Execution using Docker requires:
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

## Getting started

Start by cloning the repository from github to your execution environment

```
git clone https://github.com/gfw-api/salesforce-connector.git && cd salesforce-connector
```

After that, follow one of the instructions below:

### Using native execution

1 - Set up your environment variables. Check [this section](#environment-variables) of the documentation for a description on the supported (and required) environment variables. Please note that native execution will **NOT** automatically load `.env` or `dev.env` files, so you need to use another way to define those values.

2 - Install node dependencies using Yarn:
```
yarn install
```

3 - Start the application server:
```
yarn start
```

Alternatively, you can use `yarn watch` to start a development server with hot-reloading. This means that every time you save a file, the TS server will be reloaded automatically.

The Salesforce connector service API should now be up and accessible in [http://localhost:9050](http://localhost:9050) (assuming the default settings).

### Using Docker

1 - Create and complete your `dev.env` file with your configuration. The meaning of the variables is available in this [section](#environment-variables).

2 - Execute the following command to run Salesforce connector service API:

```
./salesforce-connector.sh develop
```

3 - It's recommended to add the following line to your `/etc/hosts` (if you are in Windows, the hosts file is located in `c:\Windows\System32\Drivers\etc\hosts` and you'll need to 'Run as administrator' your editor):

```
mymachine   <yourIP>
```

The Salesforce connector API should now be up and accessible in [http://mymachine:9050](http://mymachine:9050) (assuming the default settings).

## Testing

There are two ways to run the included tests:

### Using native execution

Follow the instruction above for setting up the runtime environment for native execution, then run:

```
yarn test
```

### Using Docker

Follow the instruction above for setting up the runtime environment for Docker execution, then run:

```
./salesforce-connector.sh test
```

## Environment variables

Core Variables

- SALESFORCE_URL => The URL of the Salesforce instance that should be used. Required.
- SALESFORCE_USERNAME => The username that should be used to authenticate in Salesforce. Required.
- SALESFORCE_PASSWORD => A combination of password and security token for the username provided. Required.
- PORT => The port where the SF connector service listens for requests. Defaults to 9050 when not set.
- NODE_ENV => Environment variable of nodejs. Required.
- NODE_PATH => Required value. Always set it to 'app/src'.

For a full list of accepted environment variables, check out [this file](config/custom-environment-variables.json).

## Contributing

1. Fork it!
2. Create a feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Added some new feature'`
4. Push the commit to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request :D