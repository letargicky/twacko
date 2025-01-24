const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const users = [];
const interests = []; 
app.use(express.json()); 

const configPath = path.join(__dirname, 'users.json');

//        ╦    ╔═╗  ╔═╗  ╦  ╔╗╔       ╦═╗  ╔═╗  ╔═╗  ╦  ╔═╗  ╔╦╗  ╔═╗  ╦═╗  
//        ║    ║ ║  ║ ╦  ║  ║║║  ───  ╠╦╝  ║╣   ║ ╦  ║  ╚═╗   ║   ║╣   ╠╦╝  
//        ╩═╝  ╚═╝  ╚═╝  ╩  ╝╚╝       ╩╚═  ╚═╝  ╚═╝  ╩  ╚═╝   ╩   ╚═╝  ╩╚═  - urobil Simon Marcinov
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'polia email a heslo su povinne.' });
  }

  fs.readFile(configPath, 'utf-8', (err, data) => {
    if (err) {
      console.error('nastal error pri citani konfiguracneho suboru:', err);
      return res.status(500).json({ error: 'problem sa serveri.' });
    }

    try {
      const config = JSON.parse(data);
      const user = config.users.find(
        (u) => u.email === email && u.password === password
      );

      if (user) {
        return res.status(200).json({ message: 'Prihlasenie bolo uspesne.' });
      } else {
        return res.status(401).json({ error: 'Nespravny email / heslo' });
      }
    } catch (parseErr) {
      console.error('chyba pri analyze konfiguracneho suboru:', parseErr);
      return res.status(500).json({ error: 'problem na serveri.' });
    }
  });
});

app.post('/register', (req, res) => {
  const { email, username, password, age, gender, socialNetworks, interests } = req.body;

  if (!email || !username || !password || !age || !gender || !socialNetworks || !interests) {
    return res.status(400).json({ error: 'vsetky polia su povinne.' });
  }
  if (isNaN(age) || age <= 0) {
    return res.status(400).json({ error: 'vek musi byt kladne cislo... wow.' });
  }
  const id = crypto.randomBytes(16).toString('hex');
  fs.readFile(configPath, 'utf-8', (err, data) => {
    if (err) {
      console.error('error pri analyze konfiguracneho suboru', err);
      return res.status(500).json({ error: 'problem na serveri.' });
    }

    try {
      const config = JSON.parse(data);
      if (config.users.some((u) => u.email === email)) {
        return res.status(409).json({ error: 'ucet s tym emailom uz existuje... nechcete sa skor prihlasit?' });
      }
      const newUser = { id, email, username, password, age, gender, socialNetworks, interests };
      config.users.push(newUser);
      fs.writeFile(configPath, JSON.stringify(config, null, 2), (writeErr) => {
        if (writeErr) {
          console.error('Error writing to config file:', writeErr);
          return res.status(500).json({ error: 'problem na serveri' });
        }
        return res.status(201).json({ message: 'zaregistrovali ste sa uspesne.', user: newUser });
      });
    } catch (parseErr) {
      console.error('Error parsing config file:', parseErr);
      return res.status(500).json({ error: 'problem na serveri' });
    }
  });
});


//        ╦ ╦  ╔═╗  ╔═╗  ╦═╗  ╔═╗
//        ║ ║  ╚═╗  ║╣   ╠╦╝  ╚═╗
//        ╚═╝  ╚═╝  ╚═╝  ╩╚═  ╚═╝  - urobil Peter Bednar

app.post("/users/create", (req, res) => {
  const { username, age, gender, socialNetworks, interests: userInterests } = req.body;

  if (!username || !age || !gender || !socialNetworks || !userInterests) {
    return res.status(400).json({ error: "chybaju vyplnene polia" });
  }

  const id = crypto.randomBytes(16).toString("hex");
  const newUser = { id, username, age, gender, socialNetworks, interests: userInterests };
  users.push(newUser);

  const existingInterestEntry = interests.find((entry) => entry.id === id);
  if (existingInterestEntry) {
    existingInterestEntry.interests = [...new Set([...existingInterestEntry.interests, ...userInterests])];
  } else {
    interests.push({ id, interests: userInterests });
  }
  res.status(201).json(newUser);
});

app.get("/users/list", (req, res) => {
  res.json(users);
});

app.get("/users/read", (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: "ID pouzivatela je pozadovane." });
  }

  const user = users.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ error: "pouzivatel nebol najdeny." });
  }

  res.json(user);
});

app.put("/users/update", (req, res) => {
  const { id, username, age, gender, socialNetworks, interests } = req.body;
  const user = users.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ error: "pouzivatel nebol najdeny." });
  }
  if (username) user.username = username;
  if (age) user.age = age;
  if (gender) user.gender = gender;
  if (socialNetworks) user.socialNetworks = socialNetworks;
  if (interests) user.interests = interests;
  res.json(user);
  res.json({ message: "pouzivatel bol aktualizovany." });
});

app.post("/users/delete", (req, res) => {
  const { id } = req.body;
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "pouzivatel nebol najdeny." });
  }
  users.splice(index, 1);
  res.json({ message: "pouzivatel bol vymazany uspesne" });
});


//        ╦  ╔╗╔  ╔╦╗  ╔═╗  ╦═╗  ╔═╗  ╔═╗  ╔╦╗  ╔═╗
//        ║  ║║║   ║   ║╣   ╠╦╝  ║╣   ╚═╗   ║   ╚═╗
//        ╩  ╝╚╝   ╩   ╚═╝  ╩╚═  ╚═╝  ╚═╝   ╩   ╚═╝ - urobil Jakub Knut

app.get("/interests/list", (req, res) => {
  res.send(interests);
});

app.post("/interests/add", (req, res) => {
  const { id, interests: newInterests } = req.body;
  const user = users.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ error: "pouzivatel nebol najdeny." });
  }

  const userInterests = interests.find((i) => i.id === id);
  if (userInterests) {
    userInterests.interests.push(...newInterests);
  } else {
    interests.push({ id, interests: newInterests });
  }

  res.status(201).send({ id, interests: newInterests });
});

app.post("/interests/delete", (req, res) => {
  const { id } = req.body;
  const interestIndex = interests.findIndex((i) => i.id === id);
  if (interestIndex === -1) {
    return res.status(404).json({ error: "zaluby neboli najdene" });
  }
  interests.splice(interestIndex, 1);
  res.send({ message: "zaluby pouzivatela boli vymazane uspesne." });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
