// =================================================================
// require all necessary packages ==================================
// =================================================================

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');




// =================================================================
// app setup & configuration =======================================
// =================================================================

app.set('port', 3001);

app.locals.trains = [
  { id: 1, line: 'green', status: 'running' },
  { id: 2, line: 'blue', status: 'delayed' },
  { id: 3, line: 'red', status: 'down' },
  { id: 4, line: 'orange', status: 'maintenance' }
];

app.use(bodyParser.json());


app.set('secretKey', 'wallaby');

app.get('secretKey');

// =================================================================
// API Endpoints ===================================================
// =================================================================

app.get('/api/v1/trains', (request, response) => {
  response.status(200).json(app.locals.trains);
});

app.post('/authenticate', (request, response) => {
  var body = request.body;
  var token = jwt.sign({
                  email: body.email,
                  appName: body.appName
                }, app.get('secretKey'), { expiresIn: '48h' });

  response.status(201).json({token});
});

const checkAuth = (request) => {
  var token = request.body.token;
  if (token.length === 0 || token.undefined){
    response.status(403).json({error: "You must be authorized to use this endpoint"})
  } else {
    jwt.verify(token, app.get('secretKey'))
  };
};

app.patch('/api/v1/trains/:id', (request, response) => {
  const train = request.body;
  const { id } = request.params;
  const index = app.locals.trains.findIndex((m) => m.id == id);

  if (index === -1) { return response.status(404);}
  else {
    checkAuth(request);
  }

  const originalTrain = app.locals.trains[index];
  app.locals.trains[index] = Object.assign(originalTrain, train);

  return response.status(200).json(app.locals.trains);
});





// =================================================================
// start the server ================================================
// =================================================================

app.listen(app.get('port'), () => {
  console.log(`Listening on http://localhost:${app.get('port')}`);
});
