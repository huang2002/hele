# hele

(Pronounced as h-ele)

A front-end UI lib.

# Features

## Declarative

Just declare the components to create interactive UIs which will act according to the states.

## Component-based

Split a complex app into small components that can be reused anywhere.

## Easy to learn

There's no extremely complicated concepts so that you can learn it easily and quickly.

## Lightweight

The size of the lib itself is rather small - less than 10kB.

# Example

Here's the HelloWorld:

```html
<!DOCTYPE html>
<html>

<head>
    <title>HEle-HelloWorld</title>
</head>

<body>
    <!-- The container: -->
    <div id="root"></div>
    <!-- Load the lib from the CDN: -->
    <script crossorigin="anonymous" src="https://unpkg.com/hele"></script>
    <!-- Codes start here: -->
    <script>

        HEle.render(
            HEle.createElement(
                'h1',
                null,
                'Hello, world!'
            ),
            document.getElementById('root')
        );

        // Now the root element will be:
        // <div id="root">
        //     <h1>Hello, world!</h1>
        // </div>

    </script>
</body>

</html>
```

# Docs

Docs haven't been finished yet, so you may read [the declaration files](typings) to learn the APIs at present.

# Changelog

See [CHANGELOG.md](CHANGELOG.md).
