const express = require('express')
const crypto = require('crypto')
const cors = require('cors')
const fs = require('fs');
const path = require('path');

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

// Login endpoint
app.get('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email a heslo su povinne.' });
    }

    // Precitaj aktualnych pouzivatelov zo suboru
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Nepodarilo sa precitat data o pouzivateloch.' });
        }

        const users = JSON.parse(data || '[]');
        const user = users.find(user => user.email === email);

        if (!user) {
            return res.status(400).json({ message: 'Nespravny email alebo heslo.' });
        }

        // Porovnaj heslo
        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Nespravny email alebo heslo.' });
        }

        res.status(200).json({ message: 'Prihlasenie bolo uspesne.' });
    });
});

app.post('/register', (req, res) => {
    const { email, username, password, age, gender, socialNetworks, interests } = req.body;

    if (!email || !username || !password || !age || !gender || !socialNetworks || !interests) {
        return res.status(400).json({ message: 'Vsetky polia su povinne.' });
    }

    // Precitaj aktualnych pouzivatelov zo suboru
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Nepodarilo sa precitat data o pouzivateloch.' });
        }

        const users = JSON.parse(data || '[]');
        const existingUser = users.find(user => user.email === email);

        if (existingUser) {
            return res.status(400).json({ message: 'Pouzivatel uz existuje.' });
        }

        // Zahashuj heslo a uloz noveho pouzivatela
        const hashedPassword = bcrypt.hashSync(password, 10);
        users.push({
            email,
            username,
            password: hashedPassword,
            age,
            gender,
            socialNetworks,
            interests
        });

        fs.writeFile(dataFilePath, JSON.stringify(users, null, 2), err => {
            if (err) {
                return res.status(500).json({ message: 'Nepodarilo sa ulozit data o pouzivateloch.' });
            }
            res.status(201).json({ message: 'Pouzivatel bol uspesne zaregistrovany.' });
        });
    });
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

// Login/Register Endpoints

// Register a new user
app.post("/auth/register", (req, res) => {
  const { username, email, password } = req.body;
  if (users.find((u) => u.email === email)) {
    return res.status(400).json({ error: "Email is already registered." });
  }
  const id = crypto.randomBytes(16).toString("hex");
  const newUser = { id, username, email, password };
  users.push(newUser);
  res.status(201).send(newUser);
});

// Login an existing user
app.get("/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }
  const token = crypto.randomBytes(16).toString("hex");
  sessions.push({ id: user.id, token });
  res.send({ message: "Login successful.", token });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
