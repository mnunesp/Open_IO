
![Open IO](public/pictures/open_io_logo.png)


Open IO is an online multiplayer IO snake game that uses javascript, react, Node.js, and Socket.io

# Resources
Blog: https://rcos.io/projects/gibboa/open_io/blog <br/>
Website: https://rcos.io/projects/gibboa/open_io/profile <br/>
Repository: https://github.com/gibboa/Open_IO <br/>

# Learning javascript, react, Node.js, and Socket.io
The Basics (Youtube Playlist): <br/> 
https://www.youtube.com/playlist?list=PLPgx4r0FGixlivPRCBuMP0H2WPaEShrlU
<br/>
Helpful Online Multiplayer/Socket.io tutorials <br/> 
https://hackernoon.com/how-to-build-a-multiplayer-browser-game-4a793818c29b <br/>
https://gamedevacademy.org/create-a-basic-multiplayer-game-in-phaser-3-with-socket-io-part-1/ <br/>
http://buildnewgames.com/real-time-multiplayer/ <br/>

For more detailed information (with sample code) on how to learn the technologies used in this project,
visit out [Learning Resources](https://github.com/gibboa/Open_IO/tree/master/LearningResources) section.

# Setting Up (Windows, MacOS)
1. Get Node.js
	1. Visit https://nodejs.org/en/
	2. Download Node 10.15.3 from the website.
	![nodejs_website](images/nodejs_website.png)
	3. Once, downloaded, double click to install.
	4. The Node.js Setup Wizard will appear. Follow the instructions to Install.
	![nodejs_wizard](images/nodejs_wizard.png)


2. Check if Node.js and npm are successfully installed. <br/>
	**On Windows 10** <br/>
	If successfully installed, running "node -v" in Command Prompt will show your version of Node and running "npm -v" will show your version of npm (your version should be different than the one in the image). <br/>
	![version_windows](images/version_windows.png)

	**On Mac OSX** <br/>
	If successfully installed, running "node -v" in Terminal will show your version of Node and running "npm -v" will show
	your version of npm (your version should be different than the one in the image). <br/>
	![version_mac](images/version_mac.png)



# Setting Up (Linux)

1. Get Node.js <br/>
	**Debian, Ubuntu, Linux Mint** <br/>
	$ sudo apt-get install nodejs npm

	**RHEL, CentOS** <br/>
	$ sudo yum install epel-release

	**Fedora** <br/>
	$ sudo dnf install nodejs npm

	**Arch Linux** <br/>
	$ sudo pacman -S nodejs npm

2. Check if Node.js and npm are successfully installed. <br/>
	If successfully installed, running "node -v" in Terminal will show your version of Node and running "npm -v" will show your version of npm (your version should be different than the one in the image).


# Running Open IO
1. Clone Open IO From GitHub

	Download from https://github.com/gibboa/open_io or clone with "git clone https://github.com/gibboa/Open_IO.git"

2. Running Open IO
	1. From your command line, go to the Open IO directory.
	2. Run the command "node server.js" to start Open IO.
	3. You will receive the port where it is viewable. In the image below, the port is 8081.
	![port](images/port.png)
	4. In your web browser, visit "localhost:x" (x is the port number).
	![url](images/url.png)
	5. You should now see Open IO running.
