const User = require('../../src/services/userServices')
const artifactService = require('../../src/services/artifactService')
const searchService = require('../../src/services/searchService')



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
        console.log('****** SEARCH EVENT **********')
        await searchService.updateStatus(searchState) //update to search new state
        socket.broadcast.emit("search", searchState)
      }
      catch(error){
        socket.emit("error", error)
      }
    })

    socket.on("artifacts", async (allData) =>{
      try{
        let data = allData;
        let foundData = data.pop();
        let artifactsArray = data;

        console.log('************ DATA **************')
        console.log(data)
        console.log('************ FOUND DATA **************')
        console.log(foundData)
        console.log('************ ARTIFACTS ARRAY *********')
        console.log(artifactsArray)
        console.log('************ ALL DATA ****************')
        console.log(allData)

        artifactsArray.forEach(artifact => {
          if(foundData.isFound === true && artifact.name === foundData.artifactName){
            artifactService.updateArtifact(foundData.artifactName, true, foundData.foundByEmail)
          }
          // else{
          //   artifactService.updateArtifact(artifact.name, false, null);
          // }

        });
        socket.emit("artifacts", artifactsArray)

      }
      catch (error){
        let data = allData;
        let foundData = data.pop();
        let artifactsArray = data;
        socket.emit("error", error)
        console.error('***************** ERROR IN ARTIFACT UPDATE*****************')
        console.log(error)
        console.log('************ DATA **************')
        console.log(data)
        console.log('************ FOUND DATA **************')
        console.log(foundData)
        console.log('************ ARTIFACTS ARRAY *********')
        console.log(artifactsArray)
        console.log('************ ALL DATA ****************')
        console.log(allData)
      }

    })

  }

  exports.socketEvents = events;



