var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);


// Functions that check whether the current player is colliding with either the gameboard
// boundaries, any of the other players, or any of the food objects

function check_overlap(x1, y1, x2, y2, rad){
  if ( (x1+rad >= x2-rad && x1+rad <= x2+rad) || (x1-rad <= x2+rad && x1+rad >= x2-rad) ) {
    if ( (y1+rad >= y2-rad && y1+rad <= y2+rad) || (y1-rad <= y2+rad && y1-rad >= y2-rad) ){
      return true;
    }
  }
  return false;
}
// checkCollision_Board takes a player p1 and gameboard g and returns true if p1
// has hit the boundaries of g
function checkCollision_Board(p1,g) {
  if (p1.pos_list[0][0]+5 >= g.board.x || p1.pos_list[0][1]+5 >= g.board.y) {return true;}
  else if (p1.pos_list[0][0]-5 <= 0 || p1.pos_list[0][0]-5 <= 0) {return true;}
  return false;
}

// checkCollision_Player takes two players p1 and p2 and returns true if p1 hits the hitbox of p2
function checkCollision_Player(p1, p2) {
  for (var i = 0; i < p2.pos_list.length; i++) {
    if (check_overlap(p1.pos_list[0][0], p1.pos_list[0][1], p2.pos_list[i][0], p2.pos_list[i][1], 5) == true){
      return true;
    }
  }
  return false;
}

// checkCollision_Food takes a player p1 and a list of food objects foods and returns true if p1
// hits any one of the the objects in foods
function checkCollision_Food(p1, foods) {
  return check_overlap(p1.pos_list[0][0], p1.pos_list[0][1], foods.x, foods.y, 5);
}


// ======================================================================================================
function convertFood(p1, g){
    //console.log("p1.length: " + p1.length + "\n");
  for (var i = 0; i < p1.length; i+=2) {
      //console.log("i: " + i);
    var food_temp = { x:p1.pos_list[i][0], y:p1.pos_list[i][1] };
    g.foods.push(food_temp);
  }
  //console.log("\n");
}

function checkGameEvents(p1, g){
  if (checkCollision_Board(p1, g)) {
      console.log("q\n");
    p1.alive = false;
    convertFood(p1,g);
  }

  for (var i = 0; i < g.players.length; i++) {
    if (checkCollision_Player(p1,g.players[i])){
      p1.alive = false;
      g.players[i].score += 100;
      convertFood(p1,g)
    }
  }

  for (var i = 0; i < g.foods.length; i++) {
    if (checkCollision_Food(p1, g.foods[i])){
      p1.score += 10;
      g.foods.splice(i, 1);
      p1.path_len += 6;
      console.log("p1.length: " + p1.length + " * 6 = " + (p1.path[p1.length*6]));
      console.log("p1.path[p1.length*6][0]: " + p1.path[p1.length*6][0]);
      //console.log("p1.path: " + p1.path);
      p1.pos_list.push([p1.path[p1.length*6][0], p1.path[p1.length*6][1]]);
      p1.length += 1;
      addFood(g.foods);
    }
  }
}


//Function to convert key codes to direction strings
//Args: int keyCode
//Returns: string containing relevant direction
//if key is not a,w,s,d,up,down,left,right string will be empty
function keyToDir(keyCode){
//keyCode Reference for likely keys:
//'w'=87, 'a'=65, 's'=83, 'd'=68, SHIFT=16, SPACE=32, 'e'=69, 'q'=81
//UP=38, DOWN=40, LEFT=37, RIGHT=39, ENTER=13
    switch (keyCode) {
        case 87: return('up'); break; 
        case 83: return('down'); break; 
        case 68: return('right'); break; 
        case 65: return('left'); break; 
        case 38: return('up'); break; 
        case 40: return('down'); break; 
        case 39: return('right'); break; 
        case 37: return('left'); break; 
        default: return(''); //uncomment to check other key codes
    }
}

//Function to randomly choose an initial direction for a snake
//Args: none
//Returns: string: 'up', 'down', 'left', 'right'
function initSnakeDirection(){
  let randNum = Math.floor(Math.random() * Math.floor(4));//returns 0,1,2, or 3
  let dir = '';
  switch (randNum) {
    case 0: dir = 'up'; break;
    case 1: dir = 'right'; break;
    case 2: dir = 'down'; break;
    case 3: dir = 'left'; break;   
  }
  return dir;
}

