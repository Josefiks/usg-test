import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js"
import { getDatabase, ref, get, push, set, update, remove } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js"

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
const dataRef = ref(database, 'groups');

get(dataRef).then((snapshot) => {
    if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
            const group = childSnapshot.val()
            console.log(group.name, group.abbrevitation, group.logo, group.url)
            // const groupName = childSnapshot.val()
            // const groupUrl = childSnapshot.key
            // $('.data').append(`<div class="name">${ groupUrl }: ${ groupName }</div>`)
            $('.groups > .content').append(`
                <div class="group">
                    <img src="${ group.logo }" width="64px"/>
                    <div class="details">
                        <div class="name">
                            ${ group.name } <div class="abbrevitation">${ group.abbrevitation }</div>
                        </div>
                        <div class="description"></div>
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

// $('button').on('click', function(e) {
//     alert('ok')
// })

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

// const newDataRef = push(dataRef);
// set(newDataRef, {
//     "url": 'https://steamcommunity.com/groups/hack_er',
//     "name": 'Name',
//     "abbrevitation": 'Tag',
//     "description": 'Short description',
//     "logo": 'https://avatars.akamai.steamstatic.com/6b5e94eae524b06758e49649773f7efe5f900dc9_full.jpg'    
// })
// set(dataObj)

// $.ajax({
//     type: 'GET',
//     // https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=<your-api-key>&vanityurl=${groupVanityURL}
//     url: "https://steamcommunity.com/groups/hack_er/memberslistxml/?xml=1",
//     // url: "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=486F5359317236891FF4CB8DB158C49C&steamids=76561198107529407?method=getQuote&lang=en&format=jsonp&jsonp=?",
//     dataType:'xml',
//     // headers: {
//     //     'Access-Control-Allow-Credentials' : true,
//     //     'Access-Control-Allow-Origin':'*',
//     //     'Access-Control-Allow-Methods':'GET',
//     //     'Access-Control-Allow-Headers':'application/json',
                // 'Access-Control-Allow-Headers':'Content-Type, X-Auth-Token, Origin, Authorization'
//     // },
// }).done(function(data){
//     // const name = data["response"]["players"][0]["personaname"]
//     // const url = data["response"]["players"][0]["profileurl"]
//     // const avatar = data["response"]["players"][0]["avatarfull"]
//     console.log(data)
// })

const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
const rawGroupUrl = 'https://steamcommunity.com/groups/hack_er'
const targetUrl = 'https://steamcommunity.com/groups/hack_er/memberslistxml/?xml=1';

// $.ajax({
//     url: proxyUrl + targetUrl,
//     type: 'GET',
//     dataType: 'xml',
//     crossDomain: true,
//     headers: {
//       'X-Requested-With': 'XMLHttpRequest'
//     },
//     success: function(xmlString) {
//       // Handle the XML data as appropriate
//       var jsonText = JSON.stringify(xml2json(xmlString))
//       var parseJson = JSON.parse(jsonText)
//       console.log(parseJson.memberList)
//       const groupId = parseJson.memberList.groupID64
//       const memberCount = parseJson.memberList.memberCount
//       const avatarMedium = parseJson.memberList.groupDetails.avatarMedium
//       const avatarFull = parseJson.memberList.groupDetails.avatarFull
//       console.log(parseJson.memberList.groupDetails)
//     },
//     error: function(xhr, status, error) {
//       // Handle errors that occur during the API request
//       console.error(error)
//     }
// })

// Overlays
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
            url: createGroupInput.value,
            type: 'GET',
            dataType: "xml",
            crossDomain: true,
            headers: {
                'Access-Control-Allow-Credentials' : true,
                'Access-Control-Allow-Origin':'*'
            },
            // headers: {
            //   'X-Requested-With': 'XMLHttpRequest'
            // },
            success: function(data) { // xmlString
                const parser = new DOMParser();
                const htmlDoc = parser.parseFromString(data, 'xml');
                setTimeout(() => {
                    console.log(htmlDoc)
                    const name = htmlDoc.querySelector('.grouppage_resp_title')
                    const abbr = htmlDoc.querySelector('.grouppage_header_abbrev')
                    const membersCount = htmlDoc.querySelector('.count') 
                    const logo = htmlDoc.querySelector('.grouppage_logo > a::attr(href)')
                    console.log(name.firstChild.textContent)
                    console.log(abbr.textContent)
                    console.log(membersCount.textContent)
                    console.log(logo)
                }, 2000)
              // Handle the XML data as appropriate
            //   var jsonText = JSON.stringify(xml2json(xmlString))
            //   var parseJson = JSON.parse(jsonText)
            //   console.log(parseJson)
            //   console.log(parseJson.memberList.groupDetails)

            //     const newDataRef = push(dataRef);
            //     set(newDataRef, {
            //         "url": 'https://steamcommunity.com/groups/hack_er',
            //         "name": 'Name',
            //         "abbrevitation": 'Tag',
            //         "description": 'Short description',
            //         "logo": 'https://avatars.akamai.steamstatic.com/6b5e94eae524b06758e49649773f7efe5f900dc9_full.jpg'    
            //     })
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
