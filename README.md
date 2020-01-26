![](https://github.com/daiki-nakajima/bounceball.io/blob/master/src/client/images/logo.png)

bouceball.io is a game sample for beginners. You can create a game with a simple html and js implementation.

## Description

For many game developers, creating online multiplayer games (like .io game) will be a big dream. However, the know-how of creating online games is hard to find when searching the Internet (many pieces of information are fragmentary or too difficult for beginners.) I wanted to share a working game with everyone. This game implements only the important functions that are the core of online games. There is no need to create a difficult environment or knowledge to create. And above all, it works. I hope this game sample helps the your new online game.

## Demo

https://bounceballio.herokuapp.com/

## Requirement

Node.js v10.15.1

## Usage

### for development

-   Install

```sh
git clone https://github.com/daiki-nakajima/bounceball.io.git
cd bounceball.io
npm install
```

-   run

```sh
npm start
```

and access http://localhost:5000/

### for production(always running)

-   install

In addition to the above installation, install daemon tool into your server for production

```sh
sudo npm install -g forever
```

run

```sh
npm run start:prod
```

and access your server

## Contribution

```bash
1. Fork it
2. Create your feature branch (git checkout -b your-new-feature)
3. Commit your changes (git commit -am 'Add some feature')
4. Push to the branch (git push origin your-new-feature)
5. Create new Pull Request
```

## License

This project is licensed under the terms of the MIT license. You can read the full license in `LICENSE.md`https://github.com/tcnksm/tool/blob/master/LICENCE)

and follow https://opengameart.org/ for in-game images.

## Author

[Daiki Nakajima](https://github.com/daiki-nakajima)
