const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { put, get } = require('@vercel/blob');

const app = express();
const port = 8000;
const BLOB_URL = 'https://osmlu7cyjhebbdpp.public.blob.vercel-storage.com/usr/users-Tjs9UZGKNBkeiTal87UbrsJ6CiS378.json';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Funkcia na načítanie používateľov
async function nacitajPouzivatelov() {
  try {
    const response = await get(BLOB_URL);
    const data = await response.text();
    return JSON.parse(data) || [];
  } catch (error) {
    console.error('Chyba pri načítaní používateľov:', error);
    return [];
  }
}

// Funkcia na uloženie používateľov
async function ulozPouzivatelov(users) {
  try {
    const jsonString = JSON.stringify(users, null, 2);
    await put('users-Tjs9UZGKNBkeiTal87UbrsJ6CiS378.json', jsonString, {
      access: 'public',
      contentType: 'application/json',
    });
  } catch (error) {
    console.error('Chyba pri ukladaní používateľov:', error);
  }
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

// Endpoint na zoznam používateľov
app.get('/users/list', async (req, res) => {
  const users = await nacitajPouzivatelov();
  res.json(users);
});

// Endpoint na zobrazenie konkrétneho používateľa
app.get('/users/read', async (req, res) => {
  const { id } = req.query;
  const users = await nacitajPouzivatelov();
  const user = users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({ error: 'Používateľ nenájdený.' });
  }

  res.json(user);
});

// Endpoint na aktualizáciu používateľa
app.put('/users/update', async (req, res) => {
  const { id, username, age, gender, socialNetworks, interests } = req.body;
  const users = await nacitajPouzivatelov();
  const user = users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({ error: 'Používateľ nenájdený.' });
  }

  if (username) user.username = username;
  if (age) user.age = age;
  if (gender) user.gender = gender;
  if (socialNetworks) user.socialNetworks = socialNetworks;
  if (interests) user.interests = interests;

  await ulozPouzivatelov(users);
  res.json(user);
});

// Endpoint na odstránenie používateľa
app.post('/users/delete', async (req, res) => {
  const { id } = req.body;
  const users = await nacitajPouzivatelov();
  const index = users.findIndex((u) => u.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Používateľ nenájdený.' });
  }

  users.splice(index, 1);
  await ulozPouzivatelov(users);
  res.json({ message: 'Používateľ úspešne odstránený.' });
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

  const hashedPassword = bcrypt.hashSync(password, 10);
  users.push({ email, username, password: hashedPassword, age, gender, socialNetworks, interests });

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

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Nesprávny email alebo heslo.' });
  }

  res.status(200).json({ message: 'Prihlásenie bolo úspešné.', username: user.username });
});

// Spustenie servera
app.listen(port, () => {
  console.log(`Server beží na http://localhost:${port}`);
});