//Function to randomly select color/skin of snake
//Returns an int 1,2,3 since there are only three skins right now
//Args: none
function initColor(){
  return Math.floor(Math.random() * Math.floor(3)) + 1 
}


//Function to add a single food after one has been eaten
//Args: food list
//Returns: none
//Modifies: food list
function addFood(f){
  let locationsNotValidated = true;
  while(locationsNotValidated){
    let fx = Math.floor(Math.random() * 628) + 6; //current board is 640px X 640px so
    let fy = Math.floor(Math.random() * 628) + 6; //place player randomly between 160px-480px
    let currFoodValid = true
    for(let i=0; i<f.length; i++){
      if(check_overlap(fx, fy, f[i].x, f[i].y, 6)){
        currFoodValid = false;
      }
    }
    if(currFoodValid){
      f.push({x:fx, y:fy}); 
    }
    if(f.length >= 10){
      locationsNotValidated = false;
    }
  }
}

//Function to initialize a list of 10 foods when games starts
//Food will be within 6px of the edge and will not overlap with 
//any other food
//Args: (game) but going global to be safe
//Returns:
//Modifies: game.foods
function initFoods(g){
  var arr = [];
  let locationsNotValidated = true;
  while(locationsNotValidated){
    let fx = Math.floor(Math.random() * 628) + 6; //current board is 640px X 640px so
    let fy = Math.floor(Math.random() * 628) + 6; //place player randomly between 160px-480px
    let currFoodValid = true
    for(let i=0; i<arr.length; i++){
      if(check_overlap(fx, fy, arr[i].x, arr[i].y, 6)){
        currFoodValid = false;
      }
    }
    if(currFoodValid){
      arr.push({x:fx, y:fy}); 
    }
    if(arr.length >= 10){
      locationsNotValidated = false;
    }
  }
  g.foods = arr;
}


//Function to generate initial array of locations for a snake
//as well as the initial direction of the snake at random
//Args: desired start length of snake, players list to check for
//      collisions with other snakes (initially I wanted to take an
//      empty array, arr, as an arg and return by reference but
//      it wasnt working so now we create arr and return directly)
//Returns: array of locations (by reference)
//playersObj may need to be whole game object (this function needs to
// call the collision detection functions, so it requires the same things)
//Requires: length is set, directions is set, arr is empty
function initSnakeLocations(/*arr,*/ length, direction/*, playersObj*/){
  var arr = [];
  let locationsNotValidated = true;
  while(locationsNotValidated){
    //generate length many locations specified direction
    let x = Math.floor(Math.random() * 320) + 160; //current board is 640px X 640px so
    let y = Math.floor(Math.random() * 320) + 160; //place player randomly between 160px-480px (not too close to edge)
    let tmp_arr = [];
    tmp_arr.push([x,y]);
    let i;
    for(i=1; i<length; i++){
      //generating points points based on direction, points are 5 px apart
      let offset = i*6;
      switch (direction) {
        case 'up': tmp_arr.push( [ x, (y+offset) ] ); break;
        case 'right': tmp_arr.push( [ (x-offset), y ] ); break;
        case 'down': tmp_arr.push( [ x, (y-offset) ] ); break;
        case 'left': tmp_arr.push( [ (x+offset), y ] ); break;   
      }
    }
    //call collision detection on each location
    let validated = true;
    for(i=0; i<length; i++){
      //LEAVING IT OUT FOR NOW but for each point in tmp_arr check that its not on top of another snake
      //also we need to consider speed and timing... this collision detection will likely need to look for wide
      //open spaces so that new snakes dont die instantly and old snakes dont have new snakes spawning
      //in front of them out of nowhere... would kinda ruin the game
      //detectCollision(tmp_arr[i][0], tmp_arr[i][1], playersObj); ... or wutever
      //if any location fails, then validated will be turned to valse
    }
    //if all locations are valid, then save to exit loop, else generate new random locations
    if(validated){
      locationsNotValidated = false; //the locs are valid, loop will exit
      arr = tmp_arr;
    }
  }//end while
  return arr;
}

