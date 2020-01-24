<h1>Welcome</h1>
Welcome to Magento Gulp Base.

<h3>Change your files</h3>

To edit css and js files:
```
$ cd vendor/vendor/theme/
$ gulp
```


<h3>To Deploy CSS and JS</h3>
You need to configure .env.sample to .env and insert the credentials.

To upload for S3 css files:
```
$ gulp publish
```

To upload for S3 js files:
```
$ gulp publish-js
```


<h3>Using Gulp for Magento command shortcuts</h3>

```
gulp clean
gulp compile
gulp flush
gulp deploy
```

