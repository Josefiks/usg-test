import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js"
import { getDatabase, ref, get, push, set, onValue, child } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js"

const firebaseConfig = {
    apiKey: "AIzaSyAPX5VHanXXxoG-cgrVqinSThMnVM4eMTo",
    databaseURL: "https://usgg-e71fc-default-rtdb.europe-west1.firebasedatabase.app",
    authDomain: "usgg-e71fc.firebaseapp.com",
    projectId: "usgg-e71fc",
    storageBucket: "usgg-e71fc.appspot.com",
    messagingSenderId: "867816290166",
    appId: "1:867816290166:web:bbb1f7ffddac8b6407ac57",
    measurementId: "G-FC83SVZ3HY"
}

const app = initializeApp(firebaseConfig)
const database = getDatabase()
const groupRef = ref(database, 'groups')
const visitorsRef = ref(database, 'visitors')

let browserId = localStorage.getItem('browserId')
if (!browserId) {
  browserId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  localStorage.setItem('browserId', browserId)
}

onValue(child(visitorsRef, browserId), (snapshot) => {
  if (!snapshot.exists()) {
    set(child(visitorsRef, browserId), {
      timestamp: Date.now()
    })
  }
})

onValue(visitorsRef, (snapshot) => {
  $('#visitors').html(snapshot.size)
}, (error) => {
  $('#visitors').html('N/A')
  console.error('Error retrieving visitor size:', error)
})

onValue(groupRef, (snapshot) => {
  $('#groups').html(snapshot.size)
}, (error) => {
  $('#groups').html('N/A')
  console.error('Error retrieving group size:', error);
})

get(groupRef).then((snapshot) => {
    if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
            const group = childSnapshot.val()
            console.log(group.name, group.abbrevitation, group.logo, group.url, )
            $('.groups > .content').append(`
                <div class="group">
                    <img src="${ group.logo }" width="32px"/>
                    <div class="details">
                        <div class="name">
                            ${ group.name }
                            <div class="abbrevitation">${ group.abbrevitation }</div>
                        </div>
                        <a class="members" href="${ group.url }/members" target="_blank">
                          <img src="images/groups.svg" width="23.26px"/> <b>${ group.members }</b>
                        </a>
                        <a class="url" href="${ group.url }" target="_blank">
                          <img src="images/url.svg"/>
                        </a>
                    </div>
                </div>
            `)
        })
    } else {
        $('.data').append(`<div class="name">No data available right now, sorry!</div>`)
    }
}).catch((error) => {
    console.error(error)
})

function xml2json(xml) {
    try {
      var obj = {};
      if (xml.children.length > 0) {
        for (var i = 0; i < xml.children.length; i++) {
          var item = xml.children.item(i);
          var nodeName = item.nodeName;
  
          if (typeof (obj[nodeName]) == "undefined") {
            obj[nodeName] = xml2json(item);
          } else {
            if (typeof (obj[nodeName].push) == "undefined") {
              var old = obj[nodeName];
  
              obj[nodeName] = [];
              obj[nodeName].push(old);
            }
            obj[nodeName].push(xml2json(item));
          }
        }
      } else {
        obj = xml.textContent;
      }
      return obj;
    } catch (e) {
        console.log(e.message);
    }
}

const proxyUrl = 'https://cors-anywhere.herokuapp.com/';

const addGroup = document.getElementById('addGroup')
const createGroup = document.getElementById('createGroup')
const overlay = document.getElementById('overlay')
const closeButton = document.getElementById('close-button')

