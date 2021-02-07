# tinify-locally

Allows to run [`tinify.com`](tinify.com)'s image optimizer on local machine.

You need to [get your API](https://tinypng.com/developers) key first. Store it in `.key` file in root folder then.

Uses `./input` to watch for new files and saves the result to `.output`.

By default, passes `.gif`, `.jpg`, `.jpeg`. To edit, check

    const SKIP_EXTENSIONS = ['gif', 'jpg', 'jpeg'];

Installation:

    npm install

Using:

    npm run start
    npm run clean
    npm run clean-start