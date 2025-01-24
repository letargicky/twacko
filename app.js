const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = 8000;
const BLOB_URL = 'https://osmlu7cyjhebbdpp.public.blob.vercel-storage.com/usr/users-Tjs9UZGKNBkeiTal87UbrsJ6CiS378.json';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Funkcia na načítanie používateľov
async function nacitajPouzivatelov() {
  try {
    const response = await fetch(BLOB_URL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.text();
    const users = JSON.parse(data);
    return Array.isArray(users) ? users : [];
  } catch (error) {
    console.error('Chyba pri načítaní používateľov:', error);
    return [];
  }
}

// Funkcia na uloženie používateľov
async function ulozPouzivatelov(users) {
  try {
    const jsonString = JSON.stringify(users, null, 2);
    const response = await fetch(BLOB_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonString,
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    console.log('Používatelia boli úspešne uložené.');
  } catch (error) {
    console.error('Chyba pri ukladaní používateľov:', error);
  }
}

// Funkcia na hashovanie hesla
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

// Funkcia na overenie hesla
function verifyPassword(password, salt, hash) {
  const newHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return newHash === hash;
}

// Základná routa
app.get('/', (req, res) => {
  res.send('Vitajte na serveri!');
});

// Endpoint na vytvorenie používateľa
app.post('/users/create', async (req, res) => {
  const { username, age, gender, socialNetworks, interests } = req.body;

  if (!username || !age || !gender || !socialNetworks || !interests) {
    return res.status(400).json({ error: 'Chýbajú požadované polia.' });
  }

  const users = await nacitajPouzivatelov();
  const id = crypto.randomBytes(16).toString('hex');
  const newUser = { id, username, age, gender, socialNetworks, interests };
  users.push(newUser);

  await ulozPouzivatelov(users);
  res.status(201).json(newUser);
});

// Endpoint na registráciu používateľa
app.post('/register', async (req, res) => {
  const { email, username, password, age, gender, socialNetworks, interests } = req.body;

  if (!email || !username || !password || !age || !gender || !socialNetworks || !interests) {
    return res.status(400).json({ message: 'Všetky polia sú povinné.' });
  }

  const users = await nacitajPouzivatelov();
  if (users.some((user) => user.email === email)) {
    return res.status(400).json({ message: 'Používateľ už existuje.' });
  }

  const { salt, hash } = hashPassword(password);
  users.push({ email, username, passwordHash: hash, salt, age, gender, socialNetworks, interests });

  await ulozPouzivatelov(users);
  res.status(201).json({ message: 'Používateľ bol úspešne zaregistrovaný.' });
});

// Endpoint na prihlásenie používateľa
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email a heslo sú povinné.' });
  }

  const users = await nacitajPouzivatelov();
  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(401).json({ message: 'Nesprávny email alebo heslo.' });
  }

  const isMatch = verifyPassword(password, user.salt, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: 'Nesprávny email alebo heslo.' });
  }

  res.status(200).json({ message: 'Prihlásenie bolo úspešné.', username: user.username });
});

// Endpoint na získanie všetkých používateľov
app.get('/users', async (req, res) => {
  const users = await nacitajPouzivatelov();
  res.status(200).json(users);
});

// Endpoint na vymazanie používateľa
app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  const users = await nacitajPouzivatelov();
  const index = users.findIndex((user) => user.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Používateľ nebol nájdený.' });
  }

  users.splice(index, 1);
  await ulozPouzivatelov(users);
  res.status(200).json({ message: 'Používateľ bol vymazaný.' });
});

// Spustenie servera
app.listen(port, () => {
  console.log(`Server beží na http://localhost:${port}`);
});
