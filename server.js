const express = require('express');
const bodyParser = require('body-parser');
const knex = require('knex');
const cors = require('cors');

const app = express();

// const db = knex({
// 	client: 'pg',
// 	connection: {
// 		host: 'postgresql-contoured-18051',
// 		user: 'plattthompson',
// 		password: '',
// 		database: 'common_words'
// 	}
// })

const db = knex({
	client: 'pg',
	connection: {
		connectionString: process.env.DATABASE_URL,
		ssl: true
	}
})

app.use(bodyParser.json());
app.use(cors());

let percentileArray = [];

app.get('/', (req, res) => {res.send('server is working')})
app.post('/', (req, res) => {
	const reqObject = req.body;
	const jsonLength = Object.keys(reqObject).length - 1;
	let i = 0;
	// retrieves percentiles from database and pushes them to array
	const getPercentiles = async () => {
		while(i <= jsonLength) {
			const gotData = await db.select('percentile').from('wordlist').where('word', reqObject[i]);
			await percentileArray.push(gotData[0].percentile);
			i++;
		}
	};
	// empties array for next request
	const emptyArray = () => {
		percentileArray.length = 0;
	};
	// finds the largest percentile in array, sends it to client, empties array
	const sendToClient = async () => {
		try {
			await getPercentiles();
			await res.json(Math.max(...percentileArray));
			await emptyArray();
		} catch {
			res.json("More than 100");
		}
	};
	sendToClient();
});

app.listen(process.env.PORT||3000, () => {
	console.log(`App is running on port ${process.env.PORT}`)
})