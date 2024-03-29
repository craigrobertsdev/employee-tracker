# SQL Employee Tracker

[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Table of Contents

- [Description](#description)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [Questions](#questions)
- [License](#license)

## Description

A command-line database tool to manage departments, roles and employee/manager relationships within your organisation.

## Installation

Install required dependencies with `npm i`.

To use this application, MySQL must be installed.

## Usage

[Node.js](https://nodejs.org/en/download) is required to use this tool.

Create a `.env` file in the root of the project with the following variables:<br>`DB_USERNAME='{database-username}'`<br>`DB_PASSWORD='{password}`<br>`DB_NAME='organisation_db'`.

First, run `db/schema.sql` then (optionally) `db/seeds.sql` with MySQL to create and seed the database.

To run the app, enter `node index` from the command-line.

<p align="center">
<img src="https://github.com/craigrobertsdev/employee-tracker/blob/main/assets/images/screenshot.jpg">
</p>

A video demonstration of the application's usage can be found [here](https://watch.screencastify.com/v/W7VrkZcXW4AXTOXMYjqK).

## Contributing

Fork the repo and submit a pull request.

## Questions

View my other projects at [https://github.com/craigrobertsdev/](https://github.com/craigrobertsdev/).

If you would lke to contact me, I can be reached at [craig.roberts11@outlook.com](mailto:craig.roberts11@outlook.com).

## License

This project is licensed under the MIT license. See [here](https://opensource.org/licenses/MIT) for more info.
