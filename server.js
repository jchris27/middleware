const express = require('express');
const app = express();
const path = require("path");
const cors = require('cors');
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const PORT = process.env.PORT || 3500;

// custom middleware logger
app.use(logger);

// Cross Origin Resource Sharing
const whitelist = ['https://www.yoursite.com', 'http://127.0.0.1:5500', 'http://localhost:3500'] // put your domain here/web application domain to access the backend that will allow the cors to access. remove localhost if not in dev mode
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) { //during development add !origin is equivalient to undefined
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    };
  },
  corsOptionsStatus: 200
}
app.use(cors(corsOptions));

// built-in middleware to handle urlencoded data
// in other words, form data:
// 'content-type: application/x-www-form-urlencoded'
app.use(express.urlencoded({ extended: false }));

// built-in middle for json
app.use(express.json());

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

// define the 1st route. app route
// accepts regex
// ^ starts with
// $ ends with
// (.html)? makes it optional
app.get('^/$|/index(.html)?', (req, res) => {
  // serve a file
  // res.sendFile('./views/index.html', { root: __dirname })
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/new-page(.html)?', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'new-page.html'));
});

// redirect page
app.get('/old-page(.html)?', (req, res) => {
  res.redirect(301, '/new-page.html'); //302 by default
});

// route handlers

// function chain
app.get('/hello(.html)?', (req, res, next) => {
  console.log('attempted to serve hello.html')
  next();
}, (req, res) => {
  res.send('Hello World!');
});

// chaining route handlers
const one = (req, res, next) => {
  console.log('One')
  next();
};

const two = (req, res, next) => {
  console.log('Two')
  next();
};

const three = (req, res) => {
  console.log('Three')
  res.send('Finished');
};

// accepts an array of routes
app.get('/chain(.html)?', [one, two, three])

// app.use('/') does not accepts regEx
// custom 404 file
// app.get('/*', (req, res) => {
//   res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
// });

// using app.all to handle any other routes
app.all('*', (req, res) => {
  res.status(404);
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'views', '404.html'));
  } else if (req.accepts('json')) {
    res.json({ error: '404 JSON Not Found.' });
  } else {
    res.type('txt').send('404 Text Not Found.');
  };
});

// error handler middleware
app.use(errorHandler)


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
