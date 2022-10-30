# Website link: [otzdarva.com/builds](https://otzdarva.com/builds)

# About
Here is the source code which is behind the builds website. Unless things change in the future, the above link redirects to the GitHub pages site of this repository, available on [mrtipson.github.io/otz-builds/](https://mrtipson.github.io/otz-builds/).

# Contributing
 - For any bugs/feature requests, please make a GitHub issue.
 - Keep Chromium 85.0 compatibility (this is the Steam overlay integrated browser)
 - Unless necessary, try avoiding additional dependencies

# Building
Clone the repo.
```git clone https://github.com/MrTipson/otz-builds.git```

Go into the `build` directory.
```cd otz-builds/build```

Install node packages.
```npm i```

> If you get an error when running node, its possible that your node installation doesn't support null propagation operators yet.

Generate perks file.
```node getPerks.js```

Generate site HTML.
```node buildPage.js```

You can view the `index.html` immediately, but perk descriptions require a web server to be running.
