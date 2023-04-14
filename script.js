import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js"
import { getDatabase, limitToLast, endBefore, orderByChild, startAfter, limitToFirst, query, startAt, endAt, orderByKey, ref, get, push, set, onValue, child } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js"

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

// Visitors
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

// Groups
onValue(query(groupRef), (snapshot) => {
  $('#groupsCount').html(snapshot.size)
  $('#groups > .content > .loading').css({'display': 'flex'})
  $('#groups > .content').html('')
  snapshot.forEach((group) => {
    const groupData = group.val()
    $('#groups > .content').prepend(`
      <div class="group">
          <img src="${ groupData.logo }" width="32px"/>
          <div class="details">
              <div class="name">
                  ${ groupData.name }
                  <div class="abbrevitation">${ groupData.abbrevitation }</div>
              </div>
              <a class="members" href="${ groupData.url }/members" target="_blank">
                <img src="images/groups.svg" width="23.26px"/> <b>${ groupData.members }</b>
              </a>
              <a class="url" href="${ groupData.url }" target="_blank">
                <img src="images/url.svg"/>
              </a>
          </div>
      </div>
    `)
  })
  $('#groups > .content > .loading').css({'display': 'none'})
}, (error) => {
  $('#groupsCount').html('N/A')
  console.error('Error retrieving group size:', error);
})

// Groups extend on scroll


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

const proxyUrl = 'https://api.codetabs.com/v1/proxy/?quest=';

const addGroup = document.getElementById('addGroup')
const createGroup = document.getElementById('createGroup')
const overlay = document.getElementById('overlay')
const closeButton = document.getElementById('close-button')
const genButton = document.getElementById('gen-button')

addGroup.addEventListener('click', () => {
  overlay.classList.add('active');
})
createGroup.addEventListener('click', () => {
    const createGroupInput = document.getElementById('createGroupInput')
    // console.log(createGroupInput.value)
    if (createGroupInput.value.includes('https://steamcommunity.com/groups/')) {
      $('#createGroup').html('<img src="images/loading.svg" height="41px"/>').prop('disabled', true);
      $.ajax({
          url: proxyUrl + createGroupInput.value,
          type: 'GET',
          crossDomain: true,
          success: function(data) {
              const parser = new DOMParser()
              const htmlDoc = parser.parseFromString(data, 'text/html')
              setTimeout(() => {
                try {
                  const isPublic = htmlDoc.querySelectorAll('.grouppage_join_area > a').length
                  if(isPublic == true) {
                    const url = htmlDoc.querySelectorAll('#join_group_form')[0].attributes[3].nodeValue
                    const name = htmlDoc.querySelectorAll('.grouppage_header_name')[0].firstChild.data
                    const abbr = htmlDoc.querySelector('.grouppage_header_abbrev').textContent
                    const logo = htmlDoc.querySelectorAll('.grouppage_logo > img')[0].src
                    const members = htmlDoc.querySelectorAll('.members > a > .count')[0].innerHTML
                    get(groupRef).then((snapshot) => {
                      // if (snapshot.exists()) {
                        const groups = snapshot.val()
                        const duplicateGroup = Object.values(groups).find((group) => group.url === createGroupInput.value)
                        if (duplicateGroup) {
                          console.error('This group already exists.')
                        } else {
                            // const newgroupRef = push(groupRef)
                            set(push(groupRef), {
                                "url": url,
                                "name": name,
                                "abbrevitation": abbr,
                                "logo": logo,
                                "members": members,
                                "pinned": false,
                                "boosted": false,
                                "timestamp": Date.now()
                            })
                        }
                    })
                    overlay.classList.remove('active')
                    createGroupInput.value = ''
                  } else {
                    $('.addGroupForm').after('<div class="error">This group is private, we are collecting only public ones!</div>')
                  }
                  $('#createGroup').html('<b>Add</b><img src="images/g-add.svg" height="18px"/>').prop('disabled', false);
                } catch(error) {
                  console.error("Something is wrong. Try once again! ..or come back later!")
                }             
              }, 2000)
          },
          error: function(xhr, status, error) {
            // Handle errors that occur during the API request
            console.error("ERROR!",error)
          }
      })
    } else {
        $('.addGroupForm').after('<div class="error">Type correct group url!</div>')
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

genButton.addEventListener('click', () => {
  console.log('generator button clicked')
  var audio = new Audio("sounds/release.ogg");
  audio.volume = 0.3;
  audio.play();
})

