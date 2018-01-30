let express = require('express');
let app = express();
app.use('/', express.static('../uCalAngular/dist'));

app.get('/*', (req, res) => {
    res.sendFile('index.html', {root: '../uCalAngular/dist'});
})
app.listen(3000, () => console.log('Listening on port 3000'));
