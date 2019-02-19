const express = require('express');
const bodyParser = require('body-parser');
const knex = require('knex');
const cors = require('cors');

const app = express();

const db = knex({
	client: 'pg',
	connection: {
		host: '127.0.0.1',
		user: 'plattthompson',
		password: '',
		database: 'common_words'
	}
})

app.use(bodyParser.json());
app.use(cors());

let percentileArray = [];

app.post('/', (req, res) => {
	const reqObject = req.body;
	const jsonLength = Object.keys(reqObject).length - 1;
	let i = 0;

	const getPercentiles = async () => {
		while(i <= jsonLength) {
			const gotData = await db.select('percentile').from('wordlist').where('word', reqObject[i]);
			await percentileArray.push(gotData[0].percentile);
			i++;
		}
	};

	const emptyArray = () => {
		percentileArray.length = 0;
	};
	const sendToClient = async () => {
		await getPercentiles();
		await res.json(Math.max(...percentileArray));
		await emptyArray();
	}
	sendToClient();
})

const PORT = process.env.PORT
app.listen(PORT, () => {
	console.log(`App is running on port ${PORT}`)
})