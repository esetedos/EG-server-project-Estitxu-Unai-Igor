const User = require('../../src/services/userServices')
const artifactService = require('../../src/services/artifactService')
const searchService = require('../../src/services/searchService')

const getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.getAllUsers();
    // console.log(allUsers)
    return allUsers;
    // res.send({ status: "OK", data: allUsers });
  } catch (error) {
    console.log(error);
    res.status(error?.status || 500).send({
      status: 'FAILED',
      message: 'Error al realizar la petición:',
      data: { error: error?.message || error },
    });
  }
};


events = (socket) => {

    console.log({ Clientsocket: socket.id });
    socket.emit("new_user", socket.id);
    // TEST BROADCAST
    socket.on('test_broadcast', async (data) => {
      try {
        socket.broadcast.emit('test_broadcast', data);
        console.log('************ TEST BROADCAST ***********')
        console.log(data)
      } catch (error) {
        console.log(error);
        socket.emit('test_broadcastError', error);
      }
    });



    socket.on('disconnect', () => {
      console.log('Client disconnected: ', socket.id);
    });

    //emit
    socket.emit("hello", "world");

    //listen
    socket.on("hello", (arg) => {
      console.log(arg); // world
    });


    //LogState
    let token={token: ""};
   
    socket.on("logstate", async (arg) => {
      try {
        // const k = await User.getAllUsers();
        // console.log(k);
        console.log(arg); // id and true/false
        token.token  =arg;
        console.log(token)
        const decodedUser = await User.verifyUser(token);
        decodedUser.push({logstate: true})
        console.log(decodedUser)
        socket.to(socket.id).emit("logstate", decodedUser);

      } catch (error) {
        console.log(error);
        console.log("there is no email or losState")
        socket.emit('logstateError', error);
      }
    });

  
    socket.on("search", async (searchState) => {
      try{
        await searchService.updateStatus(searchState) //update to search new state
        socket.emit("search", searchState)
      }
      catch(error){
        const searchError = {searchError: "Server not reached."}
        socket.emit("error", searchError)
      }
    })

    socket.on("artifacts", async (artifactsArray) =>{
      try{
        const updatedArtifacts = await artifactService.updateArtifacts(artifactsArray)
      }
      catch (error){

      }

    })
  }

  exports.socketEvents = events;


