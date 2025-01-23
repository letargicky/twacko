const express = require('express')
const crypto = require('crypto')
const cors = require('cors')
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const port = 8000;

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const users = []
app.use(express.json()); // Na spracovanie JSON requestov

// Cesta ku users.json
const configPath = path.join(__dirname, 'users.json');



app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const BLOB_URL = 'https://lovably.vercel.app/users.json';

// Funkcia na načítanie používateľov
async function nacitajPouzivatelov() {
  try {
      const response = await get(BLOB_URL);
      const users = await response.json();
      return users || [];
  } catch (error) {
      console.error('Chyba pri načítaní používateľov:', error);
      return [];
  }
}

// Funkcia na uloženie používateľov
async function ulozPouzivatelov(users) {
  const jsonString = JSON.stringify(users, null, 2);
  try {
      await put('users.json', jsonString, {
          access: 'public', // Alebo 'private' pre obmedzenie prístupu
          contentType: 'application/json'
      });
  } catch (error) {
      console.error('Chyba pri ukladaní používateľov:', error);
  }
}

// Login endpoint
app.post('/register', async (req, res) => {
  const { email, username, password, age, gender, socialNetworks, interests } = req.body;

  if (!email || !username || !password || !age || !gender || !socialNetworks || !interests) {
      return res.status(400).json({ message: 'Všetky polia sú povinné.' });
  }

  const users = await nacitajPouzivatelov();
  if (users.some(user => user.email === email)) {
      return res.status(400).json({ message: 'Používateľ už existuje.' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  users.push({ email, username, password: hashedPassword, age, gender, socialNetworks, interests });

  await ulozPouzivatelov(users);
  res.status(201).json({ message: 'Používateľ bol úspešne zaregistrovaný.' });
});

// Login an existing user
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
      return res.status(400).json({ message: 'Email a heslo sú povinné.' });
  }

  try {
      const users = await loadUsers();
      const user = users.find(user => user.email === email);

      if (!user) {
          return res.status(401).json({ message: 'Nesprávny email alebo heslo.' });
      }

      // Porovnanie hesla
      const isMatch = bcrypt.compareSync(password, user.password);
      if (!isMatch) {
          return res.status(401).json({ message: 'Nesprávny email alebo heslo.' });
      }

      res.status(200).json({ message: 'Prihlásenie bolo úspešné.', username: user.username });
  } catch (error) {
      console.error('Chyba pri prihlasovaní:', error);
      res.status(500).json({ message: 'Interná chyba servera.' });
  }
});

app.post("/users/create", (req, res) => {
  const { username, age, gender, socialNetworks, interests } = req.body
  if (!username || !age || !gender || !socialNetworks || !interests) {
    return res.status(400).json({ error: "Missing required fields" })
  }
  const id = crypto.randomBytes(16).toString("hex")
  const newUser = { id, username, age, gender, socialNetworks, interests }
  users.push(newUser)
  res.status(201).json(newUser)
})

app.get("/users/list", (req, res) => {
  res.json(users)
})

app.get("/users/read", (req, res) => {
  const { id } = req.query
  const user = users.find(u => u.id === id)
  if (!user) {
    return res.status(404).json({ error: "User not found" })
  }
  res.json(user)
})

app.put("/users/update", (req, res) => {
  const { id, username, age, gender, socialNetworks, interests } = req.body
  const user = users.find(u => u.id === id)
  if (!user) {
    return res.status(404).json({ error: "User not found" })
  }
  if (username) user.username = username
  if (age) user.age = age
  if (gender) user.gender = gender
  if (socialNetworks) user.socialNetworks = socialNetworks
  if (interests) user.interests = interests
  res.json(user)
})

app.post("/users/delete", (req, res) => {
  const { id } = req.body
  const index = users.findIndex(u => u.id === id)
  if (index === -1) {
    return res.status(404).json({ error: "User not found" })
  }
  users.splice(index, 1)
  res.json({ message: "User successfully deleted" })
});


// Interests CRUD Endpoints

// List all interests
app.get("/interests/list", (req, res) => {
  res.send(interests);
});

// Add interests for a user
app.post("/interests/add", (req, res) => {
  const { id, interests: newInterests } = req.body;
  const user = users.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  const userInterests = interests.find((i) => i.id === id);
  if (userInterests) {
    userInterests.interests.push(...newInterests);
  } else {
    interests.push({ id, interests: newInterests });
  }

  res.status(201).send({ id, interests: newInterests });
});

// Delete interests for a user
app.post("/interests/delete", (req, res) => {
  const { id } = req.body;
  const interestIndex = interests.findIndex((i) => i.id === id);
  if (interestIndex === -1) {
    return res.status(404).json({ error: "Interests not found." });
  }
  interests.splice(interestIndex, 1);
  res.send({ message: "Interests successfully deleted." });
});





// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