//Function to create initial path for snake's body segments
//Requires: snakes pos_list has been initialized
//Args: snake length, direction, pos_list of snake
//Returns: array of coords (a path the snake as traveled and which
//body segments must travel to follow the head)
function initPath(length, dir, arr){
  var tmp_path = [];
  let i;
  let px_len = (length * 6) + 1; //should be 25 with 4 segment length
  //start by storing head in x,y and adding to path
  let x = arr[0][0];
  let y = arr[0][1];
  tmp_path.push([x,y]);
  for(i=1; i<px_len; i++){
    //generating points points based on direction, points are 1 px apart
    switch (dir) {
      case 'up': 
        y = y - 1;
        tmp_path.push([x,y]);
        break;
      case 'right': 
        x = x + 1;
        tmp_path.push([x,y]);
        break;
      case 'down': 
        y = y + 1;
        tmp_path.push([x,y]);
        break;
      case 'left': 
        x = x - 1;
        tmp_path.push([x,y]);
        break;   
      }
    }
    //theoretical assert(tmp_path.length == 25)
    return tmp_path;
}

//Function to move snake forward one unit
//Args: reference to game object
//Returns: none, changes made to referenced object
//Requires: game is initialized
//function moveSnakes(game){
function moveSnakes(){
    //arbitraily going to move the snake 1px...no clue how this will go
    for(var key in game.players) {
        let change_x = 0, change_y = 0;
        cur_dir = game.players[key].direction
        if(cur_dir == 'up'){//up
            change_y = -1;
        }else if(cur_dir == 'right'){//right
            change_x = 1;
        }else if(cur_dir == 'down'){//down
            change_y = 1;
        }else{//left
            change_x = -1;
        }

        game.players[key].pos_list[0][0] += change_x * 2;
        game.players[key].pos_list[0][1] += change_y * 2;
        //push new loc to front of path queue
        game.players[key].path.unshift([game.players[key].pos_list[0][0],game.players[key].pos_list[0][1]]);
        
        //loop through segment coords and get new coord off path
        for(let i=1; i < game.players[key].length; i++){
            game.players[key].pos_list[i][0] = game.players[key].path[i*6][0];
            game.players[key].pos_list[i][1] = game.players[key].path[i*6][1];
        }

        if(game.players[key].path.length > game.players[key].path_len){
          //we dont need to store extra coords until another segment is add
          //which means we have enough room to add a segment if needed
          game.players[key].path.pop();//so pop last value
        }
          //DONT HAVE TO DO NE OF THIS NEMORE BAHAHAHAHAHAHAA...
          //some thoughts on how to get the snake segments to follow the path of the head
          //maybe save the position whenever there is a change in direction and until you reach
          //that position, you dont change direction (every segment needs a direction)
          //OK HERES THE PLAN
          //currently position list is [[x,y]]
          //it will become [[x,y,curr_direction, new_direction_set-->true/false, new_direction, turn_at_x, turn_at_y]]
          //so if pos_list[3] is false, we dont need to worry about turning the snake
          //1. whenever a snake turns, the turn propagates down the body,
          //   so when the head turns, pass data to the segment behind it
          //   pos_list[3] = true, pos_list[4] = direction curr segment is turning to
          //   pos_list[5] = x coord where next turn takes place, pos_list[6] = y coord of next turn
          //2. before moving a segment, IF pos_list[3]==true AND curr position x,y == turn_at x,y
          //   THEN change the curr direction of segment to new_direction
          //3. propagate turn back following segment if one exists
          //3. move segment in curr direction which was just updated from the old one... 
    }
}


///////////////////////Game Object Creation////////////////////////////////////
var game = {
    players: {},
    foods: [],
    board: {x: 640, y: 640} 
};

initFoods(game);
//players object contains the state of all connected players
//maps socket.id to the dictionary-structy-like collection:
//described in more detail in GameStructures.txt in repo
//var players = {};

var game_serv = {};

//creating global input queue
//relevant array functionality:
//unshift(): add to front (returns new length of array if you want)
//pop(): remove from back (returns value removed)
//length: returns length
var inputQueue = []

app.use(express.static(__dirname + '/public'));
 
app.get('/', function (req, res) {
  	res.sendFile(__dirname + '/public/proto_index.html');
});

var update_count = 0; //global var to trigger authoritative updates
//gamestate is update every 15ms, but we will only send updates every 45 ms
//so this counter will be used to trigger updates every three runs