addGroup.addEventListener('click', () => {
  overlay.classList.add('active');
})
createGroup.addEventListener('click', () => {
    const createGroupInput = document.getElementById('createGroupInput')
    // console.log(createGroupInput.value)
    if (createGroupInput.value.includes('https://steamcommunity.com/groups/')) {
        $.ajax({
            url: proxyUrl + createGroupInput.value + '/memberslistxml/?xml=1',
            type: 'GET',
            dataType: 'xml',
            crossDomain: true,
            headers: {
            'X-Requested-With': 'XMLHttpRequest'
            },
            success: function(xmlString) {
                $.ajax({
                    url: proxyUrl + createGroupInput.value,
                    type: 'GET',
                    crossDomain: true,
                    success: function(data) {
                        const parser = new DOMParser()
                        const htmlDoc = parser.parseFromString(data, 'text/html')
                        setTimeout(() => {
                            console.log(htmlDoc)
                            const abbr = htmlDoc.querySelector('.grouppage_header_abbrev')
                            var jsonText = JSON.stringify(xml2json(xmlString))
                            var parseJson = JSON.parse(jsonText)
                            console.log(parseJson)
                            const name = parseJson.memberList.groupDetails.groupName
                            const groupId = parseJson.memberList.groupID64
                            const memberCount = parseJson.memberList.memberCount
                            const avatarMedium = parseJson.memberList.groupDetails.avatarMedium
                            const avatarFull = parseJson.memberList.groupDetails.avatarFull
                            console.log(name, abbr.textContent, groupId, memberCount, avatarFull)


                            get(groupRef)
                            .then((snapshot) => {
                              if (snapshot.exists()) {
                                const groups = snapshot.val();
                                const duplicateGroup = Object.values(groups).find((group) => group.groupId === groupId);
                                if (duplicateGroup) {
                                  console.log('Group with name already exists');
                                } else {
                                    const newgroupRef = push(groupRef)
                                    set(newgroupRef, {
                                        "groupId": groupId,
                                        "url": createGroupInput.value,
                                        "name": name,
                                        "abbrevitation": abbr.textContent,
                                        "logo": avatarFull,
                                        "members": memberCount,
                                        "pinned": false,
                                        "boosted": false
                                    })
                                }
                              } else {
                                console.log('No groups exist');
                              }
                            })
                            .catch((error) => {
                              console.log('Error getting groups:', error);
                            });
                            // get(groupRef).orderByChild('id').equalTo(groupId).once('value', snapshot => {
                            //     if (!snapshot.exists()) {
                            //       // Item with the URL does not exist, push the new item
                            //       const newgroupRef = push(groupRef).then(() => {
                            //             set(newgroupRef, {
                            //                 "url": createGroupInput.value,
                            //                 "name": name,
                            //                 "abbrevitation": abbr.textContent,
                            //                 "logo": avatarFull,
                            //                 "members": memberCount,
                            //                 "pinned": false,
                            //                 "boosted": false
                            //             })
                            //         })
                            //         .catch(error => console.log('Error adding item:', error));
                            //     } else {
                            //       console.log('Item with URL already exists');
                            //     }
                            //   });
                        }, 2000)
                      // Handle the XML data as appropriate
                    //   var jsonText = JSON.stringify(xml2json(xmlString))
                    //   var parseJson = JSON.parse(jsonText)
                    //   console.log(parseJson)
                    //   console.log(parseJson.memberList.groupDetails)
        
                    //     const newgroupRef = push(groupRef);
                    //     set(newgroupRef, {
                    //         "url": 'https://steamcommunity.com/groups/hack_er',
                    //         "name": 'Name',
                    //         "abbrevitation": 'Tag',
                    //         "description": 'Short description',
                    //         "logo": 'https://avatars.akamai.steamstatic.com/6b5e94eae524b06758e49649773f7efe5f900dc9_full.jpg'    
                    //     })
                    },
                    complete: function (data) {
                        overlay.classList.remove('active')
                    },
                    error: function(xhr, status, error) {
                      // Handle errors that occur during the API request
                      console.error(error)
                    }
                })

            },
            error: function(xhr, status, error) {
                // Handle errors that occur during the API request
                console.error(error)
            }
        })
    } else {
        $('#createGroupInput').after('<div class="error">Type correct group url!</div>')
    }
})
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) {
    overlay.classList.remove('active');
  }
})

closeButton.addEventListener('click', () => {
  overlay.classList.remove('active');
})
