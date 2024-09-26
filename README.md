The most straightforward UI testing library for react-native.
Just wrap your UI component/widget inside `withScreenshot` and render it on your emulator/device.

The emulator will render your component/widget along with a button named <b>Capture and Compare</b>

Hit the button and the tests will run and a report will be generated in `test.html` file.

## Installation

```
npm i react-native-screenshot-test react-native-view-shot react-native-fs
```

Rebuild and relaunch your app after installation.

## Usage

1. In your project's `package.json`, under <i>scripts</i>, add-

```json
"scripts": {
    ...
    ...
    "ss-test": "cd ./node_modules/screenshot-test-server/dist && node server.js" // add this line
}
```

2. Write your tests. Below is a sample test-

```ts

```

3. In your projects root directory, run-

```
npm run ss-test
```
This will start the test server.

4. Render your test component in your simulator or device and press the <i>"Capture and Compare"</i> button. This will generate a folder named `screenshot-test` in your project's root directory.

5. Navigate to the <i>screenshot-test</i> folder  and open the file named `test.html` in your browser.