//attempting to write game loop in a setInterval func... 
//setInterval(function(inputQueue, game){
setInterval(function(){
  //console.log("in the udpate loop" + " the counter is " + update_count);
    //NOTE: node is not multithreaded so the queue is safe within the scope of this function
    //console.log("game: " + game.toString());
    if(game){
      //console.log("game is set");
         //1. UPDATE PLAYER DIRECTIONS BASED ON INPUTS
        let i;
        let len = 0;
        if(game.players){
            len = inputQueue.length;
        }
        for(i = 0; i < len; i++){
          //console.log("we must have had an input");
            let input = inputQueue.pop();//input is [socket.id, key_code]
            //process each input (only inputs are direction changes right now)
            game.players[input[0]].direction = keyToDir(input[1]);
        }

        //2. UPDATE PLAYER LOCATIONS BASED ON DIRECTION
        //moveSnakes(game);
        moveSnakes();

        //3. UPDATE PLAYERS BASED ON GAME EVENTS (check various types of collisions)
        //change score, aliveness, length, food locations
        for(var id in game.players){
          checkGameEvents(game.players[id], game);
        }
        
        //THIS IS IMPORTANT But i want to speed it up w/o breaking stuff, temporarily moving emit out of if
        io.sockets.emit('authoritativeUpdate', game);
        update_count++;//we want three updates per emit so heres where we track it
        if(update_count == 3){
            //emit new current authoritative gamestate (by sending entire game object?)
            //io.sockets.emit('authoritativeUpdate', game);
            update_count = 0;
        }
    } 

}, 1000/15);// call func every 15 ms


//ALL SERVER EVENT LISTENERS ARE CALLED ON CONNECTION WITHIN THIS FUNCTION
io.on('connection', function (socket) {
	
	
	//var game_server = require('./public/js/game_server.js');
	//game_serv = new game_server();
	
	   
  	console.log('a user connected with socket id: ' + socket.id );
    //let the player know what its ID is in the game obj
    io.sockets.emit('passID', socket.id);

    //on connections generate a random snake for new player
    
    snakeLen = 4;//set initial length to whatever we want
    
    //first pick a direction at random:
    var snakeDir = initSnakeDirection();
    
    var snakeLocs = initSnakeLocations(snakeLen, snakeDir);//building intital array of snake locations
    
    var snakePath = initPath(snakeLen, snakeDir, snakeLocs);//building intital path for segments to follow

  	game.players[socket.id] = {
      pos_list: snakeLocs,
    	playerId: socket.id,
    	name: 'Guest', //changes on connection via 'initPlayer' message
      direction: snakeDir, 
      length: snakeLen,
      score: 0,
      velocity: 1, //dont know what to put for this yet
      //Here color will be a random int, and there are 3 colors on the sprite sheet
      color: initColor(),
      status: true,
      path: snakePath,
      path_len: 25
  	};
     if(game){
        console.log("THE GAME IS SET IN THE INIT FUNCTION");
      }

  	socket.on('initPlayer', function(data){//initPlayer emitted after player recieves CONNACK
  		//change name in player object
  		game.players[socket.id].name = data.playerName;//data.playerName is incomeing info from client
      
      //logs for testing:
  		console.log('player name, ' + data.playerName + ' recieved from ' + socket.id +', updating player object');
  		console.log('Player ' + socket.id + ' name updated to ' + game.players[socket.id].name);
		  console.log(game.players[socket.id].name + "'s initial direction is: " + game.players[socket.id].direction );
		  console.log(game.players[socket.id].name, "location array is:", game.players[socket.id].pos_list);

  	});

  	//update all other players of the new player
  	//socket.broadcast.emit('newPlayer', players[socket.id]);

  	//when the client emits a 'playerMovement' msg we catch the data here
  	socket.on('playerMovement', function(data){
  		//naive implementation would just send updated gamestate to all players right here
      //test code:
  		console.log('player', socket.id, 'changed direction to', data.input);
  		io.sockets.emit('gameStateUpdate', game.players[socket.id].name + "'s direction changed...");
		
      inputQueue.unshift([socket.id, data.input]);//data.input is a number (key code)

		// Send message to game server
		//game_serv.message("playerMovement", data);
		
  	});

  	//send the players object to the new player
  	//socket.emit('currentPlayers', players);
  
  	socket.on('disconnect', function () {
    	console.log('user '+ socket.id +' disconnected');
    	//remove this player from our players object
    	delete game.players[socket.id];
    	io.emit('disconnect', socket.id);
  	});
  
});

server.listen(8081, function () {
  	console.log(`Listening on ${server.address().port}`);
});