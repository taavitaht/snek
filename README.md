# Snek

Snek is a multi or single player game to collect the most eggs before time runs out. But watch out, touching a wall, another player, or your own tail is lethal!

## Features:

Real-time multiplayer functionality
Interactive 
Bonuses
Confetti 


## Installation and Running

Follow the steps below to install and run the Bomberman-DOM game:

1. Clone the repository to your local machine:
   `git clone <repository-url>`

2. Navigate into the project folder:
   `cd WEB-GAME`

3. Install the required dependencies:
   `npm install`

4. Run the application:
   `node server.js`

5. Open your preferred browser and visit:
   [localhost:5000](http://localhost:5000)

## Usage

The game begins upon visiting the URL and joining the lobby with a username.
Navigate your snake using the keyboard arrow keys.
Press the 'esc' button to pause, then quit if desired.
Time remaining, score, and game updates are displayed at left. 

## Ngrok

First, download and install ngrok:
   `npm install ngrok`

Then sign up for a free account at https://ngrok.com/ and copy your authtoken from the Dashboard.

Run the following command to authenticate your account:
   `ngrok config add-authtoken YOUR_AUTHTOKEN`

To play online against others:
1. Start ngrok for port 5000

   `ngrok http 5000`
2. Copy the provided ngrok URL into the ngrok field of misc/gameSettings.js

   `// Ngrok link. Leave blank to only use localhost`
   
   `ngrok: "[your ngrok link]",`
3. Start the server as normal
4. Send the ngrok URL 